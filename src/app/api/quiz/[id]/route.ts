// Quiz Detail API - Get, Start attempt, Submit answers
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateQuizScore, calculateFandomBonus } from '@/lib/gemini-quiz';

// GET /api/quiz/[id] - Get quiz details (questions hidden until attempt started)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        question: true,
                        type: true,
                        options: true,
                        imageUrl: true,
                        timeLimit: true,
                        difficulty: true,
                        orderIndex: true
                        // correctAnswer intentionally omitted
                    }
                },
                _count: {
                    select: { attempts: true }
                }
            }
        });

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        return NextResponse.json({ quiz });
    } catch (error) {
        console.error('[API] Error fetching quiz:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}

// POST /api/quiz/[id] - Start a quiz attempt or submit answers
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: quizId } = await params;
        const body = await request.json();
        const { action, userId, attemptId, responses } = body;

        if (action === 'start') {
            return handleStartAttempt(quizId, userId);
        } else if (action === 'submit') {
            return handleSubmitAttempt(attemptId, responses);
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "start" or "submit"' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('[API] Error processing quiz action:', error);
        return NextResponse.json(
            { error: 'Failed to process quiz action' },
            { status: 500 }
        );
    }
}

async function handleStartAttempt(quizId: string, userId: string) {
    if (!userId) {
        return NextResponse.json(
            { error: 'userId is required' },
            { status: 400 }
        );
    }

    // Check if quiz exists and is active
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true }
    });

    if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.status !== 'active') {
        return NextResponse.json(
            { error: 'Quiz is not active' },
            { status: 400 }
        );
    }

    // Check for existing incomplete attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
        where: {
            quizId,
            userId,
            status: 'in_progress'
        }
    });

    if (existingAttempt) {
        return NextResponse.json({ attempt: existingAttempt });
    }

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
        data: {
            quizId,
            userId,
            totalQuestions: quiz.questionCount,
            status: 'in_progress'
        }
    });

    return NextResponse.json({ attempt }, { status: 201 });
}

interface ResponseInput {
    questionId: string;
    answer: string;
    responseTime: number;
}

async function handleSubmitAttempt(attemptId: string, responses: ResponseInput[]) {
    if (!attemptId || !responses || !Array.isArray(responses)) {
        return NextResponse.json(
            { error: 'attemptId and responses array are required' },
            { status: 400 }
        );
    }

    // Get attempt with quiz questions
    const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
            quiz: {
                include: { questions: true }
            }
        }
    });

    if (!attempt) {
        return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status === 'completed') {
        return NextResponse.json(
            { error: 'Attempt already completed' },
            { status: 400 }
        );
    }

    // Build question lookup
    const questionsMap = new Map(
        attempt.quiz.questions.map(q => [q.id, q])
    );

    // Process responses
    let correctCount = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    const responseTimes: number[] = [];
    const responseRecords: Array<{
        attemptId: string;
        questionId: string;
        answer: string;
        isCorrect: boolean;
        responseTime: number;
    }> = [];

    for (const resp of responses) {
        const question = questionsMap.get(resp.questionId);
        if (!question) continue;

        const isCorrect = resp.answer === question.correctAnswer;

        if (isCorrect) {
            correctCount++;
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }

        responseTimes.push(resp.responseTime);
        responseRecords.push({
            attemptId,
            questionId: resp.questionId,
            answer: resp.answer,
            isCorrect,
            responseTime: resp.responseTime
        });
    }

    // Calculate scores
    const scores = calculateQuizScore({
        correctAnswers: correctCount,
        totalQuestions: attempt.totalQuestions,
        responseTimes
    });

    // Calculate Fandom Score bonus
    const fandomBonus = calculateFandomBonus({
        correctAnswers: correctCount,
        totalQuestions: attempt.totalQuestions,
        maxStreak,
        isPerfectRound: correctCount === attempt.totalQuestions
    });

    // Save responses and update attempt
    await prisma.quizResponse.createMany({
        data: responseRecords
    });

    const updatedAttempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
            correctAnswers: correctCount,
            avgResponseTime: scores.avgResponseTime,
            responseTimeStdDev: scores.responseTimeStdDev,
            streak: currentStreak,
            maxStreak,
            finalScore: scores.finalScore,
            speedScore: scores.speedScore,
            accuracyScore: scores.accuracyScore,
            consistencyScore: scores.consistencyScore,
            status: 'completed',
            completedAt: new Date()
        }
    });

    // Update user's Fandom Score
    if (fandomBonus > 0) {
        await prisma.user.update({
            where: { id: attempt.userId },
            data: {
                fandomScore: { increment: fandomBonus }
            }
        });
    }

    // Calculate rank
    const betterAttempts = await prisma.quizAttempt.count({
        where: {
            quizId: attempt.quizId,
            status: 'completed',
            finalScore: { gt: scores.finalScore }
        }
    });
    const rank = betterAttempts + 1;

    // Update rank
    await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: { rank }
    });

    return NextResponse.json({
        attempt: { ...updatedAttempt, rank },
        scores,
        fandomBonus,
        rank
    });
}
