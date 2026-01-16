'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowBigUp,
    ArrowBigDown,
    Share2,
    Bookmark,
    MoreHorizontal,
    MessageSquare,
    Pin,
    Loader2
} from 'lucide-react';
import { CommentThread } from '@/components/community';
import { FandomScoreBadge } from '@/components/ui/FandomScoreBadge';
import { mockPosts, mockComments } from '@/lib/community-mock-data';
import { mockCommunities } from '@/lib/mock-data';
import { CommunityPost } from '@/lib/types';
import { usePostSocket } from '@/hooks/useCommunitySocket';

interface PostDetailPageProps {
    params: Promise<{ artistId: string; postId: string }>;
}

function timeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString();
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
    const { artistId, postId } = use(params);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const [saved, setSaved] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [post, setPost] = useState<CommunityPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize socket for real-time comments - MOVED UP
    const {
        comments,
        setComments,
        createComment,
        voteComment
    } = usePostSocket({ postId });

    // Fetch post from database
    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true);
            try {
                // First try database
                const res = await fetch(`/api/posts/${postId}`);
                if (res.ok) {
                    const dbPost = await res.json();
                    setPost(dbPost);
                } else {
                    // Fallback to mock data
                    const mockPost = mockPosts.find(p => p.id === postId);
                    if (mockPost) {
                        setPost(mockPost);
                    }
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                // Fallback to mock data on error
                const mockPost = mockPosts.find(p => p.id === postId);
                if (mockPost) {
                    setPost(mockPost);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    // Fetch comments from API on mount - MOVED UP
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/posts/${postId}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        fetchComments();
    }, [postId, setComments]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ccff00]" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-zinc-400 text-lg">Post not found</p>
                    <Link href={`/community/${artistId}`} className="text-[#ccff00] hover:underline mt-2 inline-block">
                        Back to community
                    </Link>
                </div>
            </div>
        );
    }

    // Find community
    const community = mockCommunities.find(c => c.id === post.communityId) || mockCommunities[0];

    const netVotes = post.upvotes - post.downvotes + (userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0);

    const handleVote = (direction: 'up' | 'down') => {
        if (userVote === direction) {
            setUserVote(null);
        } else {
            setUserVote(direction);
        }
        // TODO: Connect post voting to socket/API if needed
    };

    const handleSubmitComment = () => {
        if (newComment.trim()) {
            createComment(newComment);
            setNewComment('');
        }
    };

    const handleReply = (parentId: string, content: string) => {
        createComment(content, parentId);
    };

    const handleCommentVote = (commentId: string, direction: 'up' | 'down') => {
        voteComment(commentId, direction);
    };

    // Handle author data from database (different structure)
    const author = post.author || { name: 'Unknown User', avatar: '', fandomScore: 0, eventsAttended: 0, vouchesReceived: 0 };

    return (
        <div className="min-h-screen bg-black pt-20">
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Back Link */}
                <Link
                    href={`/community/${artistId}`}
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {community.name}
                </Link>

                {/* Post */}
                <article className="bg-zinc-900 border border-zinc-800">
                    <div className="flex">
                        {/* Vote Column */}
                        <div className="flex flex-col items-center py-4 px-3 bg-zinc-950/50 gap-1">
                            <button
                                onClick={() => handleVote('up')}
                                className={`p-1 rounded hover:bg-zinc-800 transition-colors ${userVote === 'up' ? 'text-[#ccff00]' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <ArrowBigUp className="w-7 h-7" />
                            </button>
                            <span className={`font-bold text-lg ${netVotes > 0 ? 'text-[#ccff00]' : netVotes < 0 ? 'text-red-400' : 'text-zinc-400'
                                }`}>
                                {netVotes}
                            </span>
                            <button
                                onClick={() => handleVote('down')}
                                className={`p-1 rounded hover:bg-zinc-800 transition-colors ${userVote === 'down' ? 'text-red-500' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <ArrowBigDown className="w-7 h-7" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {post.isPinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded text-[#ccff00] bg-[#ccff00]/20">
                                        <Pin className="w-3 h-3" />
                                        Pinned
                                    </span>
                                )}

                                <div className="flex items-center gap-2">
                                    {author.avatar && (
                                        <img
                                            src={author.avatar}
                                            alt={author.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                    )}
                                    <span className="text-sm">
                                        <span className="text-white font-medium">{author.name}</span>
                                    </span>
                                    <FandomScoreBadge
                                        score={author.fandomScore || 0}
                                        size="md"
                                        breakdown={{
                                            spotify: Math.floor((author.fandomScore || 0) * 0.4),
                                            events: author.eventsAttended || 0,
                                            vouches: author.vouchesReceived || 0,
                                            community: 5,
                                        }}
                                    />
                                    <span className="text-zinc-500 text-sm">•</span>
                                    <span className="text-zinc-500 text-sm">{timeAgo(new Date(post.createdAt))}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-white mb-4">
                                {post.title}
                            </h1>

                            {/* Content */}
                            <div className="text-zinc-300 mb-4 whitespace-pre-wrap">
                                {post.content}
                            </div>

                            {/* Images */}
                            {post.images && post.images.length > 0 && (
                                <div className="mb-4 flex gap-3 flex-wrap">
                                    {post.images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt=""
                                            className="max-h-96 rounded-lg object-cover"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 text-zinc-500 text-sm border-t border-zinc-800 pt-4">
                                <span className="flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{post.commentCount} Comments</span>
                                </span>

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

                                <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Add Comment */}
                <div className="mt-6 bg-zinc-900 border border-zinc-800 p-4">
                    <h3 className="text-sm font-bold text-white mb-3">Add a comment</h3>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder:text-zinc-500 resize-none focus:border-[#ccff00] outline-none"
                        rows={4}
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-[#ccff00] text-black font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Comment
                        </button>
                    </div>
                </div>

                {/* Comments */}
                <div className="mt-6 bg-zinc-900 border border-zinc-800 p-4">
                    <h3 className="text-sm font-bold text-white mb-4">
                        {comments.length} Comments
                    </h3>
                    <CommentThread
                        comments={comments}
                        postId={postId}
                        onReply={handleReply}
                        onVote={handleCommentVote}
                    />
                </div>
            </div>
        </div>
    );
}
