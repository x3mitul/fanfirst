'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Zap,
    Target,
    Brain,
    Heart,
    Crown,
    Medal,
    Flame
} from 'lucide-react';

type LeaderboardType = 'speed' | 'accuracy' | 'consistency' | 'community';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    userAvatar?: string;
    fandomScore?: number;
    score: number;
    metric: string;
    artistId?: string;
    artistName?: string;
    correctAnswers?: number;
    totalQuestions?: number;
    maxStreak?: number;
}

interface LeaderboardTabsProps {
    artistId?: string;
}

export default function LeaderboardTabs({ artistId }: LeaderboardTabsProps) {
    const [activeTab, setActiveTab] = useState<LeaderboardType>('accuracy');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const params = new URLSearchParams({ type: activeTab });
                if (artistId) params.append('artistId', artistId);

                const res = await fetch(`/api/leaderboard?${params}`);
                const data = await res.json();
                setEntries(data.leaderboard || []);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [activeTab, artistId]);

    const tabs = [
        { key: 'accuracy' as const, label: 'True Fan', icon: Target, color: 'purple' },
        { key: 'speed' as const, label: 'Speed King', icon: Zap, color: 'yellow' },
        { key: 'consistency' as const, label: 'Consistency', icon: Brain, color: 'orange' },
        { key: 'community' as const, label: 'Community', icon: Heart, color: 'pink' },
    ];

    const getScoreLabel = (type: LeaderboardType): string => {
        switch (type) {
            case 'speed': return 'Avg Response';
            case 'accuracy': return 'Accuracy';
            case 'consistency': return 'Consistency';
            case 'community': return 'Votes';
        }
    };

    const formatScore = (score: number, type: LeaderboardType): string => {
        if (type === 'speed') {
            return `${(score / 1000).toFixed(2)}s`;
        }
        return `${score.toFixed(0)}`;
    };

    return (
        <div className="bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${activeTab === tab.key
                                ? `text-${tab.color}-400 border-b-2 border-${tab.color}-400 bg-${tab.color}-500/10`
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Loading leaderboard...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="py-12 text-center">
                        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No entries yet</p>
                        <p className="text-gray-500 text-sm">Be the first to complete a quiz!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entries.map((entry, index) => (
                            <motion.div
                                key={entry.userId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center gap-4 p-4 rounded-xl ${entry.rank <= 3
                                        ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20'
                                        : 'bg-white/5'
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-10 text-center">
                                    {entry.rank === 1 ? (
                                        <Crown className="w-6 h-6 text-yellow-400 mx-auto" />
                                    ) : entry.rank === 2 ? (
                                        <Medal className="w-6 h-6 text-gray-300 mx-auto" />
                                    ) : entry.rank === 3 ? (
                                        <Medal className="w-6 h-6 text-orange-400 mx-auto" />
                                    ) : (
                                        <span className="text-gray-500 font-mono">#{entry.rank}</span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {entry.userAvatar ? (
                                        <img
                                            src={entry.userAvatar}
                                            alt={entry.userName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        entry.userName.charAt(0).toUpperCase()
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white truncate">{entry.userName}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        {entry.artistName && (
                                            <span>{entry.artistName}</span>
                                        )}
                                        {entry.maxStreak && entry.maxStreak > 0 && (
                                            <span className="flex items-center gap-1 text-orange-400">
                                                <Flame className="w-3 h-3" />
                                                {entry.maxStreak}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${activeTab === 'accuracy' ? 'text-purple-400' :
                                            activeTab === 'speed' ? 'text-yellow-400' :
                                                activeTab === 'consistency' ? 'text-orange-400' :
                                                    'text-pink-400'
                                        }`}>
                                        {formatScore(entry.score, activeTab)}
                                    </div>
                                    <div className="text-xs text-gray-500">{getScoreLabel(activeTab)}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
