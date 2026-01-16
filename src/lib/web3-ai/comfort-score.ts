/**
 * AI Web3 Comfort Score System
 * Analyzes user behavior to determine their crypto comfort level
 * Uses OpenAI for intelligent classification
 */

export type ComfortLevel = 'novice' | 'curious' | 'native';

export interface UserSignals {
    hasWalletExtension: boolean;
    hasConnectedWalletBefore: boolean;
    previousTransactionCount: number;
    timeOnWeb3UI: number; // seconds spent on wallet-related UI
    failedTransactions: number;
    sessionCount: number;
}

export interface ComfortResult {
    level: ComfortLevel;
    confidence: number;
    recommendation: string;
    shouldShowWallet: boolean;
    shouldOfferEmbeddedWallet: boolean;
    aiReasoning?: string;
}

// Rule-based fallback scoring (fast, no API call)
export function calculateComfortScore(signals: UserSignals): number {
    let score = 0;

    // Wallet detection (+30)
    if (signals.hasWalletExtension) score += 30;

    // Previous connection (+25)
    if (signals.hasConnectedWalletBefore) score += 25;

    // Transaction history (+5 per tx, max 25)
    score += Math.min(signals.previousTransactionCount * 5, 25);

    // Time familiarity (+1 per 10 seconds, max 10)
    score += Math.min(Math.floor(signals.timeOnWeb3UI / 10), 10);

    // Failed transactions penalty (-5 per fail, max -15)
    score -= Math.min(signals.failedTransactions * 5, 15);

    // Returning user bonus (+5)
    if (signals.sessionCount > 1) score += 5;

    return Math.max(0, Math.min(100, score));
}

export function scoreToLevel(score: number): ComfortLevel {
    if (score >= 60) return 'native';
    if (score >= 30) return 'curious';
    return 'novice';
}

export function getRecommendation(level: ComfortLevel): ComfortResult {
    switch (level) {
        case 'native':
            return {
                level,
                confidence: 0.9,
                recommendation: 'Show full Web3 experience with wallet connection',
                shouldShowWallet: true,
                shouldOfferEmbeddedWallet: false
            };
        case 'curious':
            return {
                level,
                confidence: 0.7,
                recommendation: 'Offer choice between wallet and simplified payment',
                shouldShowWallet: true,
                shouldOfferEmbeddedWallet: true
            };
        case 'novice':
        default:
            return {
                level,
                confidence: 0.85,
                recommendation: 'Hide Web3 complexity, use embedded wallet',
                shouldShowWallet: false,
                shouldOfferEmbeddedWallet: true
            };
    }
}

// OpenAI-powered classification for more nuanced analysis
export async function classifyWithAI(signals: UserSignals): Promise<ComfortResult> {
    const ruleBasedScore = calculateComfortScore(signals);
    const ruleBasedLevel = scoreToLevel(ruleBasedScore);
    const baseResult = getRecommendation(ruleBasedLevel);

    // Skip API call if clearly novice or native
    if (ruleBasedScore < 15 || ruleBasedScore > 75) {
        return {
            ...baseResult,
            aiReasoning: `Rule-based classification (score: ${ruleBasedScore})`
        };
    }

    try {
        const response = await fetch('/api/ai/classify-comfort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signals, ruleBasedScore })
        });

        if (!response.ok) {
            return { ...baseResult, aiReasoning: 'AI unavailable, using rule-based' };
        }

        const aiResult = await response.json();
        return {
            level: aiResult.level,
            confidence: aiResult.confidence,
            recommendation: aiResult.recommendation,
            shouldShowWallet: aiResult.shouldShowWallet,
            shouldOfferEmbeddedWallet: aiResult.shouldOfferEmbeddedWallet,
            aiReasoning: aiResult.reasoning
        };
    } catch (error) {
        console.error('AI classification failed:', error);
        return { ...baseResult, aiReasoning: 'AI error, using fallback' };
    }
}
