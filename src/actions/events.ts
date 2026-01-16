"use server";

import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendReminderEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";

export async function toggleReminder(eventId: string) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { auth0Id: session.user.sub },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const existingReminder = await prisma.eventReminder.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId: user.id
                }
            }
        });

        let isReminded = false;

        if (existingReminder) {
            // Remove reminder
            await prisma.eventReminder.delete({
                where: { id: existingReminder.id }
            });
            isReminded = false;
        } else {
            // Create reminder
            await prisma.eventReminder.create({
                data: {
                    eventId,
                    userId: user.id
                }
            });
            isReminded = true;

            // Send Email Notification
            const event = await prisma.event.findUnique({ where: { id: eventId } });
            if (event && user.email) {
                const timeString = event.time || "TBD";
                const dateString = formatDate(event.date);

                // Run in background (don't await)
                sendReminderEmail({
                    to: user.email,
                    userName: user.name,
                    eventName: event.title,
                    eventDate: dateString,
                    eventTime: timeString
                }).catch(err => console.error("Background email failed:", err));
            }
        }

        revalidatePath(`/events/${eventId}`);
        return { success: true, isReminded };

    } catch (error) {
        console.error("Error toggling reminder:", error);
        return { success: false, error: "Internal Server Error" };
    }
}
