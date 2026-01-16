// Quiz API - List and Create quizzes
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQuizQuestions } from '@/lib/gemini-quiz';

// GET /api/quiz - Get quizzes (optionally filtered by artistId)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const artistId = searchParams.get('artistId');
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        const where: Record<string, unknown> = {};
        if (artistId) where.artistId = artistId;
        if (status) where.status = status;
        if (type) where.type = type;

        const quizzes = await prisma.quiz.findMany({
            where,
            include: {
                _count: {
                    select: { attempts: true, questions: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ quizzes });
    } catch (error) {
        console.error('[API] Error fetching quizzes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quizzes' },
            { status: 500 }
        );
    }
}

// POST /api/quiz - Create a new quiz
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            artistId,
            artistName,
            eventId,
            type = 'async',
            questionCount = 10,
            duration = 180,
            startTime
        } = body;

        if (!artistId || !artistName) {
            return NextResponse.json(
                { error: 'artistId and artistName are required' },
                { status: 400 }
            );
        }

        // Generate questions using Gemini
        const generatedQuestions = await generateQuizQuestions({
            artistName,
            count: questionCount,
            includeCreative: true
        });

        // Create quiz with questions
        const quiz = await prisma.quiz.create({
            data: {
                artistId,
                artistName,
                eventId,
                type,
                questionCount: generatedQuestions.length,
                duration,
                status: startTime ? 'pending' : 'active',
                startTime: startTime ? new Date(startTime) : null,
                questions: {
                    create: generatedQuestions.map((q, index) => ({
                        question: q.question,
                        type: q.type,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        imageUrl: q.imageUrl,
                        difficulty: q.difficulty,
                        orderIndex: index,
                        timeLimit: q.type === 'creative' ? 10 : 7 // More time for creative questions
                    }))
                }
            },
            include: {
                questions: true
            }
        });

        return NextResponse.json({ quiz }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating quiz:', error);
        return NextResponse.json(
            { error: 'Failed to create quiz' },
            { status: 500 }
        );
    }
}
