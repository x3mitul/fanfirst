'use client';

import { useState } from 'react';
import { useWeb3Comfort } from '@/hooks/useWeb3Comfort';
import { Button } from '@/components/ui';
import { Wallet, CreditCard, Sparkles, Brain, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptivePurchaseButtonProps {
    ticketPrice: string;
    tierName: string;
    onWalletPurchase: () => void;
    onEmbeddedPurchase?: () => void;
    isPending?: boolean;
    disabled?: boolean;
}

export function AdaptivePurchaseButton({
    ticketPrice,
    tierName,
    onWalletPurchase,
    onEmbeddedPurchase,
    isPending,
    disabled
}: AdaptivePurchaseButtonProps) {
    const { result, isAnalyzing, isNovice, shouldHideWallet, resetSignals } = useWeb3Comfort();
    const [showOptions, setShowOptions] = useState(false);
    const [showAIInsight, setShowAIInsight] = useState(false);

    // Loading state
    if (isAnalyzing) {
        return (
            <Button disabled className="w-full h-16 rounded-full">
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing your preferences...
            </Button>
        );
    }

    // Novice user: Simple, non-scary button
    if (isNovice || shouldHideWallet) {
        return (
            <div className="space-y-3">
                <Button
                    className="w-full h-16 rounded-full text-lg font-black uppercase italic bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={onEmbeddedPurchase || onWalletPurchase}
                    disabled={disabled || isPending}
                >
                    {isPending ? (
                        'Processing...'
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Buy Ticket • {ticketPrice}
                        </>
                    )}
                </Button>

                {/* AI insight badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-xs text-white/40"
                >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>AI simplified this for you</span>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-purple-400 hover:text-purple-300 underline"
                    >
                        More options
                    </button>
                </motion.div>

                <AnimatePresence>
                    {showOptions && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-full"
                                onClick={onWalletPurchase}
                                disabled={disabled || isPending}
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet Instead
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Crypto-curious or native: Show both options
    return (
        <div className="space-y-3">
            <Button
                className="w-full h-16 rounded-full text-lg font-black uppercase italic"
                onClick={onWalletPurchase}
                disabled={disabled || isPending}
            >
                {isPending ? (
                    'Processing...'
                ) : (
                    <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Purchase NFT Ticket
                    </>
                )}
            </Button>

            {result?.shouldOfferEmbeddedWallet && onEmbeddedPurchase && (
                <Button
                    variant="secondary"
                    className="w-full h-12 rounded-full"
                    onClick={onEmbeddedPurchase}
                    disabled={disabled || isPending}
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Use Simple Checkout
                </Button>
            )}

            {/* AI insight for curious users */}
            <motion.button
                onClick={() => setShowAIInsight(!showAIInsight)}
                className="flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/60 w-full"
            >
                <Brain className="w-3 h-3 text-purple-400" />
                <span>AI detected: {result?.level} user</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAIInsight ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {showAIInsight && result && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-white/60">Comfort Level:</span>
                                <span className="font-bold text-purple-400 uppercase">{result.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Confidence:</span>
                                <span>{Math.round(result.confidence * 100)}%</span>
                            </div>
                            <p className="text-white/40 text-xs italic">
                                {result.aiReasoning || result.recommendation}
                            </p>
                            <button
                                onClick={resetSignals}
                                className="text-xs text-purple-400 hover:underline"
                            >
                                Reset (demo)
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
