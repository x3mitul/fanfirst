// AI-Powered Content Moderation Service (Fallback Version - No OpenAI Required)

import {
    ModerationResult,
    ModerationCategory,
    ModerationAction,
} from '../types/moderation';
import {
    detectScalper,
    detectSpam,
    containsProfanity,
    sanitizeContent,
} from './filters';

/**
 * Main moderation function - analyzes content using local filters only
 * This is a fallback version that doesn't require OpenAI API
 */
export async function moderateContent(
    content: string,
    title?: string
): Promise<ModerationResult> {
    try {
        // Sanitize content first
        const sanitized = sanitizeContent(content);
        const fullText = title ? `${title}\n\n${sanitized}` : sanitized;

        // Run local checks
        const scalperResult = detectScalper(fullText);
        const spamResult = detectSpam(fullText);
        const hasProfanity = containsProfanity(fullText);

        // Build categories
        const categories: ModerationCategory[] = [
            {
                name: 'scalper',
                detected: scalperResult.isScalper,
                score: scalperResult.confidence,
            },
            {
                name: 'spam',
                detected: spamResult.isSpam,
                score: spamResult.confidence,
            },
            {
                name: 'profanity',
                detected: hasProfanity,
                score: hasProfanity ? 0.8 : 0,
            },
        ];

        // Determine severity
        const severity = calculateSeverity(categories);

        // Determine if content should be allowed
        const criticalFlags = categories.filter(
            cat => cat.detected && cat.score >= 0.7
        );
        const flagged = categories.some(cat => cat.detected);
        const allowed = criticalFlags.length === 0;

        // Generate reason if blocked
        let reason: string | undefined;
        let suggestedEdit: string | undefined;

        if (!allowed) {
            reason = generateReason(categories, scalperResult, spamResult);
            suggestedEdit = generateSuggestedEdit(
                categories,
                scalperResult,
                spamResult
            );
        }

        return {
            allowed,
            flagged,
            categories,
            severity,
            confidence: Math.max(...categories.map(c => c.score)),
            reason,
            suggestedEdit,
        };
    } catch (error) {
        console.error('Moderation error:', error);

        // Fail open - allow content if there's an error
        return {
            allowed: true,
            flagged: false,
            categories: [],
            severity: 'low',
            confidence: 0,
        };
    }
}

/**
 * Calculate severity based on detected categories
 */
function calculateSeverity(
    categories: ModerationCategory[]
): 'low' | 'medium' | 'high' | 'critical' {
    const maxScore = Math.max(...categories.map(c => c.score));
    const detectedCount = categories.filter(c => c.detected).length;

    if (maxScore >= 0.9 || detectedCount >= 3) return 'critical';
    if (maxScore >= 0.7 || detectedCount >= 2) return 'high';
    if (maxScore >= 0.5 || detectedCount >= 1) return 'medium';
    return 'low';
}

/**
 * Generate human-readable reason for blocking
 */
function generateReason(
    categories: ModerationCategory[],
    scalperResult: any,
    spamResult: any
): string {
    const detected = categories.filter(c => c.detected);

    if (detected.length === 0) return 'Content flagged for review';

    const reasons: string[] = [];

    for (const cat of detected) {
        switch (cat.name) {
            case 'scalper':
                reasons.push('attempting to resell tickets or promote sales');
                break;
            case 'spam':
                reasons.push('spam or promotional content');
                break;
            case 'profanity':
                reasons.push('inappropriate language');
                break;
        }
    }

    return `Your post was flagged for: ${reasons.join(', ')}.`;
}

/**
 * Generate suggested edit to make content acceptable
 */
function generateSuggestedEdit(
    categories: ModerationCategory[],
    scalperResult: any,
    spamResult: any
): string {
    const suggestions: string[] = [];

    if (categories.find(c => c.name === 'scalper' && c.detected)) {
        suggestions.push(
            'Remove any references to selling, trading, or reselling tickets'
        );
        suggestions.push('Avoid sharing contact information or payment methods');
    }

    if (categories.find(c => c.name === 'spam' && c.detected)) {
        suggestions.push('Remove excessive links or promotional content');
        suggestions.push('Avoid using all caps or excessive punctuation');
    }

    if (categories.find(c => c.name === 'profanity' && c.detected)) {
        suggestions.push('Remove profanity and inappropriate language');
    }

    return suggestions.join('. ') + '.';
}

/**
 * Quick check if content is likely safe (for client-side preview)
 */
export function quickCheck(content: string): boolean {
    const scalper = detectScalper(content);
    const spam = detectSpam(content);
    const profanity = containsProfanity(content);

    return !scalper.isScalper && !spam.isSpam && !profanity;
}
