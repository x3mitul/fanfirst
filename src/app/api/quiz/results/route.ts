import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const {
            visitorId,
            artistName,
            score,
            accuracyScore,
            speedScore,
            correctAnswers,
            totalQuestions,
            responseTimes
        } = await req.json();

        if (!visitorId || !artistName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate average response time
        const avgResponseTime = responseTimes?.length
            ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length
            : 0;

        // Get or create user's quiz stats
        let userStats = await prisma.quizUserStats.findFirst({
            where: { visitorId, artistName }
        });

        const isNewHighScore = !userStats || score > (userStats.bestScore || 0);
        const previousBestScore = userStats?.bestScore || 0;
        const attemptCount = (userStats?.attemptCount || 0) + 1;
        const totalScore = (userStats?.totalScore || 0) + score;
        const averageScore = totalScore / attemptCount;

        // Calculate improvement
        let improvement = 0;
        if (userStats && userStats.lastScore) {
            improvement = ((score - userStats.lastScore) / userStats.lastScore) * 100;
        }

        // Update or create stats
        if (userStats) {
            userStats = await prisma.quizUserStats.update({
                where: { id: userStats.id },
                data: {
                    attemptCount,
                    totalScore,
                    averageScore,
                    bestScore: isNewHighScore ? score : userStats.bestScore,
                    bestAccuracy: (accuracyScore > (userStats.bestAccuracy || 0)) ? accuracyScore : userStats.bestAccuracy,
                    bestSpeed: (speedScore > (userStats.bestSpeed || 0)) ? speedScore : userStats.bestSpeed,
                    lastScore: score,
                    lastPlayedAt: new Date()
                }
            });
        } else {
            userStats = await prisma.quizUserStats.create({
                data: {
                    visitorId,
                    artistName,
                    attemptCount: 1,
                    totalScore: score,
                    averageScore: score,
                    bestScore: score,
                    bestAccuracy: accuracyScore,
                    bestSpeed: speedScore,
                    lastScore: score,
                    lastPlayedAt: new Date()
                }
            });
        }

        // Get artist leaderboard (top 10)
        const artistLeaderboard = await prisma.quizUserStats.findMany({
            where: { artistName },
            orderBy: { bestScore: 'desc' },
            take: 10,
            select: {
                visitorId: true,
                bestScore: true,
                bestAccuracy: true,
                attemptCount: true
            }
        });

        // Get user's artist rank
        const artistRank = await prisma.quizUserStats.count({
            where: {
                artistName,
                bestScore: { gt: userStats.bestScore || 0 }
            }
        }) + 1;

        // Get global leaderboard (top 10 by average best score across all artists)
        const globalLeaderboard = await prisma.$queryRaw`
            SELECT "visitorId", AVG("bestScore") as "avgBestScore", COUNT(*) as "artistsPlayed"
            FROM "QuizUserStats"
            GROUP BY "visitorId"
            ORDER BY "avgBestScore" DESC
            LIMIT 10
        ` as Array<{ visitorId: string; avgBestScore: number; artistsPlayed: bigint }>;

        // Get user's global rank
        const userGlobalStats = await prisma.$queryRaw`
            SELECT AVG("bestScore") as "avgBestScore"
            FROM "QuizUserStats"
            WHERE "visitorId" = ${visitorId}
        ` as Array<{ avgBestScore: number }>;

        const userAvgScore = userGlobalStats[0]?.avgBestScore || 0;

        const globalRankResult = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT t."visitorId") as "rank"
            FROM (
                SELECT "visitorId", AVG("bestScore") as "avgScore"
                FROM "QuizUserStats"
                GROUP BY "visitorId"
                HAVING AVG("bestScore") > ${userAvgScore}
            ) t
        ` as Array<{ rank: bigint }>;

        const globalRank = Number(globalRankResult[0]?.rank || 0) + 1;

        // Get total participants for artist
        const totalArtistParticipants = await prisma.quizUserStats.count({
            where: { artistName }
        });

        // Get total global participants
        const totalGlobalResult = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT "visitorId") as "total"
            FROM "QuizUserStats"
        ` as Array<{ total: bigint }>;
        const totalGlobalParticipants = Number(totalGlobalResult[0]?.total || 0);

        return NextResponse.json({
            success: true,
            userStats: {
                averageScore: Math.round(averageScore * 10) / 10,
                bestScore: userStats.bestScore,
                attemptCount,
                isNewHighScore,
                previousBestScore,
                improvement: Math.round(improvement * 10) / 10
            },
            rankings: {
                artist: {
                    rank: artistRank,
                    total: totalArtistParticipants,
                    leaderboard: artistLeaderboard.map((entry, i) => ({
                        rank: i + 1,
                        visitorId: entry.visitorId.substring(0, 8) + '...',
                        score: entry.bestScore,
                        accuracy: entry.bestAccuracy,
                        isCurrentUser: entry.visitorId === visitorId
                    }))
                },
                global: {
                    rank: globalRank,
                    total: totalGlobalParticipants,
                    leaderboard: globalLeaderboard.map((entry, i) => ({
                        rank: i + 1,
                        visitorId: entry.visitorId.substring(0, 8) + '...',
                        avgScore: Math.round(Number(entry.avgBestScore) * 10) / 10,
                        artistsPlayed: Number(entry.artistsPlayed),
                        isCurrentUser: entry.visitorId === visitorId
                    }))
                }
            }
        });
    } catch (error) {
        console.error('Quiz results error:', error);
        return NextResponse.json({
            error: 'Failed to save results',
            fallback: true,
            userStats: {
                averageScore: 0,
                bestScore: 0,
                attemptCount: 1,
                isNewHighScore: true,
                improvement: 0
            },
            rankings: {
                artist: { rank: 1, total: 1, leaderboard: [] },
                global: { rank: 1, total: 1, leaderboard: [] }
            }
        });
    }
}
