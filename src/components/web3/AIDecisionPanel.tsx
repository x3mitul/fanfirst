'use client';

import { useWeb3Comfort } from '@/hooks/useWeb3Comfort';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Wifi, Wallet, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function AIDecisionPanel() {
    const { result, signals, isAnalyzing } = useWeb3Comfort();
    const [isExpanded, setIsExpanded] = useState(true);

    if (!result && !isAnalyzing) return null;

    const steps = [
        {
            label: 'Scanning browser',
            status: 'complete',
            detail: signals?.hasWalletExtension ? 'Wallet detected' : 'No wallet extension',
            icon: signals?.hasWalletExtension ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-yellow-400" />
        },
        {
            label: 'Checking history',
            status: 'complete',
            detail: `${signals?.previousTransactionCount || 0} previous transactions`,
            icon: signals?.previousTransactionCount ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-yellow-400" />
        },
        {
            label: 'Session analysis',
            status: 'complete',
            detail: `Session #${signals?.sessionCount || 1}`,
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-4 right-4 z-50"
        >
            <div className={`bg-gradient-to-br ${getDecisionColor()} backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden max-w-xs`}>
                {/* Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
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
                                    <div className="flex items-center gap-1 mt-2">
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
