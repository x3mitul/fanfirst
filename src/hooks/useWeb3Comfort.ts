'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    UserSignals,
    ComfortResult,
    calculateComfortScore,
    scoreToLevel,
    getRecommendation,
    classifyWithAI
} from '@/lib/web3-ai/comfort-score';

const STORAGE_KEY = 'fanfirst_web3_signals';

interface StoredSignals {
    hasConnectedWalletBefore: boolean;
    previousTransactionCount: number;
    sessionCount: number;
    totalTimeOnWeb3UI: number;
    failedTransactions: number;
}

function getStoredSignals(): StoredSignals {
    if (typeof window === 'undefined') {
        return {
            hasConnectedWalletBefore: false,
            previousTransactionCount: 0,
            sessionCount: 0,
            totalTimeOnWeb3UI: 0,
            failedTransactions: 0
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { }

    return {
        hasConnectedWalletBefore: false,
        previousTransactionCount: 0,
        sessionCount: 0,
        totalTimeOnWeb3UI: 0,
        failedTransactions: 0
    };
}

function saveSignals(signals: StoredSignals) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
    }
}

export function useWeb3Comfort() {
    const [result, setResult] = useState<ComfortResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [signals, setSignals] = useState<UserSignals | null>(null);

    // Detect wallet extension
    const hasWalletExtension = typeof window !== 'undefined' &&
        !!(window as any).ethereum;

    // Analyze on mount
    useEffect(() => {
        const stored = getStoredSignals();

        // Increment session count
        stored.sessionCount += 1;
        saveSignals(stored);

        const currentSignals: UserSignals = {
            hasWalletExtension,
            hasConnectedWalletBefore: stored.hasConnectedWalletBefore,
            previousTransactionCount: stored.previousTransactionCount,
            timeOnWeb3UI: stored.totalTimeOnWeb3UI,
            failedTransactions: stored.failedTransactions,
            sessionCount: stored.sessionCount
        };

        setSignals(currentSignals);

        // Quick rule-based result first
        const score = calculateComfortScore(currentSignals);
        const level = scoreToLevel(score);
        const quickResult = getRecommendation(level);
        setResult({ ...quickResult, aiReasoning: 'Analyzing...' });
        setIsAnalyzing(false);

        // Then try AI classification for edge cases
        if (score >= 20 && score <= 70) {
            classifyWithAI(currentSignals).then(aiResult => {
                setResult(aiResult);
                console.log('🤖 AI Web3 Decision:', aiResult);
            });
        } else {
            console.log('🤖 AI Web3 Decision (rule-based):', quickResult);
        }
    }, [hasWalletExtension]);

    // Track wallet connection
    const recordWalletConnection = useCallback(() => {
        const stored = getStoredSignals();
        stored.hasConnectedWalletBefore = true;
        saveSignals(stored);
        console.log('📊 Recorded: Wallet connected');
    }, []);

    // Track successful transaction
    const recordTransaction = useCallback(() => {
        const stored = getStoredSignals();
        stored.previousTransactionCount += 1;
        saveSignals(stored);
        console.log('📊 Recorded: Transaction completed');
    }, []);

    // Track failed transaction
    const recordFailedTransaction = useCallback(() => {
        const stored = getStoredSignals();
        stored.failedTransactions += 1;
        saveSignals(stored);
        console.log('📊 Recorded: Transaction failed');
    }, []);

    // Track time on Web3 UI
    const recordWeb3Time = useCallback((seconds: number) => {
        const stored = getStoredSignals();
        stored.totalTimeOnWeb3UI += seconds;
        saveSignals(stored);
    }, []);

    // Reset for demo purposes
    const resetSignals = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        }
    }, []);

    return {
        result,
        isAnalyzing,
        signals,
        // Tracking functions
        recordWalletConnection,
        recordTransaction,
        recordFailedTransaction,
        recordWeb3Time,
        resetSignals,
        // Quick access
        isNovice: result?.level === 'novice',
        isCurious: result?.level === 'curious',
        isNative: result?.level === 'native',
        shouldHideWallet: result?.shouldOfferEmbeddedWallet && !result?.shouldShowWallet
    };
}
