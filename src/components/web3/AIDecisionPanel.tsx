'use client';

import { useWeb3Comfort } from '@/hooks/useWeb3Comfort';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, CheckCircle, XCircle, Sparkles, Minimize2 } from 'lucide-react';
import { useState } from 'react';

export function AIDecisionPanel() {
    const { result, signals, isAnalyzing, walletInfo, aiMessage } = useWeb3Comfort();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    if (!result && !isAnalyzing) return null;

    // AI Chat Bubble (floats above everything)
    const ChatBubble = () => (
        <AnimatePresence>
            {aiMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -top-32 left-0 right-0 z-[100] pointer-events-none"
                    key="chat-bubble"
                >
                    <div className="bg-white text-black p-4 rounded-2xl rounded-bl-sm shadow-2xl mx-auto w-64 text-sm font-bold border-2 border-purple-500 relative">
                        {aiMessage}
                        <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b-2 border-r-2 border-purple-500 transform rotate-45"></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Minimized view
    if (isMinimized) {
        return (
            <div className="fixed bottom-4 left-4 z-50">
                <ChatBubble />
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setIsMinimized(false)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border ${result?.level === 'novice' ? 'bg-green-500/20 border-green-500/50' :
                        result?.level === 'curious' ? 'bg-yellow-500/20 border-yellow-500/50' :
                            result?.level === 'native' ? 'bg-purple-500/20 border-purple-500/50' :
                                'bg-gray-500/20 border-gray-500/50'
                        } hover:scale-110 transition-transform backdrop-blur-xl`}
                    title="Expand AI Panel"
                >
                    <Brain className="w-6 h-6 text-purple-400" />
                </motion.button>
            </div>
        );
    }

    const steps = [
        {
            label: 'Wallet extension',
            status: 'complete',
            detail: walletInfo?.hasWallet ? `✓ ${walletInfo.walletType || 'Detected'}` : '✗ None found',
            icon: walletInfo?.hasWallet ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />
        },
        {
            label: 'Wallet connected',
            status: 'complete',
            detail: signals?.hasConnectedWalletBefore ? '✓ Previously connected' : '✗ Never connected',
            icon: signals?.hasConnectedWalletBefore ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-yellow-400" />
        },
        {
            label: 'Transaction history',
            status: 'complete',
            detail: `${signals?.previousTransactionCount || 0} on-chain txns`,
            icon: (signals?.previousTransactionCount || 0) > 0 ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-yellow-400" />
        },
        {
            label: 'Failed attempts',
            status: 'complete',
            detail: `${signals?.failedTransactions || 0} failures`,
            icon: (signals?.failedTransactions || 0) > 2 ? <XCircle className="w-3 h-3 text-red-400" /> : <CheckCircle className="w-3 h-3 text-green-400" />
        },
        {
            label: 'Session behavior',
            status: 'complete',
            detail: `Visit #${signals?.sessionCount || 1} • ${signals?.timeOnWeb3UI || 0}s on Web3 UI`,
            icon: <Clock className="w-3 h-3 text-blue-400" />
        },
        {
            label: 'AI classification',
            status: isAnalyzing ? 'loading' : 'complete',
            detail: result?.level?.toUpperCase() || 'Processing...',
            icon: result ? <Brain className="w-3 h-3 text-purple-400" /> : <Brain className="w-3 h-3 text-purple-400 animate-pulse" />
        }
    ];

    const getDecisionColor = () => {
        switch (result?.level) {
            case 'novice': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
            case 'curious': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
            case 'native': return 'from-purple-500/20 to-blue-500/20 border-purple-500/30';
            default: return 'from-gray-500/20 to-gray-500/20 border-gray-500/30';
        }
    };

    const getDecisionText = () => {
        switch (result?.level) {
            case 'novice': return '→ Simplify Web3 UI';
            case 'curious': return '→ Show both options';
            case 'native': return '→ Full crypto experience';
            default: return '→ Analyzing...';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-4 left-4 z-50"
        >
            <ChatBubble />

            <div className={`bg-gradient-to-br ${getDecisionColor()} backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden max-w-xs transition-all duration-300`}>
                {/* Header */}
                <div className="flex items-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-1 p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold text-white">AI Web3 Decision</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAnalyzing ? (
                                <span className="text-xs text-purple-400 animate-pulse">Analyzing...</span>
                            ) : (
                                <span className={`text-xs font-bold uppercase ${result?.level === 'novice' ? 'text-green-400' :
                                    result?.level === 'curious' ? 'text-yellow-400' : 'text-purple-400'
                                    }`}>
                                    {result?.level}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-3 hover:bg-white/10 transition-colors"
                        title="Minimize"
                    >
                        <Minimize2 className="w-4 h-4 text-white/40 hover:text-white" />
                    </button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            {/* Steps */}
                            <div className="px-3 pb-2 space-y-1">
                                {steps.map((step, i) => (
                                    <motion.div
                                        key={step.label}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        {step.icon}
                                        <span className="text-white/60">{step.label}:</span>
                                        <span className="text-white/80 font-mono">{step.detail}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Decision */}
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-3 border-t border-white/10 bg-black/20"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm font-bold text-white">
                                            {getDecisionText()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40 mt-1 italic">
                                        {result.recommendation}
                                    </p>

                                    {/* Score Display */}
                                    <div className="mt-3 p-2 bg-white/5 rounded-lg">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/60">Comfort Score:</span>
                                            <span className="font-bold text-white">
                                                {result.scoreBreakdown?.total || 0}/100
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.scoreBreakdown?.total || 0}%` }}
                                                className={`h-full rounded-full ${(result.scoreBreakdown?.total || 0) >= 55 ? 'bg-purple-500' :
                                                    (result.scoreBreakdown?.total || 0) >= 25 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-white/30 mt-1">
                                            <span>Novice</span>
                                            <span>Curious</span>
                                            <span>Native</span>
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="text-xs text-white/40">AI Confidence:</span>
                                        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.confidence * 100}%` }}
                                                className="h-full bg-purple-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-xs text-white/40">{Math.round(result.confidence * 100)}%</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
