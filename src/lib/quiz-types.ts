// FanIQ Arena Types

export interface QuizQuestion {
    id: string;
    quizId: string;
    question: string;
    type: 'multiple_choice' | 'fill_blank' | 'order' | 'visual' | 'creative';
    options: string[];
    correctAnswer: string;
    imageUrl?: string;
    timeLimit: number;
    difficulty: 'easy' | 'medium' | 'hard';
    orderIndex: number;
}

export interface Quiz {
    id: string;
    eventId?: string;
    artistId: string;
    artistName: string;
    type: 'live' | 'async';
    status: 'pending' | 'active' | 'completed';
    duration: number;
    questionCount: number;
    startTime?: Date;
    endTime?: Date;
    createdAt: Date;
    questions?: QuizQuestion[];
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    correctAnswers: number;
    totalQuestions: number;
    avgResponseTime: number;
    responseTimeStdDev: number;
    streak: number;
    maxStreak: number;
    finalScore: number;
    speedScore: number;
    accuracyScore: number;
    consistencyScore: number;
    rank?: number;
    status: 'in_progress' | 'completed';
    startedAt: Date;
    completedAt?: Date;
}

export interface QuizResponse {
    id: string;
    attemptId: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    responseTime: number;
    answeredAt: Date;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    userAvatar?: string;
    score: number;
    metric: string; // "speed" | "accuracy" | "consistency" | "community"
    quizCount: number;
    artistId?: string;
}

export interface QuizLiveState {
    quizId: string;
    currentQuestionIndex: number;
    currentQuestion?: QuizQuestion;
    timeRemaining: number;
    participants: number;
    leaderboard: LeaderboardEntry[];
}

// Socket events
export interface QuizSocketEvents {
    // Client -> Server
    'quiz:join': (quizId: string) => void;
    'quiz:leave': (quizId: string) => void;
    'quiz:answer': (data: {
        quizId: string;
        questionId: string;
        answer: string;
        responseTime: number
    }) => void;
    'quiz:ready': (quizId: string) => void;

    // Server -> Client
    'quiz:question': (question: QuizQuestion & { questionNumber: number }) => void;
    'quiz:answer:result': (data: { isCorrect: boolean; streak: number }) => void;
    'quiz:leaderboard:update': (leaderboard: LeaderboardEntry[]) => void;
    'quiz:countdown': (seconds: number) => void;
    'quiz:complete': (data: {
        attempt: QuizAttempt;
        rank: number;
        fandomBonus: number
    }) => void;
    'quiz:participant:count': (count: number) => void;
}

export type LeaderboardType = 'speed' | 'accuracy' | 'consistency' | 'community';

export interface FanIQBadge {
    id: string;
    userId: string;
    tier: 'bronze' | 'silver' | 'gold';
    artistId: string;
    artistName: string;
    tokenId?: string;
    txHash?: string;
    earnedAt: Date;
}

// Badge thresholds
export const BADGE_THRESHOLDS = {
    bronze: { correctAnswers: 10, accuracy: 0 },
    silver: { correctAnswers: 50, accuracy: 80 },
    gold: { correctAnswers: 100, accuracy: 90 }
} as const;
