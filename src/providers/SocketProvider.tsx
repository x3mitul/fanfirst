"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useStore } from '@/lib/store';
import type { CommunityPost, Comment } from '@/lib/types';
import { mockUsers } from '@/lib/community-mock-data';

interface SocketUser {
    id: string;
    name: string;
    avatar: string;
    fandomScore: number;
}

// Socket event payload types
interface VoteUpdatePayload {
    postId: string;
    upvotes: number;
    downvotes: number;
}

interface CommentVoteUpdatePayload {
    commentId: string;
    upvotes: number;
    downvotes: number;
}

interface CommentCountPayload {
    postId: string;
    count: number;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    currentUser: SocketUser | null;
    setCurrentUser: (user: SocketUser) => void;

    // Community
    joinCommunity: (communityId: string) => void;
    leaveCommunity: () => void;
    onlineCount: number;

    // Posts
    createPost: (post: Partial<CommunityPost>) => void;
    deletePost: (postId: string, authorId: string) => void;
    votePost: (postId: string, direction: 'up' | 'down' | null) => void;
    onNewPost: (callback: (post: CommunityPost) => void) => void;
    onPostDeleted: (callback: (data: { postId: string }) => void) => void;
    onPostVoteUpdate: (callback: (data: VoteUpdatePayload) => void) => void;
    onPostCommentCount: (callback: (data: CommentCountPayload) => void) => void;

    // Comments
    joinPost: (postId: string) => void;
    leavePost: (postId: string) => void;
    createComment: (postId: string, content: string, parentId?: string) => void;
    voteComment: (commentId: string, postId: string, direction: 'up' | 'down' | null) => void;
    onNewComment: (callback: (comment: Comment) => void) => void;
    onCommentVoteUpdate: (callback: (data: CommentVoteUpdatePayload) => void) => void;

    // Typing
    startTyping: (postId: string) => void;
    stopTyping: (postId: string) => void;
    typingUsers: string[];
}

const SocketContext = createContext<SocketContextType | null>(null);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<SocketUser | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    const { user: auth0User, isLoading: isAuthLoading } = useUser();
    const { user: storeUser } = useStore();

    // Sync Auth0 user with socket's currentUser
    useEffect(() => {
        if (auth0User) {
            setCurrentUser({
                id: auth0User.sub || 'anonymous',
                name: auth0User.name || 'Fan',
                avatar: auth0User.picture || '',
                fandomScore: storeUser?.fandomScore || 0,
            });
        } else if (!isAuthLoading) {
            // User is logged out - clear currentUser
            setCurrentUser(null);
        }
    }, [auth0User, isAuthLoading, storeUser]);

    // Initialize socket connection
    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected to server');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('[Socket] Disconnected from server');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.log('[Socket] Connection error:', error.message);
        });

        // Online count updates
        socketInstance.on('online:count', (data: { communityId: string; count: number }) => {
            setOnlineCount(data.count);
        });

        // Typing updates
        socketInstance.on('typing:update', (data: { postId: string; users: string[] }) => {
            setTypingUsers(data.users);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Authenticate when user is set
    useEffect(() => {
        if (socket && currentUser) {
            socket.emit('auth', currentUser);
        }
    }, [socket, currentUser]);

    // Community actions
    const joinCommunity = useCallback((communityId: string) => {
        socket?.emit('join:community', communityId);
    }, [socket]);

    const leaveCommunity = useCallback(() => {
        // Handled automatically on join:community
    }, []);

    // Post actions
    const createPost = useCallback((post: Partial<CommunityPost>) => {
        socket?.emit('post:create', post);
    }, [socket]);

    const deletePost = useCallback((postId: string, authorId: string) => {
        socket?.emit('post:delete', { postId, authorId });
    }, [socket]);

    const votePost = useCallback((postId: string, direction: 'up' | 'down' | null) => {
        socket?.emit('post:vote', { postId, direction });
    }, [socket]);

    const onNewPost = useCallback((callback: (post: CommunityPost) => void) => {
        socket?.on('post:new', callback);
        return () => { socket?.off('post:new', callback); };
    }, [socket]);

    const onPostDeleted = useCallback((callback: (data: { postId: string }) => void) => {
        socket?.on('post:deleted', callback);
        return () => { socket?.off('post:deleted', callback); };
    }, [socket]);

    const onPostVoteUpdate = useCallback((callback: (data: VoteUpdatePayload) => void) => {
        socket?.on('post:vote:update', callback);
        return () => { socket?.off('post:vote:update', callback); };
    }, [socket]);

    const onPostCommentCount = useCallback((callback: (data: CommentCountPayload) => void) => {
        socket?.on('post:comment:count', callback);
        return () => { socket?.off('post:comment:count', callback); };
    }, [socket]);

    // Comment actions
    const joinPost = useCallback((postId: string) => {
        socket?.emit('join:post', postId);
    }, [socket]);

    const leavePost = useCallback((postId: string) => {
        socket?.emit('leave:post', postId);
    }, [socket]);

    const createComment = useCallback((postId: string, content: string, parentId?: string) => {
        socket?.emit('comment:create', { postId, content, parentId });
    }, [socket]);

    const voteComment = useCallback((commentId: string, postId: string, direction: 'up' | 'down' | null) => {
        socket?.emit('comment:vote', { commentId, postId, direction });
    }, [socket]);

    const onNewComment = useCallback((callback: (comment: Comment) => void) => {
        socket?.on('comment:new', callback);
        return () => { socket?.off('comment:new', callback); };
    }, [socket]);

    const onCommentVoteUpdate = useCallback((callback: (data: CommentVoteUpdatePayload) => void) => {
        socket?.on('comment:vote:update', callback);
        return () => { socket?.off('comment:vote:update', callback); };
    }, [socket]);

    // Typing actions
    const startTyping = useCallback((postId: string) => {
        socket?.emit('typing:start', postId);
    }, [socket]);

    const stopTyping = useCallback((postId: string) => {
        socket?.emit('typing:stop', postId);
    }, [socket]);

    const value: SocketContextType = {
        socket,
        isConnected,
        currentUser,
        setCurrentUser,
        joinCommunity,
        leaveCommunity,
        onlineCount,
        createPost,
        deletePost,
        votePost,
        onNewPost,
        onPostDeleted,
        onPostVoteUpdate,
        onPostCommentCount,
        joinPost,
        leavePost,
        createComment,
        voteComment,
        onNewComment,
        onCommentVoteUpdate,
        startTyping,
        stopTyping,
        typingUsers,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export default SocketProvider;
