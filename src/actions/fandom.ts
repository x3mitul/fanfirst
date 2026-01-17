"use server";

import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fandom Score point values for each action type
const FANDOM_POINTS = {
    ticket_purchase: 20,
    quiz_complete: 10,    // Base; actual value comes from quiz logic
    community_post: 3,
    community_comment: 2,
    daily_login: 1,
} as const;

type FandomActionType = keyof typeof FANDOM_POINTS;

interface RecordFandomActionResult {
    success: boolean;
    newScore?: number;
    pointsAdded?: number;
    error?: string;
}

/**
 * Records a fandom action and updates the user's score.
 * This is the central function for all score-contributing events.
 */
export async function recordFandomAction(
    actionType: FandomActionType,
    customPoints?: number
): Promise<RecordFandomActionResult> {
    try {
        const session = await auth0.getSession();
        if (!session?.user?.sub) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { auth0Id: session.user.sub },
            select: { id: true, fandomScore: true }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Determine points to add
        const pointsToAdd = customPoints ?? FANDOM_POINTS[actionType];

        // Update user's fandom score
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                fandomScore: { increment: pointsToAdd }
            },
            select: { fandomScore: true }
        });

        // Revalidate dashboard to show updated score
        revalidatePath("/dashboard");

        return {
            success: true,
            newScore: updatedUser.fandomScore,
            pointsAdded: pointsToAdd
        };
    } catch (error) {
        console.error("[Fandom] Error recording action:", error);
        return { success: false, error: "Failed to update score" };
    }
}

/**
 * Get current user's fandom score
 */
export async function getFandomScore(): Promise<{ score: number } | { error: string }> {
    try {
        const session = await auth0.getSession();
        if (!session?.user?.sub) {
            return { error: "Not authenticated" };
        }

        const user = await prisma.user.findUnique({
            where: { auth0Id: session.user.sub },
            select: { fandomScore: true }
        });

        return { score: user?.fandomScore ?? 0 };
    } catch (error) {
        console.error("[Fandom] Error fetching score:", error);
        return { error: "Failed to fetch score" };
    }
}
