'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWeb3Comfort } from '@/hooks/useWeb3Comfort';
import { Button } from '@/components/ui';
import { Wallet, CreditCard, Sparkles, Brain, ChevronDown, Loader2 } from 'lucide-react';
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
    const { result, isAnalyzing, isNovice, isCurious, isNative, shouldHideWallet, resetSignals, recordWalletConnection, recordTransaction } = useWeb3Comfort();
    const { login, authenticated, ready, user } = usePrivy();
    const { wallets } = useWallets();
    const [showOptions, setShowOptions] = useState(false);
    const [showAIInsight, setShowAIInsight] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [demoPurchaseSuccess, setDemoPurchaseSuccess] = useState(false);
    const [isProcessingDemo, setIsProcessingDemo] = useState(false);

    // Get embedded wallet if exists
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

    // Demo purchase simulation for embedded wallet
    const handleDemoPurchase = async () => {
        setIsProcessingDemo(true);
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessingDemo(false);
        setDemoPurchaseSuccess(true);
        recordTransaction(); // Update transaction count for AI scoring
        console.log('🎟️ Demo purchase completed with wallet:', embeddedWallet?.address);
    };

    // Handle simple checkout (Privy login + embedded wallet)
    const handleSimpleCheckout = async () => {
        if (!ready) return;

        if (!authenticated) {
            setIsLoggingIn(true);
            try {
                await login();
                recordWalletConnection();
            } catch (e) {
                console.error('Login failed:', e);
            } finally {
                setIsLoggingIn(false);
            }
        } else if (embeddedWallet) {
            // User has embedded wallet, proceed with demo purchase
            handleDemoPurchase();
        } else {
            // Authenticated but no embedded wallet - use external wallet
            onWalletPurchase();
        }
    };

    // Loading state
    if (isAnalyzing || !ready) {
        return (
            <Button disabled className="w-full h-16 rounded-full">
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing your preferences...
            </Button>
        );
    }

    // Generate unique AI art based on wallet address
    const getGenerativeArt = (seed: string) => {
        const colors = [
            ['#FF0080', '#7928CA'], // Magenta -> Purple
            ['#4158D0', '#C850C0', '#FFCC70'], // Blue -> Pink -> Yellow
            ['#0093E9', '#80D0C7'], // Blue -> Cyan
            ['#8EC5FC', '#E0C3FC'], // Light Blue -> Light Purple
            ['#FA8BFF', '#2BD2FF', '#2BFF88'] // Pink -> Blue -> Green
        ];
        // Simple hash to pick a palette
        const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const palette = colors[hash % colors.length];
        return `linear-gradient(135deg, ${palette.join(', ')})`;
    };

    // Demo purchase success state
    if (demoPurchaseSuccess && embeddedWallet) {
        const uniqueArt = getGenerativeArt(embeddedWallet.address);
        const ticketId = `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const qrData = JSON.stringify({
            ticketId,
            owner: embeddedWallet.address,
            event: "Connected Concert 2024",
            tier: "VIP"
        });
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=000000`;

        return (
            <div className="space-y-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="overflow-hidden rounded-3xl border border-white/10 relative"
                >
                    {/* Generative Art Background */}
                    <div
                        className="absolute inset-0 opacity-80"
                        style={{ background: uniqueArt }}
                    />

                    <div className="relative p-6 backdrop-blur-sm bg-black/30 flex flex-col items-center text-center">
                        <div className="bg-white p-2 rounded-xl shadow-lg mb-4">
                            {/* QR Code */}
                            <img
                                src={qrUrl}
                                alt="Ticket QR"
                                className="w-32 h-32 rounded-lg mix-blend-multiply"
                            />
                        </div>

                        <p className="font-black text-xl text-white uppercase shadow-sm tracking-wide">Access Granted</p>

                        <div className="mt-3 p-2 px-4 bg-black/40 rounded-full border border-white/10 inline-flex items-center gap-2">
                            <span className="text-xs font-mono text-white/80">{ticketId}</span>
                        </div>

                        <div className="mt-4 flex flex-col gap-1">
                            <div className="flex items-center justify-center gap-2">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">AI Generated Ticket</span>
                            </div>
                            <p className="text-[10px] text-white/50 font-mono">
                                Owner: {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => setDemoPurchaseSuccess(false)}
                >
                    Buy Another Ticket
                </Button>
            </div>
        );
    }

    // Show login success message with purchase button
    if (authenticated && embeddedWallet && isNovice) {
        return (
            <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm">
                    <p className="font-bold">✓ Wallet Ready!</p>
                    <p className="text-xs text-green-400/60 font-mono mt-1">
                        {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
                    </p>
                </div>
                <Button
                    className="w-full h-16 rounded-full text-lg font-black uppercase italic bg-gradient-to-r from-green-500 to-emerald-600"
                    onClick={handleDemoPurchase}
                    disabled={disabled || isProcessingDemo}
                >
                    {isProcessingDemo ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Minting NFT...
                        </>
                    ) : (
                        `Complete Purchase • ${ticketPrice}`
                    )}
                </Button>
                <p className="text-center text-xs text-white/40">
                    <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />
                    AI created a wallet for you automatically
                </p>
            </div>
        );
    }

    // Novice user: Simple, non-scary button (ONLY if not curious/native)
    if (isNovice && !isCurious && !isNative) {
        return (
            <div className="space-y-3">
                <Button
                    className="w-full h-16 rounded-full text-lg font-black uppercase italic bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={handleSimpleCheckout}
                    disabled={disabled || isPending || isLoggingIn}
                >
                    {isLoggingIn ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Setting up...
                        </>
                    ) : isPending ? (
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

            {(result?.shouldOfferEmbeddedWallet || isCurious) && (
                <Button
                    variant="secondary"
                    className="w-full h-12 rounded-full border-2 border-white/10 hover:bg-white/10 text-white"
                    onClick={handleSimpleCheckout}
                    disabled={disabled || isPending || isLoggingIn}
                >
                    {isLoggingIn ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                    )}
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
