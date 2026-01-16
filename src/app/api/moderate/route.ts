// API Route: POST /api/moderate
// Moderate content before posting

import { NextRequest, NextResponse } from 'next/server';
import { moderateContent } from '@/lib/ai/moderation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content, title, contentType } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        // Perform moderation
        const result = await moderateContent(content, title);

        // Log moderation (in production, save to database)
        console.log('Moderation result:', {
            contentType,
            allowed: result.allowed,
            severity: result.severity,
            flagged: result.flagged,
            categories: result.categories.filter(c => c.detected),
        });

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Moderation API error:', error);
        return NextResponse.json(
            { error: 'Failed to moderate content' },
            { status: 500 }
        );
    }
}
