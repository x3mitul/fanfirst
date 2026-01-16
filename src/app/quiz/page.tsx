'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Brain,
    Trophy,
    Zap,
    Users2,
    Clock,
    ArrowRight,
    Sparkles,
    Target
} from 'lucide-react';

interface Quiz {
    id: string;
    artistId: string;
    artistName: string;
    type: 'live' | 'async';
    status: 'pending' | 'active' | 'completed';
    duration: number;
    questionCount: number;
    createdAt: string;
    _count: {
        attempts: number;
        questions: number;
    };
}

export default function QuizLobbyPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'live' | 'async'>('all');

    useEffect(() => {
        async function fetchQuizzes() {
            try {
                const res = await fetch('/api/quiz?status=active');
                const data = await res.json();
                setQuizzes(data.quizzes || []);
            } catch (error) {
                console.error('Failed to fetch quizzes:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchQuizzes();
    }, []);

    const filteredQuizzes = quizzes.filter(q =>
        filter === 'all' || q.type === filter
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-300 text-sm font-medium">Prove Your Fandom</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            FanIQ{' '}
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                                Arena
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Real fans earn access by proving they care—not by clicking faster.
                            Test your knowledge, build your Fandom Score, and unlock exclusive rewards.
                        </p>

                        {/* Stats Row */}
                        <div className="flex justify-center gap-8 mb-12">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{quizzes.length}</div>
                                <div className="text-sm text-gray-500">Active Quizzes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-400">50%</div>
                                <div className="text-sm text-gray-500">Accuracy Weight</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-400">30%</div>
                                <div className="text-sm text-gray-500">Speed Weight</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-400">20%</div>
                                <div className="text-sm text-gray-500">Consistency Weight</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-12 border-y border-white/10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Target, label: 'Multi-Factor Scoring', color: 'text-purple-400' },
                            { icon: Zap, label: 'Time-Decay Questions', color: 'text-yellow-400' },
                            { icon: Trophy, label: '4 Leaderboard Types', color: 'text-orange-400' },
                            { icon: Sparkles, label: 'NFT Badges', color: 'text-pink-400' },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                            >
                                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                                <span className="text-sm text-gray-300">{feature.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quiz List */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    {/* Filter Tabs */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Available Quizzes</h2>
                        <div className="flex gap-2">
                            {(['all', 'live', 'async'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                >
                                    {f === 'all' ? 'All' : f === 'live' ? '🔴 Live' : '🟢 Async'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-gray-500">Loading quizzes...</p>
                        </div>
                    ) : filteredQuizzes.length === 0 ? (
                        <div className="text-center py-20">
                            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Active Quizzes</h3>
                            <p className="text-gray-500">Check back soon for new challenges!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.map((quiz, i) => (
                                <motion.div
                                    key={quiz.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link href={`/quiz/${quiz.id}`}>
                                        <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                                            {/* Type Badge */}
                                            <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-medium ${quiz.type === 'live'
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                }`}>
                                                {quiz.type === 'live' ? '🔴 LIVE' : '🟢 ASYNC'}
                                            </div>

                                            {/* Artist */}
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                                {quiz.artistName}
                                            </h3>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <Brain className="w-4 h-4" />
                                                    {quiz.questionCount} questions
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {Math.floor(quiz.duration / 60)}min
                                                </span>
                                            </div>

                                            {/* Participants */}
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Users2 className="w-4 h-4" />
                                                {quiz._count.attempts} attempts
                                            </div>

                                            {/* CTA */}
                                            <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:text-purple-300">
                                                Start Quiz
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How Scoring Works */}
            <section className="py-16 border-t border-white/10">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl font-bold text-white text-center mb-12">How Scoring Works</h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                <Target className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Accuracy (50%)</h3>
                            <p className="text-sm text-gray-400">Get the answers right. Knowledge is king.</p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                            <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-pink-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Speed (30%)</h3>
                            <p className="text-sm text-gray-400">Quick reflexes matter. But bots get penalized.</p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                                <Brain className="w-8 h-8 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Consistency (20%)</h3>
                            <p className="text-sm text-gray-400">Stay steady. Bots are inconsistent. Humans win.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
