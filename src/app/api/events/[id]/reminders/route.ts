import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth0 } from "@/lib/auth0";
import { sendReminderEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json({ isReminded: false });
        }

        const { id: eventId } = await context.params;
        const user = await prisma.user.findUnique({
            where: { auth0Id: session.user.sub },
        });

        if (!user) {
            return NextResponse.json({ isReminded: false });
        }

        const reminder = await prisma.eventReminder.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId: user.id
                }
            }
        });

        return NextResponse.json({ isReminded: !!reminder });

    } catch (error) {
        console.error("Error fetching reminder status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: eventId } = await context.params;

        // Ensure user exists in DB
        let user = await prisma.user.findUnique({
            where: { auth0Id: session.user.sub },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const existingReminder = await prisma.eventReminder.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId: user.id
                }
            }
        });

        if (existingReminder) {
            // Remove reminder
            await prisma.eventReminder.delete({
                where: { id: existingReminder.id }
            });
            return NextResponse.json({ isReminded: false, message: "Reminder removed" });
        } else {
            // Create reminder
            await prisma.eventReminder.create({
                data: {
                    eventId,
                    userId: user.id
                }
            });

            // Send Email Notification
            const event = await prisma.event.findUnique({ where: { id: eventId } });
            if (event && user.email) {
                // Determine time or use default
                const timeString = event.time || "TBD";
                const dateString = formatDate(event.date);

                // Run in background (don't await to keep response fast)
                sendReminderEmail({
                    to: user.email,
                    userName: user.name,
                    eventName: event.title,
                    eventDate: dateString,
                    eventTime: timeString
                }).catch(err => console.error("Background email failed:", err));
            }

            return NextResponse.json({ isReminded: true, message: "Reminder set" });
        }

    } catch (error) {
        console.error("Error toggling reminder:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
