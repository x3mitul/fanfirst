// Leaderboard API - Get rankings by type
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { LeaderboardType } from '@/lib/quiz-types';

// GET /api/leaderboard - Get leaderboard by type
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = (searchParams.get('type') || 'accuracy') as LeaderboardType;
        const artistId = searchParams.get('artistId');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

        let orderBy: Record<string, 'asc' | 'desc'>;
        switch (type) {
            case 'speed':
                orderBy = { avgResponseTime: 'asc' }; // Lower is better
                break;
            case 'accuracy':
                orderBy = { accuracyScore: 'desc' };
                break;
            case 'consistency':
                orderBy = { consistencyScore: 'desc' };
                break;
            default:
                orderBy = { finalScore: 'desc' };
        }

        // Build where clause
        const where: Record<string, unknown> = {
            status: 'completed'
        };

        if (artistId) {
            where.quiz = { artistId };
        }

        // Get top attempts with user info
        const attempts = await prisma.quizAttempt.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        fandomScore: true
                    }
                },
                quiz: {
                    select: {
                        artistId: true,
                        artistName: true
                    }
                }
            },
            orderBy,
            take: limit
        });

        // Aggregate by user (best score per user)
        const userBestScores = new Map<string, typeof attempts[0]>();
        for (const attempt of attempts) {
            const existing = userBestScores.get(attempt.userId);
            if (!existing || attempt.finalScore > existing.finalScore) {
                userBestScores.set(attempt.userId, attempt);
            }
        }

        // Build leaderboard
        const leaderboard = Array.from(userBestScores.values())
            .sort((a, b) => {
                if (type === 'speed') {
                    return a.avgResponseTime - b.avgResponseTime;
                }
                if (type === 'accuracy') {
                    return b.accuracyScore - a.accuracyScore;
                }
                if (type === 'consistency') {
                    return b.consistencyScore - a.consistencyScore;
                }
                return b.finalScore - a.finalScore;
            })
            .slice(0, limit)
            .map((attempt, index) => ({
                rank: index + 1,
                userId: attempt.userId,
                userName: attempt.user.name,
                userAvatar: attempt.user.avatar,
                fandomScore: attempt.user.fandomScore,
                score: type === 'speed'
                    ? attempt.avgResponseTime
                    : type === 'accuracy'
                        ? attempt.accuracyScore
                        : type === 'consistency'
                            ? attempt.consistencyScore
                            : attempt.finalScore,
                metric: type,
                artistId: attempt.quiz.artistId,
                artistName: attempt.quiz.artistName,
                correctAnswers: attempt.correctAnswers,
                totalQuestions: attempt.totalQuestions,
                maxStreak: attempt.maxStreak
            }));

        return NextResponse.json({
            leaderboard,
            type,
            artistId,
            count: leaderboard.length
        });
    } catch (error) {
        console.error('[API] Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
