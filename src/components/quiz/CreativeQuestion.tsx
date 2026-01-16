'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Shuffle, GripVertical } from 'lucide-react';

interface CreativeQuestionProps {
    question: string;
    type: 'creative' | 'order';
    options: string[];
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}

export default function CreativeQuestion({
    question,
    type,
    options,
    onAnswer,
    disabled = false
}: CreativeQuestionProps) {
    const [orderedItems, setOrderedItems] = useState<string[]>([...options]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    if (type === 'order') {
        // Drag-and-drop ordering interface
        const handleDragStart = (index: number) => {
            if (disabled) return;
            setDraggedIndex(index);
        };

        const handleDragOver = (index: number) => {
            if (disabled || draggedIndex === null || draggedIndex === index) return;

            const newOrder = [...orderedItems];
            const [removed] = newOrder.splice(draggedIndex, 1);
            newOrder.splice(index, 0, removed);
            setOrderedItems(newOrder);
            setDraggedIndex(index);
        };

        const handleDragEnd = () => {
            setDraggedIndex(null);
        };

        const submitOrder = () => {
            onAnswer(orderedItems.join(','));
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-300 text-sm mb-4">
                    <Shuffle className="w-4 h-4" />
                    <span>Drag to arrange in the correct order</span>
                </div>

                <div className="space-y-2">
                    {orderedItems.map((item, index) => (
                        <motion.div
                            key={`${item}-${index}`}
                            layout
                            draggable={!disabled}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={() => handleDragOver(index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-4 rounded-xl cursor-grab active:cursor-grabbing ${draggedIndex === index
                                    ? 'bg-purple-500/30 border-2 border-purple-500'
                                    : 'bg-white/5 border border-white/10'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <GripVertical className="w-5 h-5 text-gray-500" />
                            <span className="flex-1 text-white font-medium">{item}</span>
                            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm text-gray-400">
                                {index + 1}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <button
                    onClick={submitOrder}
                    disabled={disabled}
                    className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirm Order
                </button>
            </div>
        );
    }

    // Creative question - subjective choice
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 mb-4">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">
                    Human Verification: Choose what feels right to you
                </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">{question}</h3>

            <div className="grid gap-3">
                {options.map((option, i) => (
                    <motion.button
                        key={i}
                        onClick={() => onAnswer(option)}
                        disabled={disabled}
                        whileHover={!disabled ? { scale: 1.02 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                        className={`w-full p-4 rounded-xl text-left transition-all ${disabled
                                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-white hover:border-purple-500/50 hover:from-purple-500/20 hover:to-pink-500/20'
                            }`}
                    >
                        <span className="block text-sm text-purple-400 mb-1">Option {String.fromCharCode(65 + i)}</span>
                        <span className="block font-medium">{option}</span>
                    </motion.button>
                ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
                There&apos;s no wrong answer—this helps verify you&apos;re human!
            </p>
        </div>
    );
}
