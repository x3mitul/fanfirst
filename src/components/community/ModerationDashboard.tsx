'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ModerationItem {
    id: string;
    contentType: 'post' | 'comment';
    content: string;
    author: string;
    authorAvatar: string;
    flaggedCategories: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    status: 'pending' | 'approved' | 'removed';
}

// Mock data for demonstration
const MOCK_MODERATION_ITEMS: ModerationItem[] = [
    {
        id: '1',
        contentType: 'post',
        content: 'This post contains flagged content for demonstration purposes...',
        author: 'User123',
        authorAvatar: '/avatars/default.png',
        flaggedCategories: ['spam'],
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'pending',
    },
];

export function ModerationDashboard() {
    const [items, setItems] = useState<ModerationItem[]>(MOCK_MODERATION_ITEMS);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'removed'>('pending');
    const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

    const filteredItems = items.filter(item => {
        if (filter !== 'all' && item.status !== filter) return false;
        if (selectedSeverity && item.severity !== selectedSeverity) return false;
        return true;
    });

    const handleApprove = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, status: 'approved' as const } : item
        ));
    };

    const handleRemove = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, status: 'removed' as const } : item
        ));
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/20 border-red-500';
            case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500';
            case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500';
            default: return 'text-zinc-500 bg-zinc-500/20 border-zinc-500';
        }
    };

    const stats = {
        total: items.length,
        pending: items.filter(i => i.status === 'pending').length,
        approved: items.filter(i => i.status === 'approved').length,
        removed: items.filter(i => i.status === 'removed').length,
    };

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-8 h-8 text-[#ccff00]" />
                        <h1 className="text-4xl font-black text-white uppercase">
                            Moderation Dashboard
                        </h1>
                    </div>
                    <p className="text-zinc-400">
                        AI-powered content moderation system
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900 border-4 border-white p-6">
                        <div className="text-3xl font-black text-white mb-2">
                            {stats.total}
                        </div>
                        <div className="text-sm text-zinc-400 uppercase">Total Flagged</div>
                    </div>
                    <div className="bg-zinc-900 border-4 border-yellow-500 p-6">
                        <div className="text-3xl font-black text-yellow-500 mb-2">
                            {stats.pending}
                        </div>
                        <div className="text-sm text-zinc-400 uppercase">Pending Review</div>
                    </div>
                    <div className="bg-zinc-900 border-4 border-green-500 p-6">
                        <div className="text-3xl font-black text-green-500 mb-2">
                            {stats.approved}
                        </div>
                        <div className="text-sm text-zinc-400 uppercase">Approved</div>
                    </div>
                    <div className="bg-zinc-900 border-4 border-red-500 p-6">
                        <div className="text-3xl font-black text-red-500 mb-2">
                            {stats.removed}
                        </div>
                        <div className="text-sm text-zinc-400 uppercase">Removed</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-zinc-900 border-4 border-white p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="w-5 h-5 text-[#ccff00]" />
                        <h2 className="text-xl font-bold text-white uppercase">Filters</h2>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex gap-2">
                            <span className="text-sm text-zinc-400 self-center">Status:</span>
                            {['all', 'pending', 'approved', 'removed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status as any)}
                                    className={`px-4 py-2 text-sm font-bold uppercase transition ${filter === status
                                            ? 'bg-[#ccff00] text-black'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <span className="text-sm text-zinc-400 self-center">Severity:</span>
                            {['low', 'medium', 'high', 'critical'].map(severity => (
                                <button
                                    key={severity}
                                    onClick={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
                                    className={`px-4 py-2 text-sm font-bold uppercase transition ${selectedSeverity === severity
                                            ? getSeverityColor(severity)
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {severity}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Moderation Queue */}
                <div className="space-y-4">
                    {filteredItems.length === 0 ? (
                        <div className="bg-zinc-900 border-4 border-white p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">All Clear!</h3>
                            <p className="text-zinc-400">No items match your current filters.</p>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                className={`bg-zinc-900 border-4 ${item.status === 'pending'
                                        ? 'border-yellow-500'
                                        : item.status === 'approved'
                                            ? 'border-green-500'
                                            : 'border-red-500'
                                    } p-6`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={item.authorAvatar}
                                            alt={item.author}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white">{item.author}</span>
                                                <span className="text-xs text-zinc-500">•</span>
                                                <span className="text-xs text-zinc-500">
                                                    {item.timestamp.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-zinc-500">•</span>
                                                <span className="text-xs text-zinc-400 uppercase">
                                                    {item.contentType}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className={`px-3 py-1 text-xs font-bold uppercase border-2 ${getSeverityColor(item.severity)}`}>
                                                    {item.severity}
                                                </span>
                                                {item.flaggedCategories.map(category => (
                                                    <span
                                                        key={category}
                                                        className="px-3 py-1 text-xs font-bold uppercase bg-red-500/20 border-2 border-red-500 text-red-400"
                                                    >
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {item.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleApprove(item.id)}
                                                className="bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleRemove(item.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    )}

                                    {item.status !== 'pending' && (
                                        <div className={`px-4 py-2 text-sm font-bold uppercase ${item.status === 'approved'
                                                ? 'text-green-500'
                                                : 'text-red-500'
                                            }`}>
                                            {item.status}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded">
                                    <p className="text-zinc-300">{item.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Empty State */}
                {items.length === 0 && (
                    <div className="bg-zinc-900 border-4 border-white p-16 text-center">
                        <Shield className="w-24 h-24 text-[#ccff00] mx-auto mb-6" />
                        <h2 className="text-3xl font-black text-white mb-4 uppercase">
                            AI Moderation Active
                        </h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            The AI is actively monitoring community content. Flagged items will appear here for review.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModerationDashboard;
