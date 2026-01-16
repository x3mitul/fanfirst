'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    ArrowBigUp,
    ArrowBigDown,
    Share2,
    Bookmark,
    MoreHorizontal,
    Pin,
    Image as ImageIcon,
    HelpCircle,
    MessageCircle,
    Newspaper,
    Flag
} from 'lucide-react';
import { CommunityPost } from '@/lib/types';
import { FandomScoreBadge } from '@/components/ui/FandomScoreBadge';

interface PostCardProps {
    post: CommunityPost;
    communitySlug: string;
    onVote?: (postId: string, direction: 'up' | 'down') => void;
}

const typeIcons = {
    discussion: MessageCircle,
    question: HelpCircle,
    photo: ImageIcon,
    news: Newspaper,
};

const typeColors = {
    discussion: 'text-blue-400 bg-blue-500/20',
    question: 'text-green-400 bg-green-500/20',
    photo: 'text-purple-400 bg-purple-500/20',
    news: 'text-orange-400 bg-orange-500/20',
};

function timeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
}

export function PostCard({ post, communitySlug, onVote }: PostCardProps) {
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const [saved, setSaved] = useState(false);

    const TypeIcon = typeIcons[post.type];
    const netVotes = post.upvotes - post.downvotes + (userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0);

    const handleVote = (direction: 'up' | 'down') => {
        if (userVote === direction) {
            setUserVote(null);
        } else {
            setUserVote(direction);
        }
        onVote?.(post.id, direction);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
            <div className="flex">
                {/* Vote Column */}
                <div className="flex flex-col items-center py-3 px-2 bg-zinc-950/50 gap-1">
                    <button
                        onClick={() => handleVote('up')}
                        className={`p-1 rounded hover:bg-zinc-800 transition-colors ${userVote === 'up' ? 'text-[#ccff00]' : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        <ArrowBigUp className="w-6 h-6" />
                    </button>
                    <span className={`font-bold text-sm ${netVotes > 0 ? 'text-[#ccff00]' : netVotes < 0 ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                        {netVotes}
                    </span>
                    <button
                        onClick={() => handleVote('down')}
                        className={`p-1 rounded hover:bg-zinc-800 transition-colors ${userVote === 'down' ? 'text-red-500' : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        <ArrowBigDown className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* Post Type Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${typeColors[post.type]}`}>
                            <TypeIcon className="w-3 h-3" />
                            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </span>

                        {post.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded text-[#ccff00] bg-[#ccff00]/20">
                                <Pin className="w-3 h-3" />
                                Pinned
                            </span>
                        )}

                        {/* Author Info */}
                        <div className="flex items-center gap-2">
                            {post.author.avatar && (
                                <img
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    className="w-5 h-5 rounded-full"
                                />
                            )}
                            <span className="text-sm text-zinc-400">
                                <span className="text-white font-medium">{post.author.name}</span>
                            </span>
                            <FandomScoreBadge
                                score={post.author.fandomScore}
                                size="sm"
                                breakdown={{
                                    spotify: Math.floor(post.author.fandomScore * 0.4),
                                    events: post.author.eventsAttended,
                                    vouches: post.author.vouchesReceived,
                                    community: 5,
                                }}
                            />
                            <span className="text-zinc-500 text-xs">•</span>
                            <span className="text-zinc-500 text-xs">{timeAgo(post.createdAt)}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <Link href={`/community/${communitySlug}/post/${post.id}`}>
                        <h3 className="text-lg font-bold text-white hover:text-[#ccff00] transition-colors cursor-pointer mb-2">
                            {post.title}
                        </h3>
                    </Link>

                    {/* Content Preview */}
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-3">
                        {post.content}
                    </p>

                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                        <div className="mb-3 flex gap-2 overflow-x-auto">
                            {post.images.slice(0, 3).map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt=""
                                    className="h-32 w-auto rounded-lg object-cover"
                                />
                            ))}
                            {post.images.length > 3 && (
                                <div className="h-32 w-24 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm">
                                    +{post.images.length - 3} more
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-zinc-500 text-sm">
                        <Link
                            href={`/community/${communitySlug}/post/${post.id}`}
                            className="flex items-center gap-1.5 hover:text-white transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.commentCount} Comments</span>
                        </Link>

                        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>

                        <button
                            onClick={() => setSaved(!saved)}
                            className={`flex items-center gap-1.5 transition-colors ${saved ? 'text-[#ccff00]' : 'hover:text-white'}`}
                        >
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                            <span>{saved ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                            className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                            onClick={() => {
                                // TODO: Implement report functionality
                                alert('Report submitted! Our moderation team will review this post.');
                            }}
                        >
                            <Flag className="w-4 h-4" />
                            <span>Report</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

export default PostCard;
