'use client';

import { useState, useMemo, use, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Users,
    TrendingUp,
    Calendar,
    Plus,
    ArrowLeft,
    Crown,
    Shield,
    Wifi,
    WifiOff
} from 'lucide-react';
import { PostCard, PostFilters, CreatePostModal } from '@/components/community';
import { FandomScoreBadge } from '@/components/ui/FandomScoreBadge';
import { Button } from '@/components/ui/Button';
import { mockPosts, mockUsers } from '@/lib/community-mock-data';
import { mockCommunities, mockEvents } from '@/lib/mock-data';
import { FilterType, TimeRange } from '@/components/community/PostFilters';
import { CommunityPost, Community } from '@/lib/types';
import { useCommunitySocket } from '@/hooks/useCommunitySocket';
import { useSocket } from '@/providers/SocketProvider';

interface CommunityFeedPageProps {
    params: Promise<{ artistId: string }>;
}

export default function CommunityFeedPage({ params }: CommunityFeedPageProps) {
    const { artistId } = use(params);
    const [filter, setFilter] = useState<FilterType>('hot');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    // State for stable timestamp used in hot sorting
    const [sortTimestamp, setSortTimestamp] = useState<number>(() => Date.now());

    // Find community by ID or slug
    const community = mockCommunities.find(
        c => c.id === artistId || c.artistId === artistId || c.name.toLowerCase().replace(/\s+/g, '-') === artistId
    ) || mockCommunities[0];

    // Use socket hook for real-time posts
    const { isConnected, createPost, posts: socketPosts, onlineCount } = useCommunitySocket({
        communityId: community.id,
        initialPosts: mockPosts.filter(p => p.communityId === community.id),
    });

    // Get current authenticated user from socket context
    const { currentUser } = useSocket();

    // Fetch real member count from database
    const [memberCount, setMemberCount] = useState<number>(community.memberCount || 0);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/communities/${community.id}/stats`);
                if (res.ok) {
                    const stats = await res.json();
                    setMemberCount(stats.memberCount || community.memberCount || 0);
                }
            } catch (error) {
                console.error('Error fetching community stats:', error);
            }
        };
        fetchStats();
    }, [community.id, community.memberCount]);

    // Get posts (socket or mock fallback)
    const communityPosts = socketPosts.length > 0 ? socketPosts : mockPosts.filter(p => p.communityId === community.id);
    const allPosts = communityPosts;

    // Update sort timestamp when filter or posts change
    useEffect(() => {
        setSortTimestamp(Date.now());
    }, [filter, allPosts]);

    // Sort posts based on filter
    const sortedPosts = useMemo(() => {
        const posts = [...allPosts];

        switch (filter) {
            case 'hot':
                return posts.sort((a, b) => {
                    const scoreA = (a.upvotes - a.downvotes) / Math.pow(sortTimestamp - new Date(a.createdAt).getTime(), 0.5);
                    const scoreB = (b.upvotes - b.downvotes) / Math.pow(sortTimestamp - new Date(b.createdAt).getTime(), 0.5);
                    return scoreB - scoreA;
                });
            case 'new':
                return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'top':
                return posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
            case 'topfans':
                // Sort by author's fandom score - THE UNIQUE FEATURE!
                return posts.sort((a, b) => b.author.fandomScore - a.author.fandomScore);
            default:
                return posts;
        }
    }, [allPosts, filter, sortTimestamp]);

    // Get top contributors (by fandom score)
    const topContributors = useMemo(() => {
        const authorMap = new Map<string, typeof mockUsers[0]>();
        allPosts.forEach(post => {
            if (!authorMap.has(post.authorId) || authorMap.get(post.authorId)!.fandomScore < post.author.fandomScore) {
                authorMap.set(post.authorId, post.author);
            }
        });
        return Array.from(authorMap.values())
            .sort((a, b) => b.fandomScore - a.fandomScore)
            .slice(0, 5);
    }, [allPosts]);

    // Get related events
    const relatedEvents = mockEvents.filter(e =>
        e.artist.toLowerCase().includes(community.artistName.toLowerCase().split(' ')[0]) ||
        community.artistName.toLowerCase().includes(e.artist.toLowerCase().split(' ')[0])
    ).slice(0, 3);

    return (
        <div className="min-h-screen bg-black pt-20">
            {/* Community Header */}
            <div className="relative h-48 md:h-64 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${community.artistImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="max-w-7xl mx-auto flex items-end gap-4">
                        <Link href="/community" className="text-zinc-400 hover:text-white mb-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <img
                            src={community.artistImage}
                            alt={community.artistName}
                            className="w-20 h-20 rounded-lg border-4 border-[#ccff00] object-cover"
                        />
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-black text-white uppercase">
                                {community.name}
                            </h1>
                            <p className="text-zinc-400 text-sm mt-1">
                                {(memberCount?.toLocaleString() || '0')} members
                            </p>
                        </div>
                        <Button variant="primary" onClick={() => setIsCreatePostOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Post
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Feed */}
                    <div className="lg:col-span-8">
                        <PostFilters
                            activeFilter={filter}
                            onFilterChange={setFilter}
                            timeRange={timeRange}
                            onTimeRangeChange={setTimeRange}
                        />

                        <div className="space-y-4">
                            {sortedPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    communitySlug={artistId}
                                />
                            ))}

                            {sortedPosts.length === 0 && (
                                <div className="text-center py-12 bg-zinc-900 border border-zinc-800">
                                    <p className="text-zinc-400">No posts yet. Be the first to share!</p>
                                    <Button variant="outline" className="mt-4" onClick={() => setIsCreatePostOpen(true)}>
                                        Create Post
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* About Community */}
                        <div className="bg-zinc-900 border border-zinc-800 p-4">
                            <h3 className="font-bold text-white mb-3 uppercase text-sm">About Community</h3>
                            <p className="text-zinc-400 text-sm mb-4">{community.description}</p>

                            <div className="grid grid-cols-2 gap-4 py-3 border-t border-zinc-800">
                                <div>
                                    <div className="text-xl font-bold text-white">{memberCount?.toLocaleString() || '0'}</div>
                                    <div className="text-xs text-zinc-500">Members</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-[#ccff00]">{onlineCount || 0}</div>
                                    <div className="text-xs text-zinc-500">Online</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Fans Leaderboard */}
                        <div className="bg-zinc-900 border border-zinc-800 p-4">
                            <h3 className="font-bold text-white mb-3 uppercase text-sm flex items-center gap-2">
                                <Crown className="w-4 h-4 text-[#ccff00]" />
                                Top Fans This Week
                            </h3>
                            <div className="space-y-3">
                                {topContributors.map((user, index) => (
                                    <div key={user.id} className="flex items-center gap-3">
                                        <span className={`w-5 text-center font-bold text-sm ${index === 0 ? 'text-[#ccff00]' :
                                            index === 1 ? 'text-zinc-300' :
                                                index === 2 ? 'text-orange-400' : 'text-zinc-500'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                        </div>
                                        <FandomScoreBadge score={user.fandomScore} size="sm" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        {relatedEvents.length > 0 && (
                            <div className="bg-zinc-900 border border-zinc-800 p-4">
                                <h3 className="font-bold text-white mb-3 uppercase text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#ccff00]" />
                                    Upcoming Events
                                </h3>
                                <div className="space-y-3">
                                    {relatedEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/events/${event.id}`}
                                            className="block p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            <p className="font-medium text-white text-sm">{event.title}</p>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {new Date(event.date).toLocaleDateString()} • {event.venue}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Community Rules */}
                        <div className="bg-zinc-900 border border-zinc-800 p-4">
                            <h3 className="font-bold text-white mb-3 uppercase text-sm flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#ccff00]" />
                                Community Rules
                            </h3>
                            <ol className="space-y-2 text-sm text-zinc-400 list-decimal list-inside">
                                <li>Be respectful to all community members</li>
                                <li>No scalping or resale promotions</li>
                                <li>Stay on topic - discuss the artist</li>
                                <li>No spam or self-promotion</li>
                                <li>Use appropriate flairs for posts</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                onSubmit={(post) => {
                    if (!currentUser) {
                        // This shouldn't happen as modal shows Login Required when user is null
                        return;
                    }
                    // Create post via socket -> persisted to database
                    createPost({
                        title: post.title,
                        content: post.content,
                        type: post.type as 'discussion' | 'question' | 'photo' | 'news',
                        authorId: currentUser.id,
                        author: {
                            id: currentUser.id,
                            email: `${currentUser.id}@fanfirst.com`,
                            name: currentUser.name,
                            fandomScore: currentUser.fandomScore,
                            spotifyConnected: false,
                            createdAt: new Date(),
                            eventsAttended: 0,
                            vouchesGiven: 0,
                            vouchesReceived: 0,
                        },
                    });
                    setIsCreatePostOpen(false);
                }}
                communityName={community.name}
                user={currentUser ? {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar || "",
                    fandomScore: currentUser.fandomScore
                } : null}
            />
        </div>
    );
}
