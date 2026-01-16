'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Edit3, Send } from 'lucide-react';
import { ModerationResult } from '@/lib/types/moderation';
import { Button } from '@/components/ui/Button';

interface ContentWarningProps {
    isOpen: boolean;
    onClose: () => void;
    result: ModerationResult;
    onEdit?: () => void;
    onAppeal?: () => void;
    contentType?: 'post' | 'comment';
}

export function ContentWarning({
    isOpen,
    onClose,
    result,
    onEdit,
    onAppeal,
    contentType = 'post',
}: ContentWarningProps) {
    const [showAppealForm, setShowAppealForm] = useState(false);
    const [appealReason, setAppealReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAppeal = async () => {
        if (!appealReason.trim()) return;

        setSubmitting(true);
        try {
            // TODO: Submit appeal to API
            await onAppeal?.();
            onClose();
        } catch (error) {
            console.error('Appeal submission failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getSeverityColor = () => {
        switch (result.severity) {
            case 'critical':
                return 'border-red-500 bg-red-500/10';
            case 'high':
                return 'border-orange-500 bg-orange-500/10';
            case 'medium':
                return 'border-yellow-500 bg-yellow-500/10';
            default:
                return 'border-zinc-500 bg-zinc-500/10';
        }
    };

    const getSeverityIcon = () => {
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4"
                    >
                        <div
                            className={`bg-zinc-900 border-4 ${getSeverityColor()} shadow-2xl`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between p-6 border-b border-zinc-800">
                                <div className="flex items-center gap-3">
                                    {getSeverityIcon()}
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase">
                                            Content Warning
                                        </h2>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            Your {contentType} was flagged by our moderation system
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Reason */}
                                <div>
                                    <h3 className="text-sm font-bold text-[#ccff00] uppercase mb-2">
                                        Why was this flagged?
                                    </h3>
                                    <p className="text-white">{result.reason}</p>
                                </div>

                                {/* Flagged Categories */}
                                {result.categories.filter(c => c.detected).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-[#ccff00] uppercase mb-2">
                                            Detected Issues
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.categories
                                                .filter(c => c.detected)
                                                .map(category => (
                                                    <span
                                                        key={category.name}
                                                        className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-300 text-sm font-medium rounded"
                                                    >
                                                        {category.name.toUpperCase()} (
                                                        {Math.round(category.score * 100)}%)
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {result.suggestedEdit && (
                                    <div>
                                        <h3 className="text-sm font-bold text-[#ccff00] uppercase mb-2">
                                            How to fix it
                                        </h3>
                                        <p className="text-zinc-300 text-sm">
                                            {result.suggestedEdit}
                                        </p>
                                    </div>
                                )}

                                {/* Appeal Form */}
                                {!showAppealForm ? (
                                    <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded">
                                        <p className="text-sm text-zinc-400">
                                            Think this is a mistake? You can appeal this decision or
                                            edit your {contentType} to address the issues.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded space-y-3">
                                        <h3 className="text-sm font-bold text-white uppercase">
                                            Appeal This Decision
                                        </h3>
                                        <textarea
                                            value={appealReason}
                                            onChange={e => setAppealReason(e.target.value)}
                                            placeholder="Explain why you believe this is a false positive..."
                                            className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-[#ccff00] min-h-[100px] resize-none"
                                            maxLength={500}
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500">
                                                {appealReason.length}/500
                                            </span>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={handleAppeal}
                                                disabled={!appealReason.trim() || submitting}
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                {submitting ? 'Submitting...' : 'Submit Appeal'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 p-6 border-t border-zinc-800 bg-zinc-950/30">
                                {!showAppealForm ? (
                                    <>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={onEdit}
                                            className="flex-1"
                                        >
                                            <Edit3 className="w-5 h-5 mr-2" />
                                            Edit {contentType}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={() => setShowAppealForm(true)}
                                            className="flex-1"
                                        >
                                            Appeal Decision
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => setShowAppealForm(false)}
                                        className="w-full"
                                    >
                                        Cancel Appeal
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
