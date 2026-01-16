'use client';

import { motion } from 'framer-motion';
import { Trophy, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface BadgeUnlockProps {
    tier: 'bronze' | 'silver' | 'gold';
    artistName: string;
    isOpen: boolean;
    onClose: () => void;
}

const tierConfig = {
    bronze: {
        gradient: 'from-amber-600 to-yellow-800',
        glow: 'shadow-amber-500/50',
        label: 'Bronze Fan',
        emoji: '🥉'
    },
    silver: {
        gradient: 'from-gray-300 to-gray-500',
        glow: 'shadow-gray-400/50',
        label: 'Silver Fan',
        emoji: '🥈'
    },
    gold: {
        gradient: 'from-yellow-400 to-amber-500',
        glow: 'shadow-yellow-500/50',
        label: 'Gold Fan',
        emoji: '🥇'
    }
};

export default function BadgeUnlock({ tier, artistName, isOpen, onClose }: BadgeUnlockProps) {
    const config = tierConfig[tier];

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative max-w-sm w-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Confetti effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-yellow-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'
                                }`}
                            initial={{
                                x: '50%',
                                y: '50%',
                                scale: 0
                            }}
                            animate={{
                                x: `${Math.random() * 100}%`,
                                y: `${Math.random() * 100}%`,
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.05,
                                ease: 'easeOut'
                            }}
                        />
                    ))}
                </div>

                {/* Badge Card */}
                <div className="bg-gray-900 rounded-3xl border border-white/10 overflow-hidden">
                    {/* Header glow */}
                    <div className={`h-32 bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            >
                                <Sparkles className="w-32 h-32 text-white/20" />
                            </motion.div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl">{config.emoji}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 text-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-1">
                                Badge Unlocked!
                            </h2>
                            <p className={`text-lg font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                                {config.label}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 mb-6"
                        >
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <Trophy className="w-4 h-4" />
                                <span>{artistName}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-3"
                        >
                            <p className="text-sm text-gray-500">
                                This NFT badge has been minted to your wallet and boosts your Fandom Score!
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                                >
                                    Close
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    View Badge
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
