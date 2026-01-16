'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    UserSignals,
    ComfortResult,
    calculateComfortScore,
    scoreToLevel,
    getRecommendation,
    classifyWithAI,
    calculateConfidence
} from '@/lib/web3-ai/comfort-score';

const STORAGE_KEY = 'fanfirst_web3_signals';
const REALTIME_KEY = 'fanfirst_realtime_signals';

interface StoredSignals {
    hasConnectedWalletBefore: boolean;
    previousTransactionCount: number;
    sessionCount: number;
    totalTimeOnWeb3UI: number;
    failedTransactions: number;
    lastVisit: number;
    purchaseAttempts: number;
    walletHoverTime: number;
    cryptoTermsViewed: number;
}

interface RealtimeSignals {
    mouseEnterWalletButton: number;
    hesitationTime: number;
    scrolledToPrice: boolean;
    viewedFAQ: boolean;
    copiedWalletAddress: boolean;
    clickedLearnMore: boolean;
}

function getStoredSignals(): StoredSignals {
    if (typeof window === 'undefined') {
        return {
            hasConnectedWalletBefore: false,
            previousTransactionCount: 0,
            sessionCount: 0,
            totalTimeOnWeb3UI: 0,
            failedTransactions: 0,
            lastVisit: 0,
            purchaseAttempts: 0,
            walletHoverTime: 0,
            cryptoTermsViewed: 0
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...getDefaultSignals(), ...JSON.parse(stored) };
    } catch { }

    return getDefaultSignals();
}

function getDefaultSignals(): StoredSignals {
    return {
        hasConnectedWalletBefore: false,
        previousTransactionCount: 0,
        sessionCount: 0,
        totalTimeOnWeb3UI: 0,
        failedTransactions: 0,
        lastVisit: 0,
        purchaseAttempts: 0,
        walletHoverTime: 0,
        cryptoTermsViewed: 0
    };
}

function saveSignals(signals: StoredSignals) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
    }
}

// Detect crypto-related browser extensions
function detectCryptoExtensions(): { hasWallet: boolean; walletType: string | null } {
    if (typeof window === 'undefined') return { hasWallet: false, walletType: null };

    const ethereum = (window as any).ethereum;
    if (!ethereum) return { hasWallet: false, walletType: null };

    // Detect specific wallet types
    if (ethereum.isMetaMask) return { hasWallet: true, walletType: 'MetaMask' };
    if (ethereum.isCoinbaseWallet) return { hasWallet: true, walletType: 'Coinbase' };
    if (ethereum.isRabby) return { hasWallet: true, walletType: 'Rabby' };
    if (ethereum.isBraveWallet) return { hasWallet: true, walletType: 'Brave' };
    if (ethereum.isPhantom) return { hasWallet: true, walletType: 'Phantom' };
    if (ethereum.isTrust) return { hasWallet: true, walletType: 'Trust' };

    return { hasWallet: true, walletType: 'Unknown' };
}

// Check for Web3 literacy indicators
function detectWeb3Literacy(): number {
    if (typeof window === 'undefined') return 0;

    let literacyScore = 0;

    // Check localStorage for crypto-related keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (
            key.includes('wallet') ||
            key.includes('eth') ||
            key.includes('metamask') ||
            key.includes('wagmi') ||
            key.includes('web3') ||
            key.includes('privy')
        ) {
            literacyScore += 5;
        }
    }

    return Math.min(literacyScore, 20);
}

export function useWeb3Comfort() {
    const [result, setResult] = useState<ComfortResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [signals, setSignals] = useState<UserSignals | null>(null);
    const [walletInfo, setWalletInfo] = useState<{ hasWallet: boolean; walletType: string | null }>({ hasWallet: false, walletType: null });

    const [aiMessage, setAiMessage] = useState<string | null>(null);
    const timeTrackingRef = useRef<number>(0);
    const analysisStartRef = useRef<number>(Date.now());
    const hasShownWelcomeRef = useRef(false);

    // AI Message Generator
    useEffect(() => {
        if (isAnalyzing || !result) return;

        // 1. Welcome Message (once per session)
        if (!hasShownWelcomeRef.current) {
            const timeout = setTimeout(() => {
                if (result.level === 'novice') {
                    setAiMessage("👋 Hi! I've simplified the crypto parts for you.");
                } else if (result.level === 'curious') {
                    setAiMessage("💡 I've enabled both simple & advanced options for you.");
                } else {
                    setAiMessage("⚡ AI Web3 Assistant active."); // Fallback for testing
                }
                hasShownWelcomeRef.current = true;

                // Clear after 8s
                setTimeout(() => setAiMessage(null), 8000);
            }, 2000);
            return () => clearTimeout(timeout);
        }

        // 2. Hesitation Help (Novice only)
        if (result.level === 'novice' && (signals?.timeOnWeb3UI || 0) > 15 && !signals?.hasConnectedWalletBefore) {
            const interval = setInterval(() => {
                // Only show if no message currently
                setAiMessage(prev => prev || "✨ No wallet needed! Just click 'Buy Ticket' to start.");
                setTimeout(() => setAiMessage(null), 8000);
            }, 30000); // Check every 30s
            return () => clearInterval(interval);
        }

    }, [result, isAnalyzing, signals?.timeOnWeb3UI, signals?.hasConnectedWalletBefore]);

    // Enhanced wallet detection
    useEffect(() => {
        const detection = detectCryptoExtensions();
        setWalletInfo(detection);
    }, []);

    // Analyze on mount with enhanced signals
    useEffect(() => {
        const stored = getStoredSignals();
        const now = Date.now();

        // Calculate time since last visit (recency bonus)
        const hoursSinceLastVisit = stored.lastVisit ? (now - stored.lastVisit) / (1000 * 60 * 60) : 999;

        // Update session count and last visit
        stored.sessionCount += 1;
        stored.lastVisit = now;
        saveSignals(stored);

        // Detect Web3 literacy from browser
        const literacyBonus = detectWeb3Literacy();

        // Build comprehensive signals
        const currentSignals: UserSignals = {
            hasWalletExtension: walletInfo.hasWallet,
            hasConnectedWalletBefore: stored.hasConnectedWalletBefore,
            previousTransactionCount: stored.previousTransactionCount,
            timeOnWeb3UI: stored.totalTimeOnWeb3UI + literacyBonus, // Add literacy bonus
            failedTransactions: stored.failedTransactions,
            sessionCount: stored.sessionCount
        };

        // Adjust for recency
        if (hoursSinceLastVisit < 24 && stored.sessionCount > 1) {
            // Recent return visitor - more confident
            currentSignals.timeOnWeb3UI += 5;
        }

        setSignals(currentSignals);

        // Quick rule-based result first (instant)
        const { score, breakdown } = calculateComfortScore(currentSignals);
        const level = scoreToLevel(score);
        const confidence = calculateConfidence(currentSignals, score);
        const quickResult = getRecommendation(level, confidence);

        setResult({
            ...quickResult,
            scoreBreakdown: breakdown,
            aiReasoning: 'Analyzing patterns...'
        });
        setIsAnalyzing(false);

        // Log for demo visibility
        console.log('🧠 AI Web3 Analysis:', {
            walletType: walletInfo.walletType,
            signals: currentSignals,
            score,
            breakdown,
            level,
            confidence: `${Math.round(confidence * 100)}%`
        });

        // Background AI classification for edge cases
        classifyWithAI(currentSignals).then(aiResult => {
            setResult(aiResult);
            console.log('🤖 AI Decision:', aiResult);
        });

    }, [walletInfo.hasWallet, walletInfo.walletType]);

    // Track time on page
    useEffect(() => {
        const interval = setInterval(() => {
            timeTrackingRef.current += 10;

            // Save every 30 seconds
            if (timeTrackingRef.current % 30 === 0) {
                const stored = getStoredSignals();
                stored.totalTimeOnWeb3UI += 30;
                saveSignals(stored);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Track wallet connection
    const recordWalletConnection = useCallback(() => {
        const stored = getStoredSignals();
        stored.hasConnectedWalletBefore = true;
        saveSignals(stored);

        // Re-analyze with new data
        setSignals(prev => prev ? { ...prev, hasConnectedWalletBefore: true } : prev);
        console.log('📊 Signal: Wallet connected');
    }, []);

    // Track successful transaction
    const recordTransaction = useCallback(() => {
        const stored = getStoredSignals();
        stored.previousTransactionCount += 1;
        saveSignals(stored);

        // Re-analyze with new data
        setSignals(prev => prev ? {
            ...prev,
            previousTransactionCount: prev.previousTransactionCount + 1
        } : prev);
        console.log('📊 Signal: Transaction completed (total:', stored.previousTransactionCount, ')');
    }, []);

    // Track failed transaction
    const recordFailedTransaction = useCallback(() => {
        const stored = getStoredSignals();
        stored.failedTransactions += 1;
        saveSignals(stored);

        setSignals(prev => prev ? {
            ...prev,
            failedTransactions: prev.failedTransactions + 1
        } : prev);
        console.log('📊 Signal: Transaction failed');
    }, []);

    // Track time on Web3 UI
    const recordWeb3Time = useCallback((seconds: number) => {
        const stored = getStoredSignals();
        stored.totalTimeOnWeb3UI += seconds;
        saveSignals(stored);
    }, []);

    // Track purchase attempt (without completion)
    const recordPurchaseAttempt = useCallback(() => {
        const stored = getStoredSignals();
        stored.purchaseAttempts += 1;
        saveSignals(stored);
        console.log('📊 Signal: Purchase attempted');
    }, []);

    // Track wallet button hover
    const recordWalletHover = useCallback((ms: number) => {
        const stored = getStoredSignals();
        stored.walletHoverTime += ms;
        saveSignals(stored);
    }, []);

    // Reset for demo purposes
    const resetSignals = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(REALTIME_KEY);
            window.location.reload();
        }
    }, []);

    // Force re-analysis
    const reanalyze = useCallback(() => {
        if (signals) {
            setIsAnalyzing(true);
            classifyWithAI(signals).then(aiResult => {
                setResult(aiResult);
                setIsAnalyzing(false);
            });
        }
    }, [signals]);

    return {
        result,
        isAnalyzing,
        signals,
        walletInfo,
        aiMessage,
        // Tracking functions
        recordWalletConnection,
        recordTransaction,
        recordFailedTransaction,
        recordWeb3Time,
        recordPurchaseAttempt,
        recordWalletHover,
        resetSignals,
        reanalyze,
        // Quick access
        isNovice: result?.level === 'novice',
        isCurious: result?.level === 'curious',
        isNative: result?.level === 'native',
        shouldHideWallet: result?.shouldOfferEmbeddedWallet && !result?.shouldShowWallet,
        // Analysis timing
        analysisTime: Date.now() - analysisStartRef.current
    };
}
