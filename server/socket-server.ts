// WebSocket server for real-time community features with Prisma persistence
// Run with: npx ts-node --project tsconfig.server.json server/socket-server.ts

import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env explicitly
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

console.log('[Socket] Loaded env from:', envPath);
console.log('[Socket] DATABASE_URL exists:', !!process.env.DATABASE_URL);

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.SOCKET_PORT || 3001;

// Initialize Prisma with pg adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('[Socket] ERROR: DATABASE_URL is not set!');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Lightweight in-memory stores (for real-time state only, not persistence)
const typingUsers: Map<string, Set<string>> = new Map(); // postId -> Set of userIds
const onlineUsers: Map<string, Set<string>> = new Map(); // communityId -> Set of userIds
const quizParticipants: Map<string, Set<string>> = new Map(); // quizId -> Set of userIds

io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    let currentUser: { id: string; name: string; avatar: string; fandomScore: number } | null = null;
    let currentCommunity: string | null = null;

    // User authentication
    socket.on('auth', (userData: { id: string; name: string; avatar: string; fandomScore: number }) => {
        currentUser = userData;
        socket.data.user = userData;
        console.log(`[Socket] User authenticated: ${userData.name}`);
    });

    // Join a community room
    socket.on('join:community', async (communityId: string) => {
        if (currentCommunity) {
            socket.leave(`community:${currentCommunity}`);
            onlineUsers.get(currentCommunity)?.delete(socket.id); // Use socket.id for accurate count
        }

        currentCommunity = communityId;
        socket.join(`community:${communityId}`);

        if (!onlineUsers.has(communityId)) {
            onlineUsers.set(communityId, new Set());
        }
        onlineUsers.get(communityId)!.add(socket.id);

        io.to(`community:${communityId}`).emit('online:count', {
            communityId,
            count: onlineUsers.get(communityId)?.size || 0,
        });

        console.log(`[Socket] ${currentUser?.name || socket.id} joined community: ${communityId} (Count: ${onlineUsers.get(communityId)?.size})`);
    });

    // Join a post room (for comments)
    socket.on('join:post', (postId: string) => {
        socket.join(`post:${postId}`);
        console.log(`[Socket] ${currentUser?.name || socket.id} joined post: ${postId}`);
    });

    socket.on('leave:post', (postId: string) => {
        socket.leave(`post:${postId}`);
        typingUsers.get(postId)?.delete(currentUser?.id || '');
    });

    // Create a new post - PERSISTED TO DATABASE
    socket.on('post:create', async (postData: {
        communityId: string;
        authorId: string; // This is the Auth0 ID
        title: string;
        content: string;
        type: string;
        images?: string[];
    }) => {
        try {
            // Find the user by Auth0 ID first
            let user = await prisma.user.findUnique({
                where: { auth0Id: postData.authorId },
            });

            // If no user found by Auth0 ID, try to find by regular ID
            if (!user) {
                user = await prisma.user.findUnique({
                    where: { id: postData.authorId },
                });
            }

            // If still no user, create a guest user
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        auth0Id: postData.authorId,
                        email: `${postData.authorId.replace(/[|]/g, '-')}@guest.local`,
                        name: 'Anonymous User',
                    },
                });
            }

            const post = await prisma.communityPost.create({
                data: {
                    communityId: postData.communityId,
                    authorId: user.id, // Use the actual user ID
                    title: postData.title,
                    content: postData.content,
                    type: postData.type,
                    images: postData.images || [],
                    upvotes: 1,
                    downvotes: 0,
                    commentCount: 0,
                },
                include: {
                    author: true,
                },
            });

            // Broadcast to community
            io.to(`community:${postData.communityId}`).emit('post:new', post);
            console.log(`[Socket] New post created: ${post.title}`);
        } catch (error) {
            console.error('[Socket] Error creating post:', error);
            socket.emit('error', { message: 'Failed to create post' });
        }
    });

    // Vote on a post - PERSISTED TO DATABASE
    socket.on('post:vote', async ({ postId, direction }: { postId: string; direction: 'up' | 'down' | null }) => {
        if (!currentUser) return;

        try {
            const post = await prisma.communityPost.findUnique({ where: { id: postId } });
            if (!post) return;

            // Get user's current vote
            const existingVote = await prisma.postVote.findUnique({
                where: { postId_userId: { postId, userId: currentUser.id } },
            });

            let upvotesDelta = 0;
            let downvotesDelta = 0;

            // Remove previous vote effect
            if (existingVote) {
                if (existingVote.type === 'up') upvotesDelta--;
                if (existingVote.type === 'down') downvotesDelta--;
                await prisma.postVote.delete({
                    where: { postId_userId: { postId, userId: currentUser.id } },
                });
            }

            // Apply new vote
            if (direction) {
                await prisma.postVote.create({
                    data: { postId, userId: currentUser.id, type: direction },
                });
                if (direction === 'up') upvotesDelta++;
                if (direction === 'down') downvotesDelta++;
            }

            // Update post vote counts
            const updatedPost = await prisma.communityPost.update({
                where: { id: postId },
                data: {
                    upvotes: { increment: upvotesDelta },
                    downvotes: { increment: downvotesDelta },
                },
            });

            // Broadcast vote update
            io.to(`community:${post.communityId}`).emit('post:vote:update', {
                postId,
                upvotes: updatedPost.upvotes,
                downvotes: updatedPost.downvotes,
            });

            console.log(`[Socket] Vote on ${postId}: ${direction} by ${currentUser.name}`);
        } catch (error) {
            console.error('[Socket] Error voting:', error);
        }
    });

    // Delete a post - PERSISTED TO DATABASE
    socket.on('post:delete', async ({ postId, authorId }: { postId: string; authorId: string }) => {
        try {
            const post = await prisma.communityPost.findUnique({ where: { id: postId } });
            if (!post) {
                socket.emit('error', { message: 'Post not found' });
                return;
            }

            // Check if the user is the author (by Auth0 ID or user ID)
            const user = await prisma.user.findFirst({
                where: {
                    OR: [{ auth0Id: authorId }, { id: authorId }],
                },
            });

            if (!user || user.id !== post.authorId) {
                socket.emit('error', { message: 'Not authorized to delete this post' });
                return;
            }

            // Delete the post (cascade will delete votes)
            await prisma.communityPost.delete({ where: { id: postId } });

            // Broadcast deletion to community
            io.to(`community:${post.communityId}`).emit('post:deleted', { postId });
            console.log(`[Socket] Post deleted: ${postId}`);
        } catch (error) {
            console.error('[Socket] Error deleting post:', error);
            socket.emit('error', { message: 'Failed to delete post' });
        }
    });

    // ----------------------------------------------------------------------
    // COMMENT HANDLERS
    // ----------------------------------------------------------------------

    // Create a comment
    socket.on('comment:create', async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => {
        if (!currentUser) {
            socket.emit('error', { message: 'You must be logged in to comment' });
            return;
        }

        try {
            const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
            if (!user) {
                console.error('[Socket] User not found for comment creation');
                return;
            }

            const comment = await prisma.comment.create({
                data: {
                    content,
                    postId,
                    authorId: user.id,
                    parentId: parentId || null,
                    upvotes: 0,
                    downvotes: 0,
                },
                include: {
                    author: true,
                },
            });

            // Update comment count on post
            const updatedPost = await prisma.communityPost.update({
                where: { id: postId },
                data: { commentCount: { increment: 1 } },
                include: { author: true }
            });

            // Broadcast new comment to post room
            io.to(`post:${postId}`).emit('comment:new', comment);

            // Broadcast comment count update to community list
            io.to(`community:${updatedPost.communityId}`).emit('post:comment:count', {
                postId,
                count: updatedPost.commentCount
            });

            console.log(`[Socket] Comment created on ${postId} by ${currentUser.name}`);
        } catch (error) {
            console.error('[Socket] Error creating comment:', error);
            socket.emit('error', { message: 'Failed to create comment' });
        }
    });

    // Vote on a comment
    socket.on('comment:vote', async ({ commentId, postId, direction }: { commentId: string; postId: string; direction: 'up' | 'down' | null }) => {
        if (!currentUser) return;

        try {
            const existingVote = await prisma.commentVote.findUnique({
                where: { commentId_userId: { commentId, userId: currentUser.id } },
            });

            let upvotesDelta = 0;
            let downvotesDelta = 0;

            if (existingVote) {
                if (existingVote.type === 'up') upvotesDelta--;
                if (existingVote.type === 'down') downvotesDelta--;
                await prisma.commentVote.delete({
                    where: { commentId_userId: { commentId, userId: currentUser.id } },
                });
            }

            if (direction) {
                await prisma.commentVote.create({
                    data: { commentId, userId: currentUser.id, type: direction },
                });
                if (direction === 'up') upvotesDelta++;
                if (direction === 'down') downvotesDelta++;
            }

            const updatedComment = await prisma.comment.update({
                where: { id: commentId },
                data: {
                    upvotes: { increment: upvotesDelta },
                    downvotes: { increment: downvotesDelta },
                },
            });

            io.to(`post:${postId}`).emit('comment:vote:update', {
                commentId,
                upvotes: updatedComment.upvotes,
                downvotes: updatedComment.downvotes,
            });

        } catch (error) {
            console.error('[Socket] Error voting on comment:', error);
        }
    });

    // Typing indication
    socket.on('typing:start', (postId: string) => {
        if (!currentUser) return;
        if (!typingUsers.has(postId)) {
            typingUsers.set(postId, new Set());
        }
        typingUsers.get(postId)!.add(currentUser.id);

        io.to(`post:${postId}`).emit('typing:update', {
            postId,
            users: Array.from(typingUsers.get(postId) || []),
        });
    });

    socket.on('typing:stop', (postId: string) => {
        if (!currentUser) return;
        typingUsers.get(postId)?.delete(currentUser.id);

        io.to(`post:${postId}`).emit('typing:update', {
            postId,
            users: Array.from(typingUsers.get(postId) || []),
        });
    });

    // Get posts for a community
    socket.on('posts:get', async (communityId: string) => {
        try {
            const posts = await prisma.communityPost.findMany({
                where: { communityId },
                include: { author: true },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
            socket.emit('posts:list', posts);
        } catch (error) {
            console.error('[Socket] Error fetching posts:', error);
        }
    });

    // ============================================
    // FANIQ ARENA - Real-time Quiz Events
    // ============================================

    let currentQuiz: string | null = null;

    // Join a quiz room
    socket.on('quiz:join', async (quizId: string) => {
        if (currentQuiz) {
            socket.leave(`quiz:${currentQuiz}`);
            quizParticipants.get(currentQuiz)?.delete(currentUser?.id || '');
        }

        currentQuiz = quizId;
        socket.join(`quiz:${quizId}`);

        if (!quizParticipants.has(quizId)) {
            quizParticipants.set(quizId, new Set());
        }
        if (currentUser) {
            quizParticipants.get(quizId)!.add(currentUser.id);
        }

        // Broadcast participant count
        io.to(`quiz:${quizId}`).emit('quiz:participant:count',
            quizParticipants.get(quizId)?.size || 0
        );

        console.log(`[Socket] ${currentUser?.name || socket.id} joined quiz: ${quizId}`);
    });

    // Leave quiz
    socket.on('quiz:leave', (quizId: string) => {
        socket.leave(`quiz:${quizId}`);
        quizParticipants.get(quizId)?.delete(currentUser?.id || '');
        currentQuiz = null;

        io.to(`quiz:${quizId}`).emit('quiz:participant:count',
            quizParticipants.get(quizId)?.size || 0
        );
    });

    // Submit quiz answer
    socket.on('quiz:answer', async (data: {
        quizId: string;
        attemptId: string;
        questionId: string;
        answer: string;
        responseTime: number;
    }) => {
        if (!currentUser) return;

        try {
            // Get the question to check answer
            const question = await prisma.quizQuestion.findUnique({
                where: { id: data.questionId }
            });

            if (!question) return;

            const isCorrect = data.answer === question.correctAnswer;

            // Save response to database
            await prisma.quizResponse.create({
                data: {
                    attemptId: data.attemptId,
                    questionId: data.questionId,
                    answer: data.answer,
                    isCorrect,
                    responseTime: data.responseTime
                }
            });

            // Update attempt statistics
            const attempt = await prisma.quizAttempt.findUnique({
                where: { id: data.attemptId }
            });

            if (attempt) {
                const newStreak = isCorrect ? attempt.streak + 1 : 0;
                const newMaxStreak = Math.max(attempt.maxStreak, newStreak);
                const newCorrect = isCorrect ? attempt.correctAnswers + 1 : attempt.correctAnswers;

                await prisma.quizAttempt.update({
                    where: { id: data.attemptId },
                    data: {
                        correctAnswers: newCorrect,
                        streak: newStreak,
                        maxStreak: newMaxStreak
                    }
                });

                // Send result back to user
                socket.emit('quiz:answer:result', {
                    isCorrect,
                    streak: newStreak,
                    correctAnswers: newCorrect
                });
            }

            console.log(`[Socket] Quiz answer from ${currentUser.name}: ${isCorrect ? '✓' : '✗'}`);
        } catch (error) {
            console.error('[Socket] Error processing quiz answer:', error);
        }
    });

    // Request next question (for live quizzes)
    socket.on('quiz:next', async (data: { quizId: string; questionIndex: number }) => {
        try {
            const questions = await prisma.quizQuestion.findMany({
                where: { quizId: data.quizId },
                orderBy: { orderIndex: 'asc' }
            });

            const nextQuestion = questions[data.questionIndex];
            if (nextQuestion) {
                // Only send to the requesting socket for async quizzes
                // For live quizzes, the organizer would broadcast to all
                socket.emit('quiz:question', {
                    id: nextQuestion.id,
                    question: nextQuestion.question,
                    type: nextQuestion.type,
                    options: nextQuestion.options,
                    imageUrl: nextQuestion.imageUrl,
                    timeLimit: nextQuestion.timeLimit,
                    difficulty: nextQuestion.difficulty,
                    questionNumber: data.questionIndex + 1,
                    totalQuestions: questions.length
                    // Note: correctAnswer is NOT sent to client
                });
            }
        } catch (error) {
            console.error('[Socket] Error fetching next question:', error);
        }
    });

    // Complete quiz attempt
    socket.on('quiz:complete', async (data: { attemptId: string }) => {
        if (!currentUser) return;

        try {
            const attempt = await prisma.quizAttempt.findUnique({
                where: { id: data.attemptId },
                include: {
                    responses: true,
                    quiz: true
                }
            });

            if (!attempt || attempt.status === 'completed') return;

            // Calculate final scores
            const responseTimes = attempt.responses.map(r => r.responseTime);
            const avgResponseTime = responseTimes.length > 0
                ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                : 0;

            // Calculate standard deviation
            const mean = avgResponseTime;
            const squareDiffs = responseTimes.map(t => Math.pow(t - mean, 2));
            const avgSquareDiff = squareDiffs.length > 0
                ? squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
                : 0;
            const stdDev = Math.sqrt(avgSquareDiff);

            // Scoring formula
            const accuracyScore = (attempt.correctAnswers / attempt.totalQuestions) * 100;
            const clampedAvg = Math.max(avgResponseTime, 2000);
            const speedScore = Math.max(0, 100 - ((clampedAvg - 2000) / 50));
            const idealStdDev = 800;
            const stdDevDiff = Math.abs(stdDev - idealStdDev);
            const consistencyScore = Math.max(0, 100 - (stdDevDiff / 20));
            const finalScore = (accuracyScore * 0.5) + (speedScore * 0.3) + (consistencyScore * 0.2);

            // Calculate Fandom bonus
            const isPerfect = attempt.correctAnswers === attempt.totalQuestions;
            let fandomBonus = attempt.correctAnswers * 5 + (isPerfect ? 10 : 0);
            const streakMultiplier = Math.min(1 + (attempt.maxStreak * 0.1), 2);
            fandomBonus = Math.min(Math.round(fandomBonus * streakMultiplier), 50);

            // Update attempt
            const updatedAttempt = await prisma.quizAttempt.update({
                where: { id: data.attemptId },
                data: {
                    avgResponseTime,
                    responseTimeStdDev: stdDev,
                    finalScore,
                    speedScore,
                    accuracyScore,
                    consistencyScore,
                    status: 'completed',
                    completedAt: new Date()
                }
            });

            // Update user's fandom score
            if (fandomBonus > 0) {
                await prisma.user.update({
                    where: { id: attempt.userId },
                    data: { fandomScore: { increment: fandomBonus } }
                });
            }

            // Calculate rank
            const betterAttempts = await prisma.quizAttempt.count({
                where: {
                    quizId: attempt.quizId,
                    status: 'completed',
                    finalScore: { gt: finalScore }
                }
            });
            const rank = betterAttempts + 1;

            await prisma.quizAttempt.update({
                where: { id: data.attemptId },
                data: { rank }
            });

            // Send completion result
            socket.emit('quiz:complete:result', {
                attempt: { ...updatedAttempt, rank },
                finalScore: Math.round(finalScore * 100) / 100,
                accuracyScore: Math.round(accuracyScore * 100) / 100,
                speedScore: Math.round(speedScore * 100) / 100,
                consistencyScore: Math.round(consistencyScore * 100) / 100,
                fandomBonus,
                rank
            });

            // Broadcast updated leaderboard to quiz room
            const topAttempts = await prisma.quizAttempt.findMany({
                where: { quizId: attempt.quizId, status: 'completed' },
                include: { user: { select: { id: true, name: true, avatar: true } } },
                orderBy: { finalScore: 'desc' },
                take: 10
            });

            io.to(`quiz:${attempt.quizId}`).emit('quiz:leaderboard:update',
                topAttempts.map((a, i) => ({
                    rank: i + 1,
                    userId: a.userId,
                    userName: a.user.name,
                    userAvatar: a.user.avatar,
                    score: Math.round(a.finalScore * 100) / 100,
                    correctAnswers: a.correctAnswers,
                    maxStreak: a.maxStreak
                }))
            );

            console.log(`[Socket] Quiz completed by ${currentUser.name}: Score ${finalScore.toFixed(2)}, Rank #${rank}`);
        } catch (error) {
            console.error('[Socket] Error completing quiz:', error);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (currentCommunity) {
            onlineUsers.get(currentCommunity)?.delete(socket.id); // Remove by socket.id
            io.to(`community:${currentCommunity}`).emit('online:count', {
                communityId: currentCommunity,
                count: onlineUsers.get(currentCommunity)?.size || 0,
            });
        }
        if (currentQuiz && currentUser) {
            quizParticipants.get(currentQuiz)?.delete(currentUser.id);
            io.to(`quiz:${currentQuiz}`).emit('quiz:participant:count',
                quizParticipants.get(currentQuiz)?.size || 0
            );
        }
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`[Socket] Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
});
