
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                author: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Convert flat comments to nested structure if needed, or return flat and let client handle it?
        // The client CommentThread expects a tree structure for replies?
        // Let's check CommentThread props. It takes Comment[].
        // SingleComment handles `comment.replies`.
        // So I need to structure it.

        // Helper to nest comments
        const nestComments = (comments: any[]) => {
            const commentMap: any = {};
            const rootComments: any[] = [];

            // Initialize map and depth
            comments.forEach(c => {
                commentMap[c.id] = { ...c, replies: [], depth: 0 };
            });

            // Build tree
            comments.forEach(c => {
                if (c.parentId && commentMap[c.parentId]) {
                    const parent = commentMap[c.parentId];
                    commentMap[c.id].depth = parent.depth + 1;
                    parent.replies.push(commentMap[c.id]);
                } else {
                    rootComments.push(commentMap[c.id]);
                }
            });

            return rootComments;
        };

        const nestedComments = nestComments(comments);

        return NextResponse.json(nestedComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}
