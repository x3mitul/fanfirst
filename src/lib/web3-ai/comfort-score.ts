/**
 * AI Web3 Comfort Score System v2
 * Enhanced behavioral analysis with weighted scoring
 * Uses OpenAI for intelligent edge-case classification
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
    scoreBreakdown?: ScoreBreakdown;
}

export interface ScoreBreakdown {
    walletExtension: number;
    walletConnected: number;
    transactionHistory: number;
    timeEngagement: number;
    failurePenalty: number;
    returningUser: number;
    total: number;
}

// Enhanced weighted scoring algorithm with combined signal analysis
export function calculateComfortScore(signals: UserSignals): { score: number; breakdown: ScoreBreakdown } {
    const breakdown: ScoreBreakdown = {
        walletExtension: 0,
        walletConnected: 0,
        transactionHistory: 0,
        timeEngagement: 0,
        failurePenalty: 0,
        returningUser: 0,
        total: 0
    };

    // === TIER 1: STRONGEST SIGNALS (Definitive indicators) ===

    // Wallet extension = strong intent signal
    if (signals.hasWalletExtension) {
        breakdown.walletExtension = 30;

        // COMBO: Wallet + connected = definitive crypto user
        if (signals.hasConnectedWalletBefore) {
            breakdown.walletConnected = 35; // Higher when combined
        }
    } else if (signals.hasConnectedWalletBefore) {
        // Connected before but no extension now = mobile/different browser
        breakdown.walletConnected = 20;
    }

    // === TIER 2: EXPERIENCE SIGNALS (Proven behavior) ===

    // Transaction history - strongest behavior proof
    const txCount = signals.previousTransactionCount;
    if (txCount >= 5) {
        breakdown.transactionHistory = 25; // Power user
    } else if (txCount >= 3) {
        breakdown.transactionHistory = 20; // Regular user
    } else if (txCount >= 1) {
        breakdown.transactionHistory = 12; // Has tried it
    }

    // === TIER 3: ENGAGEMENT SIGNALS (Interest indicators) ===

    // Time on Web3 UI - shows interest
    const timeScore = Math.min(Math.floor(signals.timeOnWeb3UI / 20) * 2, 8);
    breakdown.timeEngagement = timeScore;

    // Returning user - familiarity indicator
    if (signals.sessionCount >= 5) {
        breakdown.returningUser = 6;
    } else if (signals.sessionCount >= 3) {
        breakdown.returningUser = 4;
    } else if (signals.sessionCount >= 2) {
        breakdown.returningUser = 2;
    }

    // === TIER 4: NEGATIVE SIGNALS (Struggle indicators) ===

    // Failed transactions - indicates struggle
    const failures = signals.failedTransactions;
    if (failures >= 3) {
        breakdown.failurePenalty = -15; // Significant struggle
    } else if (failures >= 2) {
        breakdown.failurePenalty = -8;
    } else if (failures >= 1) {
        breakdown.failurePenalty = -3;
    }

    // === SPECIAL CASES ===

    // No wallet + no transactions + first session = Definitely novice
    if (!signals.hasWalletExtension &&
        !signals.hasConnectedWalletBefore &&
        signals.previousTransactionCount === 0 &&
        signals.sessionCount <= 1) {
        // Force low score for clear novice
        breakdown.total = 5;
        return { score: 5, breakdown };
    }

    // Calculate total
    breakdown.total = Math.max(0, Math.min(100,
        breakdown.walletExtension +
        breakdown.walletConnected +
        breakdown.transactionHistory +
        breakdown.timeEngagement +
        breakdown.returningUser +
        breakdown.failurePenalty
    ));

    return { score: breakdown.total, breakdown };
}

// More nuanced thresholds
export function scoreToLevel(score: number): ComfortLevel {
    if (score >= 55) return 'native';    // Clear crypto users
    if (score >= 25) return 'curious';   // Some exposure
    return 'novice';                      // New to crypto
}

// Dynamic confidence based on signal clarity
export function calculateConfidence(signals: UserSignals, score: number): number {
    let confidence = 0.5; // Base confidence

    // Strong positive signals increase confidence
    if (signals.hasWalletExtension && signals.hasConnectedWalletBefore) {
        confidence += 0.25; // Very clear native user
    }

    // No wallet + no transactions = very clear novice
    if (!signals.hasWalletExtension && signals.previousTransactionCount === 0) {
        confidence += 0.3; // Very clear novice
    }

    // Edge cases reduce confidence
    if (score >= 20 && score <= 60) {
        confidence -= 0.1; // Uncertain zone
    }

    // Multiple failures with wallet = confused user
    if (signals.hasWalletExtension && signals.failedTransactions >= 2) {
        confidence -= 0.15;
    }

    return Math.max(0.4, Math.min(0.95, confidence));
}

export function getRecommendation(level: ComfortLevel, confidence: number): ComfortResult {
    switch (level) {
        case 'native':
            return {
                level,
                confidence,
                recommendation: 'Full Web3 experience - show wallet connection prominently',
                shouldShowWallet: true,
                shouldOfferEmbeddedWallet: false
            };
        case 'curious':
            return {
                level,
                confidence,
                recommendation: 'Offer choice - both wallet and simplified checkout visible',
                shouldShowWallet: true,
                shouldOfferEmbeddedWallet: true
            };
        case 'novice':
        default:
            return {
                level,
                confidence,
                recommendation: 'Simplify completely - hide Web3 jargon, auto-create wallet',
                shouldShowWallet: false,
                shouldOfferEmbeddedWallet: true
            };
    }
}

// Optimized AI classification - only for ambiguous cases
export async function classifyWithAI(signals: UserSignals): Promise<ComfortResult> {
    const { score, breakdown } = calculateComfortScore(signals);
    const ruleBasedLevel = scoreToLevel(score);
    const confidence = calculateConfidence(signals, score);
    const baseResult = getRecommendation(ruleBasedLevel, confidence);

    // High confidence = skip AI call (performance optimization)
    if (confidence >= 0.75) {
        return {
            ...baseResult,
            scoreBreakdown: breakdown,
            aiReasoning: `High-confidence rule-based (${Math.round(confidence * 100)}%)`
        };
    }

    // Low score edge case - definitely novice
    if (score < 15) {
        return {
            ...baseResult,
            scoreBreakdown: breakdown,
            aiReasoning: 'Clear novice pattern detected'
        };
    }

    // High score edge case - definitely native
    if (score > 70) {
        return {
            ...baseResult,
            scoreBreakdown: breakdown,
            aiReasoning: 'Strong crypto-native signals'
        };
    }

    // Ambiguous case - use AI for nuanced classification
    try {
        const response = await fetch('/api/ai/classify-comfort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signals, ruleBasedScore: score, breakdown })
        });

        if (!response.ok) {
            return {
                ...baseResult,
                scoreBreakdown: breakdown,
                aiReasoning: 'AI unavailable, using optimized rules'
            };
        }

        const aiResult = await response.json();
        return {
            level: aiResult.level,
            confidence: Math.max(aiResult.confidence, confidence), // Use higher confidence
            recommendation: aiResult.recommendation,
            shouldShowWallet: aiResult.shouldShowWallet,
            shouldOfferEmbeddedWallet: aiResult.shouldOfferEmbeddedWallet,
            aiReasoning: aiResult.reasoning,
            scoreBreakdown: breakdown
        };
    } catch (error) {
        console.error('AI classification failed:', error);
        return {
            ...baseResult,
            scoreBreakdown: breakdown,
            aiReasoning: 'AI fallback to optimized rules'
        };
    }
}
