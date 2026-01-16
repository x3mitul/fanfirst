'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { CommunityPost, Comment } from '@/lib/types';

interface UseCommunitySocketOptions {
    communityId: string;
    initialPosts?: CommunityPost[];
}

export function useCommunitySocket({ communityId, initialPosts = [] }: UseCommunitySocketOptions) {
    const {
        isConnected,
        joinCommunity,
        onlineCount,
        onNewPost,
        onPostDeleted,
        onPostVoteUpdate,
        onPostCommentCount,
        votePost: socketVotePost,
        createPost: socketCreatePost,
        deletePost: socketDeletePost,
    } = useSocket();

    const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
    const [postVotes, setPostVotes] = useState<Map<string, { upvotes: number; downvotes: number }>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    // Fetch posts from database on mount
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`/api/communities/${communityId}/posts`);
                if (res.ok) {
                    const dbPosts = await res.json();
                    if (dbPosts.length > 0) {
                        setPosts(dbPosts);
                    }
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [communityId]);

    // Join community room on mount
    useEffect(() => {
        if (isConnected && communityId) {
            joinCommunity(communityId);
        }
    }, [isConnected, communityId, joinCommunity]);

    // Listen for new posts
    useEffect(() => {
        const cleanup = onNewPost((newPost: CommunityPost) => {
            if (newPost.communityId === communityId) {
                setPosts(prev => [newPost, ...prev]);
            }
        });
        return cleanup;
    }, [onNewPost, communityId]);

    // Listen for vote updates
    useEffect(() => {
        const cleanup = onPostVoteUpdate((data) => {
            setPostVotes(prev => {
                const newMap = new Map(prev);
                newMap.set(data.postId, { upvotes: data.upvotes, downvotes: data.downvotes });
                return newMap;
            });
        });
        return cleanup;
    }, [onPostVoteUpdate]);

    // Listen for comment count updates
    useEffect(() => {
        const cleanup = onPostCommentCount((data) => {
            setPosts(prev => prev.map(post =>
                post.id === data.postId
                    ? { ...post, commentCount: data.count }
                    : post
            ));
        });
        return cleanup;
    }, [onPostCommentCount]);

    // Get post with real-time vote updates
    const getPostVotes = useCallback((postId: string, originalUpvotes: number, originalDownvotes: number) => {
        const updates = postVotes.get(postId);
        return updates || { upvotes: originalUpvotes, downvotes: originalDownvotes };
    }, [postVotes]);

    // Vote on a post
    const votePost = useCallback((postId: string, direction: 'up' | 'down' | null) => {
        socketVotePost(postId, direction);
    }, [socketVotePost]);

    // Create a post
    const createPost = useCallback((postData: Partial<CommunityPost>) => {
        socketCreatePost({
            ...postData,
            communityId,
        });
    }, [socketCreatePost, communityId]);

    // Delete a post
    const deletePost = useCallback((postId: string, authorId: string) => {
        socketDeletePost(postId, authorId);
    }, [socketDeletePost]);

    // Listen for post deletions
    useEffect(() => {
        const cleanup = onPostDeleted((data: { postId: string }) => {
            setPosts(prev => prev.filter(post => post.id !== data.postId));
        });
        return cleanup;
    }, [onPostDeleted]);

    return {
        isConnected,
        isLoading,
        onlineCount,
        posts,
        setPosts,
        getPostVotes,
        votePost,
        createPost,
        deletePost,
    };
}

interface UsePostSocketOptions {
    postId: string;
    initialComments?: Comment[];
}

export function usePostSocket({ postId, initialComments = [] }: UsePostSocketOptions) {
    const {
        isConnected,
        joinPost,
        leavePost,
        onNewComment,
        onCommentVoteUpdate,
        createComment: socketCreateComment,
        voteComment: socketVoteComment,
        startTyping,
        stopTyping,
        typingUsers,
    } = useSocket();

    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [commentVotes, setCommentVotes] = useState<Map<string, { upvotes: number; downvotes: number }>>(new Map());

    // Join post room on mount
    useEffect(() => {
        if (isConnected && postId) {
            joinPost(postId);
            return () => leavePost(postId);
        }
    }, [isConnected, postId, joinPost, leavePost]);

    // Recursive helper to add comment to tree
    const addCommentToTree = useCallback((comments: Comment[], newComment: Comment): Comment[] => {
        // If it's a root comment, add to top
        if (!newComment.parentId) {
            // Check if already exists to prevent dupes
            if (comments.some(c => c.id === newComment.id)) return comments;
            return [newComment, ...comments];
        }

        return comments.map(c => {
            if (c.id === newComment.parentId) {
                // Ensure replies array exists
                const replies = c.replies || [];
                // Check dupes
                if (replies.some(r => r.id === newComment.id)) return c;
                return { ...c, replies: [...replies, newComment] };
            } else if (c.replies && c.replies.length > 0) {
                return { ...c, replies: addCommentToTree(c.replies, newComment) };
            }
            return c;
        });
    }, []);

    // Listen for new comments
    useEffect(() => {
        const cleanup = onNewComment((newComment: Comment) => {
            if (newComment.postId === postId) {
                setComments(prev => addCommentToTree(prev, newComment));
            }
        });
        return cleanup;
    }, [onNewComment, postId, addCommentToTree]);

    // Listen for comment vote updates
    useEffect(() => {
        const cleanup = onCommentVoteUpdate((data) => {
            setCommentVotes(prev => {
                const newMap = new Map(prev);
                newMap.set(data.commentId, { upvotes: data.upvotes, downvotes: data.downvotes });
                return newMap;
            });
        });
        return cleanup;
    }, [onCommentVoteUpdate]);

    // Get comment votes
    const getCommentVotes = useCallback((commentId: string, originalUpvotes: number, originalDownvotes: number) => {
        const updates = commentVotes.get(commentId);
        return updates || { upvotes: originalUpvotes, downvotes: originalDownvotes };
    }, [commentVotes]);

    // Create comment
    const createComment = useCallback((content: string, parentId?: string) => {
        socketCreateComment(postId, content, parentId);
    }, [socketCreateComment, postId]);

    // Vote on comment
    const voteComment = useCallback((commentId: string, direction: 'up' | 'down' | null) => {
        socketVoteComment(commentId, postId, direction);
    }, [socketVoteComment, postId]);

    // Typing handlers
    const handleStartTyping = useCallback(() => {
        startTyping(postId);
    }, [startTyping, postId]);

    const handleStopTyping = useCallback(() => {
        stopTyping(postId);
    }, [stopTyping, postId]);

    return {
        isConnected,
        comments,
        setComments,
        getCommentVotes,
        createComment,
        voteComment,
        typingUsers,
        startTyping: handleStartTyping,
        stopTyping: handleStopTyping,
    };
}
