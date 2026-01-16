'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Clock,
    CheckCircle2,
    XCircle,
    Trophy,
    Zap,
    ArrowRight,
    Users2,
    Flame
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface Question {
    id: string;
    question: string;
    type: 'multiple_choice' | 'fill_blank' | 'order' | 'visual' | 'creative';
    options: string[];
    imageUrl?: string;
    timeLimit: number;
    difficulty: 'easy' | 'medium' | 'hard';
    orderIndex: number;
}

interface Quiz {
    id: string;
    artistId: string;
    artistName: string;
    type: 'live' | 'async';
    status: string;
    duration: number;
    questionCount: number;
    questions: Question[];
}

interface QuizResult {
    finalScore: number;
    accuracyScore: number;
    speedScore: number;
    consistencyScore: number;
    fandomBonus: number;
    rank: number;
    correctAnswers: number;
    totalQuestions: number;
}

export default function QuizArenaPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;
    const { user, isAuthenticated } = useStore();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [responses, setResponses] = useState<Array<{
        questionId: string;
        answer: string;
        responseTime: number;
        isCorrect?: boolean;
    }>>([]);
    const [streak, setStreak] = useState(0);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<'loading' | 'ready' | 'playing' | 'completed'>('loading');

    const questionStartTime = useRef<number>(0);

    // Fetch quiz data
    useEffect(() => {
        async function fetchQuiz() {
            try {
                const res = await fetch(`/api/quiz/${quizId}`);
                const data = await res.json();
                if (data.quiz) {
                    setQuiz(data.quiz);
                    setPhase('ready');
                }
            } catch (error) {
                console.error('Failed to fetch quiz:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchQuiz();
    }, [quizId]);

    // Timer countdown
    useEffect(() => {
        if (phase !== 'playing' || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    const handleTimeUp = useCallback(() => {
        if (!isAnswered && quiz) {
            const responseTime = Date.now() - questionStartTime.current;
            const currentQuestion = quiz.questions[currentIndex];

            setResponses(prev => [...prev, {
                questionId: currentQuestion.id,
                answer: '',
                responseTime,
                isCorrect: false
            }]);
            setStreak(0);
            setIsAnswered(true);

            setTimeout(() => moveToNextQuestion(), 1500);
        }
    }, [isAnswered, quiz, currentIndex]);

    const startQuiz = async () => {
        if (!isAuthenticated || !user || !quiz) return;

        try {
            const res = await fetch(`/api/quiz/${quizId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start', userId: user.id })
            });
            const data = await res.json();

            if (data.attempt) {
                setAttemptId(data.attempt.id);
                setPhase('playing');
                setTimeLeft(quiz.questions[0].timeLimit);
                questionStartTime.current = Date.now();
            }
        } catch (error) {
            console.error('Failed to start quiz:', error);
        }
    };

    const handleAnswer = (answer: string) => {
        if (isAnswered || !quiz) return;

        const responseTime = Date.now() - questionStartTime.current;
        const currentQuestion = quiz.questions[currentIndex];

        // We don't know if correct yet (server knows), but we record it
        setSelectedAnswer(answer);
        setIsAnswered(true);

        setResponses(prev => [...prev, {
            questionId: currentQuestion.id,
            answer,
            responseTime
        }]);

        setTimeout(() => moveToNextQuestion(), 1000);
    };

    const moveToNextQuestion = () => {
        if (!quiz) return;

        if (currentIndex + 1 >= quiz.questions.length) {
            submitQuiz();
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setTimeLeft(quiz.questions[currentIndex + 1].timeLimit);
            questionStartTime.current = Date.now();
        }
    };

    const submitQuiz = async () => {
        if (!attemptId) return;

        try {
            const res = await fetch(`/api/quiz/${quizId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit',
                    attemptId,
                    responses
                })
            });
            const data = await res.json();

            setResult({
                finalScore: data.scores.finalScore,
                accuracyScore: data.scores.accuracyScore,
                speedScore: data.scores.speedScore,
                consistencyScore: data.scores.consistencyScore,
                fandomBonus: data.fandomBonus,
                rank: data.rank,
                correctAnswers: data.attempt.correctAnswers,
                totalQuestions: data.attempt.totalQuestions
            });
            setPhase('completed');
        } catch (error) {
            console.error('Failed to submit quiz:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-400">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Quiz Not Found</h2>
                    <button
                        onClick={() => router.push('/quiz')}
                        className="text-purple-400 hover:text-purple-300"
                    >
                        Back to Quiz Lobby
                    </button>
                </div>
            </div>
        );
    }

    // Ready Phase - Pre-quiz screen
    if (phase === 'ready') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg w-full"
                >
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-10 h-10 text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{quiz.artistName}</h1>
                        <p className="text-gray-400">FanIQ Challenge</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/10 mb-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-4 rounded-xl bg-white/5">
                                <div className="text-2xl font-bold text-white">{quiz.questionCount}</div>
                                <div className="text-sm text-gray-400">Questions</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/5">
                                <div className="text-2xl font-bold text-white">{Math.floor(quiz.duration / 60)}min</div>
                                <div className="text-sm text-gray-400">Duration</div>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span>Each question has a time limit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span>Score = 50% accuracy + 30% speed + 20% consistency</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span>Earn Fandom Score points for correct answers</span>
                            </div>
                        </div>
                    </div>

                    {!isAuthenticated ? (
                        <div className="text-center">
                            <p className="text-gray-400 mb-4">Please log in to take this quiz</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                            >
                                Log In to Continue
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startQuiz}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            Start Quiz
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </motion.div>
            </div>
        );
    }

    // Playing Phase
    if (phase === 'playing') {
        const currentQuestion = quiz.questions[currentIndex];
        const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
        const isCreative = currentQuestion.type === 'creative';

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">
                                Question {currentIndex + 1}/{quiz.questions.length}
                            </span>
                            {streak > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                                    <Flame className="w-4 h-4" />
                                    {streak} streak
                                </div>
                            )}
                        </div>

                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
                            }`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-bold">{timeLeft}s</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-gray-800/50 rounded-2xl p-8 border border-white/10"
                        >
                            {/* Creative Badge */}
                            {isCreative && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm mb-4">
                                    <Brain className="w-4 h-4" />
                                    Human Verification Question
                                </div>
                            )}

                            {/* Question */}
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                                {currentQuestion.question}
                            </h2>

                            {/* Image if present */}
                            {currentQuestion.imageUrl && (
                                <div className="mb-6 rounded-xl overflow-hidden">
                                    <img
                                        src={currentQuestion.imageUrl}
                                        alt="Question visual"
                                        className="w-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Options */}
                            <div className="grid gap-3">
                                {currentQuestion.options.map((option, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered}
                                        whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                        className={`w-full p-4 rounded-xl text-left font-medium transition-all ${isAnswered && selectedAnswer === option
                                                ? 'bg-purple-500 text-white border-2 border-purple-400'
                                                : isAnswered
                                                    ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-sm mr-3">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {option}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Completed Phase - Results
    if (phase === 'completed' && result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg w-full"
                >
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
                        <p className="text-gray-400">Rank #{result.rank} • {quiz.artistName}</p>
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/10 mb-6">
                        <div className="text-center mb-6">
                            <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {result.finalScore.toFixed(1)}
                            </div>
                            <div className="text-gray-400">Final Score</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 rounded-xl bg-purple-500/10">
                                <div className="text-lg font-bold text-purple-400">{result.accuracyScore.toFixed(0)}%</div>
                                <div className="text-xs text-gray-400">Accuracy</div>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-pink-500/10">
                                <div className="text-lg font-bold text-pink-400">{result.speedScore.toFixed(0)}</div>
                                <div className="text-xs text-gray-400">Speed</div>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-orange-500/10">
                                <div className="text-lg font-bold text-orange-400">{result.consistencyScore.toFixed(0)}</div>
                                <div className="text-xs text-gray-400">Consistency</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-green-400" />
                                <span className="text-green-300">Fandom Score Bonus</span>
                            </div>
                            <span className="text-lg font-bold text-green-400">+{result.fandomBonus}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10 text-center">
                            <div className="text-2xl font-bold text-white">{result.correctAnswers}/{result.totalQuestions}</div>
                            <div className="text-sm text-gray-400">Correct Answers</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10 text-center">
                            <div className="text-2xl font-bold text-white">#{result.rank}</div>
                            <div className="text-sm text-gray-400">Your Rank</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/quiz')}
                            className="w-full py-4 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
                        >
                            Back to Quiz Lobby
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                        >
                            View Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
}
