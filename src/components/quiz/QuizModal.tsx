'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Clock, CheckCircle2, XCircle, Trophy, Zap, Flame, X,
    TrendingUp, TrendingDown, Medal, Users, Crown, Star
} from 'lucide-react';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: string;
}

interface LeaderboardEntry {
    rank: number;
    visitorId: string;
    score?: number;
    avgScore?: number;
    accuracy?: number;
    artistsPlayed?: number;
    isCurrentUser: boolean;
}

interface QuizResults {
    userStats: {
        averageScore: number;
        bestScore: number;
        attemptCount: number;
        isNewHighScore: boolean;
        previousBestScore: number;
        improvement: number;
    };
    rankings: {
        artist: {
            rank: number;
            total: number;
            leaderboard: LeaderboardEntry[];
        };
        global: {
            rank: number;
            total: number;
            leaderboard: LeaderboardEntry[];
        };
    };
}

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (score: number, correctAnswers: number, totalQuestions: number) => void;
    artistName: string;
}

// Generate or retrieve visitor ID for anonymous tracking
const getVisitorId = (): string => {
    if (typeof window === 'undefined') return 'server';
    let id = localStorage.getItem('fanfirst_visitor_id');
    if (!id) {
        id = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('fanfirst_visitor_id', id);
    }
    return id;
};

export default function QuizModal({ isOpen, onClose, onComplete, artistName }: QuizModalProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(7);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [phase, setPhase] = useState<'loading' | 'playing' | 'results' | 'leaderboard'>('loading');
    const [responseTimes, setResponseTimes] = useState<number[]>([]);
    const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
    const [leaderboardTab, setLeaderboardTab] = useState<'artist' | 'global'>('artist');

    const questionStartTime = useRef<number>(Date.now());
    const visitorId = useRef<string>('');

    // Fetch questions when modal opens
    useEffect(() => {
        if (isOpen) {
            visitorId.current = getVisitorId();
            fetchQuestions();
        }
    }, [isOpen, artistName]);

    const fetchQuestions = async () => {
        setLoading(true);
        setPhase('loading');

        try {
            const res = await fetch('/api/quiz/generate-inline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artistName })
            });

            const data = await res.json();

            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                resetQuizState();
                setPhase('playing');
            }
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            // Use hardcoded fallback
            setQuestions(getFallbackQuestions(artistName));
            resetQuizState();
            setPhase('playing');
        } finally {
            setLoading(false);
        }
    };

    const getFallbackQuestions = (artist: string): QuizQuestion[] => [
        { question: `What year was ${artist} most active?`, options: ['1990s', '2000s', '2010s', '2020s'], correctAnswer: '2010s', difficulty: 'easy', type: 'history' },
        { question: `Complete: "${artist} is the ___"`, options: ['best', 'greatest', 'legend', 'champion'], correctAnswer: 'greatest', difficulty: 'easy', type: 'fill_blank' },
        { question: `How many major achievements does ${artist} have?`, options: ['5-10', '11-15', '16-20', '20+'], correctAnswer: '16-20', difficulty: 'medium', type: 'achievement' },
        { question: `Which venue is famous for ${artist}?`, options: ['Stadium A', 'Arena B', 'Center C', 'Hall D'], correctAnswer: 'Arena B', difficulty: 'medium', type: 'venue' },
        { question: `What is ${artist}'s signature move/song?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 'Option A', difficulty: 'hard', type: 'signature' }
    ];

    const resetQuizState = () => {
        setCurrentIndex(0);
        setTimeLeft(7);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setCorrectCount(0);
        setStreak(0);
        setMaxStreak(0);
        setResponseTimes([]);
        setQuizResults(null);
        questionStartTime.current = Date.now();
    };

    // Timer countdown
    useEffect(() => {
        if (!isOpen || phase !== 'playing' || timeLeft <= 0 || isAnswered) return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    handleTimeout();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, phase, timeLeft, isAnswered]);

    const handleTimeout = useCallback(() => {
        if (!isAnswered && questions.length > 0) {
            setIsAnswered(true);
            setStreak(0);
            const questionTime = questions[currentIndex]?.difficulty === 'hard' ? 10000 : 7000;
            setResponseTimes(prev => [...prev, questionTime]);
            setTimeout(() => moveToNext(), 1500);
        }
    }, [isAnswered, questions, currentIndex]);

    const handleAnswer = (answer: string) => {
        if (isAnswered || questions.length === 0) return;

        const responseTime = Date.now() - questionStartTime.current;
        const isCorrect = answer === questions[currentIndex].correctAnswer;

        setSelectedAnswer(answer);
        setIsAnswered(true);
        setResponseTimes(prev => [...prev, responseTime]);

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                setMaxStreak(current => Math.max(current, newStreak));
                return newStreak;
            });
        } else {
            setStreak(0);
        }

        setTimeout(() => moveToNext(), 1200);
    };

    const moveToNext = useCallback(() => {
        if (currentIndex + 1 >= questions.length) {
            submitResults();
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            // Harder questions get more time
            const nextDifficulty = questions[currentIndex + 1]?.difficulty;
            setTimeLeft(nextDifficulty === 'hard' ? 10 : nextDifficulty === 'medium' ? 8 : 7);
            questionStartTime.current = Date.now();
        }
    }, [currentIndex, questions]);

    const submitResults = async () => {
        const accuracy = (correctCount / questions.length) * 100;
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const speedScore = Math.max(0, 100 - (avgTime / 100));
        const finalScore = (accuracy * 0.5) + (speedScore * 0.3) + (maxStreak * 10 * 0.2);

        setPhase('results');

        try {
            const res = await fetch('/api/quiz/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId: visitorId.current,
                    artistName,
                    score: finalScore,
                    accuracyScore: accuracy,
                    speedScore,
                    correctAnswers: correctCount,
                    totalQuestions: questions.length,
                    responseTimes
                })
            });

            const data = await res.json();
            setQuizResults(data);
        } catch (error) {
            console.error('Failed to submit results:', error);
            // Fallback results
            setQuizResults({
                userStats: {
                    averageScore: finalScore,
                    bestScore: finalScore,
                    attemptCount: 1,
                    isNewHighScore: true,
                    previousBestScore: 0,
                    improvement: 0
                },
                rankings: {
                    artist: { rank: 1, total: 1, leaderboard: [] },
                    global: { rank: 1, total: 1, leaderboard: [] }
                }
            });
        }
    };

    const showLeaderboard = () => {
        setPhase('leaderboard');
    };

    const handleComplete = () => {
        const accuracy = (correctCount / questions.length) * 100;
        const avgTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;
        const speedScore = Math.max(0, 100 - (avgTime / 100));
        const finalScore = (accuracy * 0.5) + (speedScore * 0.3) + (maxStreak * 10 * 0.2);

        onComplete(finalScore, correctCount, questions.length);
    };

    if (!isOpen) return null;

    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                {/* Loading Phase */}
                {phase === 'loading' && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Generating Questions...</h3>
                        <p className="text-sm text-gray-400">Powered by Gemini AI</p>
                    </div>
                )}

                {/* Playing Phase */}
                {phase === 'playing' && currentQuestion && (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-gray-400">
                                    {currentIndex + 1}/{questions.length}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                        currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {currentQuestion.difficulty}
                                </span>
                                {streak > 1 && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs">
                                        <Flame className="w-3 h-3" />
                                        {streak}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono ${timeLeft <= 3 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white'
                                    }`}>
                                    <Clock className="w-4 h-4" />
                                    {timeLeft}s
                                </div>
                                <button onClick={onClose} className="text-gray-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-gray-800">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Question */}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h3 className="text-lg font-bold text-white mb-6">
                                        {currentQuestion.question}
                                    </h3>

                                    <div className="space-y-3">
                                        {currentQuestion.options.map((option, i) => {
                                            const isSelected = selectedAnswer === option;
                                            const isCorrect = option === currentQuestion.correctAnswer;
                                            const showResult = isAnswered;

                                            return (
                                                <motion.button
                                                    key={i}
                                                    onClick={() => handleAnswer(option)}
                                                    disabled={isAnswered}
                                                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                                    className={`w-full p-4 rounded-xl text-left font-medium transition-all flex items-center gap-3 ${showResult && isCorrect
                                                            ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                                            : showResult && isSelected && !isCorrect
                                                                ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                                                                : isAnswered
                                                                    ? 'bg-gray-800/50 text-gray-500'
                                                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-purple-500/50'
                                                        }`}
                                                >
                                                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="flex-1">{option}</span>
                                                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />}
                                                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </>
                )}

                {/* Results Phase */}
                {phase === 'results' && quizResults && (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic mb-1">Quiz Complete!</h2>
                            <p className="text-gray-400 text-sm">{correctCount}/{questions.length} correct</p>
                        </div>

                        {/* New High Score Badge */}
                        {quizResults.userStats.isNewHighScore && (
                            <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
                                <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold">
                                    <Crown className="w-5 h-5" />
                                    New Personal Best!
                                </div>
                            </div>
                        )}

                        {/* Score Cards */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-center">
                                <div className="text-xl font-bold text-purple-400">
                                    {Math.round((correctCount / questions.length) * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">Accuracy</div>
                            </div>
                            <div className="p-3 rounded-xl bg-pink-500/10 text-center">
                                <div className="text-xl font-bold text-pink-400">{maxStreak}</div>
                                <div className="text-xs text-gray-500">Max Streak</div>
                            </div>
                            <div className="p-3 rounded-xl bg-green-500/10 text-center">
                                <div className="text-xl font-bold text-green-400">+{correctCount * 5}</div>
                                <div className="text-xs text-gray-500">Points</div>
                            </div>
                        </div>

                        {/* Progress Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <div>
                                    <div className="text-sm font-bold text-white">{Math.round(quizResults.userStats.bestScore)}</div>
                                    <div className="text-xs text-gray-500">Best Score</div>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3">
                                <Medal className="w-5 h-5 text-orange-400" />
                                <div>
                                    <div className="text-sm font-bold text-white">{Math.round(quizResults.userStats.averageScore)}</div>
                                    <div className="text-xs text-gray-500">Avg Score</div>
                                </div>
                            </div>
                        </div>

                        {/* Improvement */}
                        {quizResults.userStats.attemptCount > 1 && (
                            <div className={`p-3 rounded-xl mb-4 flex items-center justify-center gap-2 ${quizResults.userStats.improvement >= 0
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-red-500/10 text-red-400'
                                }`}>
                                {quizResults.userStats.improvement >= 0
                                    ? <TrendingUp className="w-5 h-5" />
                                    : <TrendingDown className="w-5 h-5" />
                                }
                                <span className="font-bold">
                                    {quizResults.userStats.improvement >= 0 ? '+' : ''}{quizResults.userStats.improvement}%
                                </span>
                                <span className="text-sm opacity-80">vs last attempt</span>
                            </div>
                        )}

                        {/* Ranking Preview */}
                        <div className="p-4 rounded-xl bg-white/5 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">#{quizResults.rankings.artist.rank}</div>
                                    <div className="text-xs text-gray-500">of {quizResults.rankings.artist.total} {artistName} fans</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-pink-400">#{quizResults.rankings.global.rank}</div>
                                    <div className="text-xs text-gray-500">of {quizResults.rankings.global.total} globally</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={showLeaderboard}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Users className="w-5 h-5" />
                                View Leaderboard
                            </button>
                            <button
                                onClick={handleComplete}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Continue to Purchase
                            </button>
                        </div>
                    </div>
                )}

                {/* Leaderboard Phase */}
                {phase === 'leaderboard' && quizResults && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                                Leaderboard
                            </h2>
                            <button onClick={() => setPhase('results')} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setLeaderboardTab('artist')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${leaderboardTab === 'artist'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                {artistName} Fans
                            </button>
                            <button
                                onClick={() => setLeaderboardTab('global')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${leaderboardTab === 'global'
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                Global
                            </button>
                        </div>

                        {/* Your Position */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                        #{leaderboardTab === 'artist'
                                            ? quizResults.rankings.artist.rank
                                            : quizResults.rankings.global.rank}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">You</div>
                                        <div className="text-xs text-gray-400">
                                            {leaderboardTab === 'artist'
                                                ? `${quizResults.rankings.artist.total} total fans`
                                                : `${quizResults.rankings.global.total} total players`
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white">
                                        {Math.round(quizResults.userStats.bestScore)}
                                    </div>
                                    <div className="text-xs text-gray-400">Best Score</div>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard List */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {(leaderboardTab === 'artist'
                                ? quizResults.rankings.artist.leaderboard
                                : quizResults.rankings.global.leaderboard
                            ).map((entry) => (
                                <div
                                    key={entry.rank}
                                    className={`flex items-center justify-between p-3 rounded-xl ${entry.isCurrentUser
                                            ? 'bg-purple-500/20 border border-purple-500/30'
                                            : 'bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${entry.rank === 1 ? 'bg-yellow-500 text-black' :
                                                entry.rank === 2 ? 'bg-gray-300 text-black' :
                                                    entry.rank === 3 ? 'bg-orange-600 text-white' :
                                                        'bg-white/10 text-white'
                                            }`}>
                                            {entry.rank}
                                        </div>
                                        <span className={`font-medium ${entry.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                                            {entry.isCurrentUser ? 'You' : entry.visitorId}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-white">
                                            {leaderboardTab === 'artist'
                                                ? entry.score
                                                : entry.avgScore
                                            }
                                        </div>
                                        {leaderboardTab === 'global' && entry.artistsPlayed && (
                                            <div className="text-xs text-gray-500">{entry.artistsPlayed} artists</div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {(leaderboardTab === 'artist'
                                ? quizResults.rankings.artist.leaderboard
                                : quizResults.rankings.global.leaderboard
                            ).length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                        <p>Be the first on the leaderboard!</p>
                                    </div>
                                )}
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={handleComplete}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Continue to Purchase
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
