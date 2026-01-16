'use client';

import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface QuizTimerProps {
    timeLeft: number;
    maxTime: number;
}

export default function QuizTimer({ timeLeft, maxTime }: QuizTimerProps) {
    const percentage = (timeLeft / maxTime) * 100;
    const isUrgent = timeLeft <= 3;
    const isWarning = timeLeft <= 5 && timeLeft > 3;

    return (
        <div className="relative">
            {/* Circular Timer */}
            <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-gray-700"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={226}
                        strokeDashoffset={226 - (226 * percentage) / 100}
                        className={`transition-colors ${isUrgent ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-purple-500'
                            }`}
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isUrgent ? (
                        <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                    ) : (
                        <Clock className={`w-5 h-5 ${isWarning ? 'text-yellow-500' : 'text-purple-400'}`} />
                    )}
                    <span className={`text-lg font-bold font-mono ${isUrgent ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-white'
                        }`}>
                        {timeLeft}
                    </span>
                </div>
            </div>

            {/* Pulse animation when urgent */}
            {isUrgent && (
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-500"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}
        </div>
    );
}
