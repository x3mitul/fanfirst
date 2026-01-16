'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, MessageSquare, HelpCircle, Newspaper, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FandomScoreBadge } from '@/components/ui/FandomScoreBadge';
import { ModerationResult } from '@/lib/types/moderation';
import { ContentWarning } from './ContentWarning';

type PostType = 'discussion' | 'question' | 'photo' | 'news';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (post: {
        title: string;
        content: string;
        type: PostType;
    }) => void;
    communityName: string;
    user: {
        id: string;
        name: string;
        avatar: string;
        fandomScore: number;
    } | null;
}

const POST_TYPES: { type: PostType; label: string; icon: typeof MessageSquare; description: string }[] = [
    { type: 'discussion', label: 'Discussion', icon: MessageSquare, description: 'Start a conversation' },
    { type: 'question', label: 'Question', icon: HelpCircle, description: 'Ask the community' },
    { type: 'photo', label: 'Photo', icon: Image, description: 'Share images' },
    { type: 'news', label: 'News', icon: Newspaper, description: 'Share updates' },
];

export function CreatePostModal({ isOpen, onClose, onSubmit, communityName, user }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState<PostType>('discussion');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [checking, setChecking] = useState(false);

    const moderateBeforePost = async () => {
        setError(null);
        setChecking(true);

        try {
            const response = await fetch('/api/moderate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    title: title.trim(),
                    contentType: 'post',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Moderation check failed');
            }

            setModerationResult(data.result);

            if (!data.result.allowed) {
                setShowWarning(true);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Moderation error:', err);
            // Allow post if moderation fails (fail open)
            return true;
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError('You must be logged in to create a post');
            return;
        }

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (!content.trim()) {
            setError('Content is required');
            return;
        }

        // Check moderation before submitting
        const moderationPassed = await moderateBeforePost();
        if (!moderationPassed) {
            return;
        }

        setIsSubmitting(true);

        try {
            onSubmit({
                title: title.trim(),
                content: content.trim(),
                type: postType,
            });

            // Reset form
            setTitle('');
            setContent('');
            setPostType('discussion');
            setModerationResult(null);
            onClose();
        } catch (err) {
            setError('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!user) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={handleBackdropClick}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-900 border-4 border-white w-full max-w-md p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Login Required</h2>
                            <p className="text-zinc-400 mb-6">You need to be logged in to create posts.</p>
                            <Button variant="primary" onClick={onClose} className="w-full">
                                Got it
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-zinc-900 border-4 border-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                            <h2 className="text-xl font-bold text-white">Create Post in {communityName}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-800 rounded transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-white">{user.name}</p>
                                    <FandomScoreBadge score={user.fandomScore} size="sm" />
                                </div>
                            </div>

                            {/* Post Type Selection */}
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-2 block">Post Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {POST_TYPES.map(({ type, label, icon: Icon }) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setPostType(type)}
                                            className={`p-3 border-2 transition-all ${postType === type
                                                ? 'border-[#ccff00] bg-[#ccff00]/10'
                                                : 'border-zinc-700 hover:border-zinc-600'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 mx-auto mb-1 ${postType === type ? 'text-[#ccff00]' : 'text-zinc-400'
                                                }`} />
                                            <span className={`text-xs ${postType === type ? 'text-[#ccff00]' : 'text-zinc-400'
                                                }`}>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-2 block">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="An interesting title..."
                                    className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none transition-colors"
                                    maxLength={300}
                                />
                                <p className="text-xs text-zinc-500 mt-1">{title.length}/300</p>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-2 block">Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={6}
                                    className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none transition-colors resize-none"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Moderation Status */}
                            {moderationResult && moderationResult.flagged && moderationResult.allowed && (
                                <div className="p-3 bg-yellow-500/20 border border-yellow-500 text-yellow-400 text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Content may need review</p>
                                        <p className="text-xs mt-1">Some content was flagged but you can still post. Please ensure it follows community guidelines.</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                    disabled={isSubmitting || checking}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    disabled={isSubmitting || checking || !title.trim() || !content.trim()}
                                >
                                    {checking ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Checking...
                                        </>
                                    ) : isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        'Post'
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Moderation Warning Modal */}
                        {moderationResult && (
                            <ContentWarning
                                isOpen={showWarning}
                                onClose={() => setShowWarning(false)}
                                result={moderationResult}
                                onEdit={() => {
                                    setShowWarning(false);
                                    setModerationResult(null);
                                }}
                                contentType="post"
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
