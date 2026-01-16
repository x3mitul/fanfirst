// Quiz Question Generation API
import { NextRequest, NextResponse } from 'next/server';
import { generateQuizQuestions } from '@/lib/gemini-quiz';

// POST /api/quiz/generate - Generate quiz questions for preview
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { artistName, count = 10 } = body;

        if (!artistName) {
            return NextResponse.json(
                { error: 'artistName is required' },
                { status: 400 }
            );
        }

        const questions = await generateQuizQuestions({
            artistName,
            count: Math.min(count, 20), // Max 20 questions
            includeCreative: true
        });

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('[API] Error generating questions:', error);
        return NextResponse.json(
            { error: 'Failed to generate questions' },
            { status: 500 }
        );
    }
}
