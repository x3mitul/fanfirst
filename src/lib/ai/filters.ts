// Custom Content Filters for Community Moderation

import { ScalperDetectionResult, SpamDetectionResult } from '../types/moderation';

// Scalper/Resale Keywords and Patterns
const SCALPER_KEYWORDS = [
    'selling tickets',
    'tickets for sale',
    'dm for price',
    'dm me',
    'make an offer',
    'best offer',
    'reselling',
    'markup',
    'above face value',
    'extra tickets',
    'spare tickets',
    'need to sell',
    'price negotiable',
    'accepting offers',
    'cash app',
    'venmo',
    'paypal',
    'zelle',
    'hit me up',
    'hmu',
    'text me',
    'whatsapp',
];

const SCALPER_PATTERNS = [
    /\$\s*\d+\s*(each|per|\/)/i, // Price patterns like "$100 each"
    /sell(ing)?\s+(my|some|extra)?\s*tickets?/i,
    /(dm|message|text|contact)\s+(me|for)/i,
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, // Phone numbers
    /@[\w]+/i, // Social media handles (potential for DM solicitation)
];

// Spam Keywords and Patterns
const SPAM_KEYWORDS = [
    'click here',
    'buy now',
    'limited time',
    'act now',
    'free money',
    'make money fast',
    'work from home',
    'crypto investment',
    'guaranteed returns',
    'double your money',
];

const SPAM_PATTERNS = [
    /(https?:\/\/[^\s]+){3,}/i, // 3+ links
    /(.)\1{10,}/, // Character repeated 10+ times
    /[A-Z\s]{30,}/, // 30+ consecutive caps
];

// Profanity Filter (basic - can be expanded)
const PROFANITY_LIST = [
    'fuck',
    'shit',
    'bitch',
    'ass',
    'damn',
    'crap',
    // Add more as needed, or use a library like 'bad-words'
];

/**
 * Detect scalper behavior in content
 */
export function detectScalper(content: string): ScalperDetectionResult {
    const lowerContent = content.toLowerCase();
    const matchedKeywords: string[] = [];
    const matchedPatterns: string[] = [];

    // Check keywords
    for (const keyword of SCALPER_KEYWORDS) {
        if (lowerContent.includes(keyword)) {
            matchedKeywords.push(keyword);
        }
    }

    // Check patterns
    for (const pattern of SCALPER_PATTERNS) {
        if (pattern.test(content)) {
            matchedPatterns.push(pattern.source);
        }
    }

    const totalMatches = matchedKeywords.length + matchedPatterns.length;
    const confidence = Math.min(totalMatches * 0.2, 1.0); // Each match adds 20% confidence
    const isScalper = totalMatches >= 2; // Need at least 2 matches

    return {
        isScalper,
        confidence,
        matchedKeywords,
        matchedPatterns,
    };
}

/**
 * Detect spam in content
 */
export function detectSpam(content: string): SpamDetectionResult {
    const reasons: string[] = [];

    // Check spam keywords
    const keywordMatches = SPAM_KEYWORDS.filter(keyword =>
        content.toLowerCase().includes(keyword)
    );

    if (keywordMatches.length > 0) {
        reasons.push(`Contains spam keywords: ${keywordMatches.join(', ')}`);
    }

    // Check spam patterns
    for (const pattern of SPAM_PATTERNS) {
        if (pattern.test(content)) {
            if (pattern === SPAM_PATTERNS[0]) {
                reasons.push('Contains excessive links');
            } else if (pattern === SPAM_PATTERNS[1]) {
                reasons.push('Contains excessive repeated characters');
            } else if (pattern === SPAM_PATTERNS[2]) {
                reasons.push('Contains excessive caps');
            }
        }
    }

    // Check content length - very short posts with links are often spam
    if (content.length < 50 && /https?:\/\//.test(content)) {
        reasons.push('Suspiciously short post with link');
    }

    const confidence = Math.min(reasons.length * 0.3, 1.0);
    const isSpam = reasons.length >= 2;

    return {
        isSpam,
        confidence,
        reasons,
    };
}

/**
 * Check for profanity
 */
export function containsProfanity(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return PROFANITY_LIST.some(word => {
        // Use word boundaries to avoid false positives
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerContent);
    });
}

/**
 * Sanitize content by removing suspicious elements
 */
export function sanitizeContent(content: string): string {
    let sanitized = content;

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Remove excessive punctuation
    sanitized = sanitized.replace(/([!?.]){4,}/g, '$1$1$1');

    return sanitized;
}

/**
 * Check if content looks like a duplicate/repeated post
 */
export function isDuplicateContent(
    content: string,
    recentPosts: string[],
    threshold: number = 0.8
): boolean {
    const normalized = content.toLowerCase().trim();

    for (const recent of recentPosts) {
        const recentNormalized = recent.toLowerCase().trim();

        // Simple similarity check - can be improved with Levenshtein distance
        if (normalized === recentNormalized) {
            return true;
        }

        // Check if content is mostly the same
        const similarity = calculateSimilarity(normalized, recentNormalized);
        if (similarity >= threshold) {
            return true;
        }
    }

    return false;
}

/**
 * Calculate simple similarity between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
        return 1.0;
    }

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}
