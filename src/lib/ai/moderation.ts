// AI-Powered Content Moderation Service using OpenAI

import OpenAI from 'openai';
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

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Main moderation function - analyzes content and returns moderation decision
 */
export async function moderateContent(
    content: string,
    title?: string
): Promise<ModerationResult> {
    try {
        // Sanitize content first
        const sanitized = sanitizeContent(content);
        const fullText = title ? `${title}\n\n${sanitized}` : sanitized;

        // Run all checks in parallel
        const [openAIResult, scalperResult, spamResult] = await Promise.all([
            checkOpenAIModeration(fullText),
            Promise.resolve(detectScalper(fullText)),
            Promise.resolve(detectSpam(fullText)),
        ]);

        // Combine all results
        const categories: ModerationCategory[] = [
            ...openAIResult.categories,
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

        // Fallback to basic filters if OpenAI fails
        return fallbackModeration(content, title);
    }
}

/**
 * Check content using OpenAI's Moderation API
 */
async function checkOpenAIModeration(
    content: string
): Promise<{ categories: ModerationCategory[] }> {
    try {
        const moderation = await openai.moderations.create({
            input: content,
        });

        const result = moderation.results[0];

        const categories: ModerationCategory[] = [
            {
                name: 'hate',
                detected: result.categories.hate || result.categories['hate/threatening'],
                score: Math.max(
                    result.category_scores.hate,
                    result.category_scores['hate/threatening']
                ),
            },
            {
                name: 'harassment',
                detected:
                    result.categories.harassment ||
                    result.categories['harassment/threatening'],
                score: Math.max(
                    result.category_scores.harassment,
                    result.category_scores['harassment/threatening']
                ),
            },
            {
                name: 'sexual',
                detected:
                    result.categories.sexual || result.categories['sexual/minors'],
                score: Math.max(
                    result.category_scores.sexual,
                    result.category_scores['sexual/minors']
                ),
            },
            {
                name: 'violence',
                detected:
                    result.categories.violence || result.categories['violence/graphic'],
                score: Math.max(
                    result.category_scores.violence,
                    result.category_scores['violence/graphic']
                ),
            },
            {
                name: 'self-harm',
                detected:
                    result.categories['self-harm'] ||
                    result.categories['self-harm/intent'] ||
                    result.categories['self-harm/instructions'],
                score: Math.max(
                    result.category_scores['self-harm'],
                    result.category_scores['self-harm/intent'],
                    result.category_scores['self-harm/instructions']
                ),
            },
        ];

        return { categories };
    } catch (error) {
        console.error('OpenAI moderation error:', error);
        return { categories: [] };
    }
}

/**
 * Fallback moderation using only local filters
 */
function fallbackModeration(content: string, title?: string): ModerationResult {
    const fullText = title ? `${title}\n\n${content}` : content;
    const scalperResult = detectScalper(fullText);
    const spamResult = detectSpam(fullText);
    const hasProfanity = containsProfanity(fullText);

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

    const flagged = categories.some(cat => cat.detected);
    const allowed = !flagged;
    const severity = calculateSeverity(categories);

    return {
        allowed,
        flagged,
        categories,
        severity,
        confidence: Math.max(...categories.map(c => c.score)),
        reason: flagged
            ? generateReason(categories, scalperResult, spamResult)
            : undefined,
    };
}

/**
 * Calculate severity based on detected categories
 */
function calculateSeverity(
    categories: ModerationCategory[]
): 'low' | 'medium' | 'high' | 'critical' {
    const maxScore = Math.max(...categories.map(c => c.score));
    const detectedCount = categories.filter(c => c.detected).length;

    // Critical violations
    const criticalCategories = ['hate', 'violence', 'sexual/minors', 'self-harm'];
    if (
        categories.some(
            cat => criticalCategories.includes(cat.name) && cat.detected
        )
    ) {
        return 'critical';
    }

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
            case 'hate':
                reasons.push('hateful or discriminatory language');
                break;
            case 'harassment':
                reasons.push('harassment or bullying');
                break;
            case 'sexual':
                reasons.push('sexual or inappropriate content');
                break;
            case 'violence':
                reasons.push('violent or threatening content');
                break;
            case 'self-harm':
                reasons.push('content promoting self-harm');
                break;
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

    if (
        categories.find(
            c =>
                (c.name === 'hate' ||
                    c.name === 'harassment' ||
                    c.name === 'violence') &&
                c.detected
        )
    ) {
        suggestions.push('Rephrase your message to be respectful and constructive');
        suggestions.push('Focus on discussing the music and events positively');
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
