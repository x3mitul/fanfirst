import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { signals, ruleBasedScore, breakdown } = await req.json();

        const prompt = `You are an expert AI system that analyzes user behavior patterns to determine their comfort level with cryptocurrency, blockchain, and Web3 technology. Your goal is to optimize the user experience by recommending the right level of complexity.

## User Behavior Signals:

### Technical Indicators
- Wallet extension installed: ${signals.hasWalletExtension ? 'YES' : 'NO'}
- Has connected wallet before: ${signals.hasConnectedWalletBefore ? 'YES' : 'NO'}
- Successful transactions: ${signals.previousTransactionCount}
- Failed transactions: ${signals.failedTransactions}

### Engagement Indicators  
- Time on Web3 UI: ${signals.timeOnWeb3UI} seconds
- Session count: ${signals.sessionCount} visits
- Rule-based score: ${ruleBasedScore}/100

### Score Breakdown (how rule-based arrived at score):
${breakdown ? `
- Wallet extension bonus: +${breakdown.walletExtension}
- Wallet connected bonus: +${breakdown.walletConnected}
- Transaction history bonus: +${breakdown.transactionHistory}
- Time engagement bonus: +${breakdown.timeEngagement}
- Returning user bonus: +${breakdown.returningUser}
- Failure penalty: ${breakdown.failurePenalty}
` : 'Not available'}

## Classification Criteria:

**NOVICE (score 0-24)**: No crypto experience. Never used a wallet. Would be confused by blockchain terminology. Needs maximum simplification - hide all Web3 jargon, auto-create wallet invisibly.

**CURIOUS (score 25-54)**: Some exposure to crypto. May have wallet but rarely uses it. Open to learning but needs guidance. Show both simple and advanced options.

**NATIVE (score 55-100)**: Regular crypto user. Comfortable with wallets, transactions, gas fees. Prefers full control and transparency. Show full Web3 experience.

## Your Task:
Analyze the signals holistically. Consider:
1. Strong signals (wallet + prior connection) weigh more than weak signals (time on page)
2. Failed transactions indicate struggle despite intent - may need help
3. Multiple sessions without transactions = curious but hesitant
4. Wallet installed but never connected = has crypto interest but new to dApps

Provide your classification in JSON:
{
  "level": "novice" | "curious" | "native",
  "confidence": 0.5-0.95 (how certain you are),
  "shouldShowWallet": true/false (show "Connect Wallet" button prominently),
  "shouldOfferEmbeddedWallet": true/false (offer auto-created wallet option),
  "recommendation": "specific UI recommendation in 10 words or less",
  "reasoning": "2-3 sentence explanation of your analysis"
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a UX-focused AI that optimizes Web3 experiences. You analyze behavioral signals to determine user crypto literacy. Always respond with valid JSON only.'
                },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 300,
            temperature: 0.3 // Lower temperature for more consistent results
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');

        // Log for debugging
        console.log('🤖 OpenAI Classification:', result);

        return NextResponse.json(result);
    } catch (error) {
        console.error('OpenAI classification error:', error);
        return NextResponse.json(
            { error: 'Classification failed' },
            { status: 500 }
        );
    }
}
