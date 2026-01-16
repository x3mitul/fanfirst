import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { signals, ruleBasedScore } = await req.json();

        const prompt = `You are an AI that analyzes user behavior to determine their comfort level with cryptocurrency and Web3 technology.

Based on the following user signals, classify their comfort level and provide a recommendation:

User Signals:
- Has wallet extension installed: ${signals.hasWalletExtension}
- Has connected wallet before: ${signals.hasConnectedWalletBefore}
- Previous transaction count: ${signals.previousTransactionCount}
- Time spent on Web3 UI: ${signals.timeOnWeb3UI} seconds
- Failed transactions: ${signals.failedTransactions}
- Session count: ${signals.sessionCount}
- Rule-based score: ${ruleBasedScore}/100

Respond with JSON only:
{
  "level": "novice" | "curious" | "native",
  "confidence": 0.0-1.0,
  "shouldShowWallet": boolean,
  "shouldOfferEmbeddedWallet": boolean,
  "recommendation": "brief action recommendation",
  "reasoning": "1-2 sentence explanation"
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            max_tokens: 200
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');

        return NextResponse.json(result);
    } catch (error) {
        console.error('OpenAI classification error:', error);
        return NextResponse.json(
            { error: 'Classification failed' },
            { status: 500 }
        );
    }
}
