"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Ticket,
    Calendar,
    TrendingUp,
    Users,
    Settings,
    Music,
    Award,
    ChevronRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { FandomScore, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Auth0User {
    name: string;
    email: string;
    picture: string | null;
}

interface DashboardClientProps {
    auth0User: Auth0User | null;
}

export default function DashboardClient({ auth0User }: DashboardClientProps) {
    const { user: storeUser, userTickets, spotifyConnected } = useStore();

    // Use Auth0 user if logged in via Auth0, otherwise fall back to store user
    const user = auth0User ? {
        name: auth0User.name,
        email: auth0User.email,
        avatar: auth0User.picture,
        fandomScore: storeUser?.fandomScore || 15,
        eventsAttended: storeUser?.eventsAttended || 0,
        vouchesReceived: storeUser?.vouchesReceived || 0,
    } : storeUser;

    if (!user) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
                    <Link href="/login">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const upcomingTickets = userTickets.filter((t) => t.status === "active");

    const quickStats = [
        { label: "Fandom Score", value: user.fandomScore || 0, icon: Award, color: "text-primary" },
        { label: "Events Attended", value: user.eventsAttended || 0, icon: Calendar, color: "text-accent" },
        { label: "Vouches Received", value: user.vouchesReceived || 0, icon: Users, color: "text-secondary" },
        { label: "Active Tickets", value: upcomingTickets.length, icon: Ticket, color: "text-purple-500" },
    ];

    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
                >
                    <div>
                        <div className="flex items-center gap-4">
                            {user.avatar && (
                                <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    width={64}
                                    height={64}
                                    className="rounded-full border-2 border-primary"
                                />
                            )}
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">
                                    Welcome back, {user.name?.split(" ")[0] || "Fan"}!
                                </h1>
                                <p className="text-muted">{user.email}</p>
                                {auth0User && (
                                    <p className="text-xs text-accent mt-1">✓ Auth0 Verified</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard/settings">
                        <Button variant="outline" icon={<Settings className="w-4 h-4" />}>
                            Settings
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {quickStats.map((stat, index) => (
                        <div key={index} className="bg-card rounded-xl p-6 border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Fandom Score */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl p-6 border border-border"
                    >
                        <h2 className="text-lg font-semibold mb-6">Your Fandom Score</h2>

                        <div className="flex justify-center mb-6">
                            <FandomScore score={user.fandomScore || 0} size="lg" showTier showBenefits />
                        </div>

                        {!spotifyConnected && (
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <div className="flex items-start gap-3">
                                    <Music className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-sm">Connect Spotify</p>
                                        <p className="text-xs text-muted">
                                            Boost your Fandom Score by connecting your streaming data
                                        </p>
                                        <Button size="sm" className="mt-3">
                                            Connect Spotify
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Upcoming Events */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 bg-card rounded-xl p-6 border border-border"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Upcoming Events</h2>
                            <Link
                                href="/events"
                                className="text-sm text-primary flex items-center gap-1 hover:underline"
                            >
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {upcomingTickets.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
                                    >
                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <Ticket className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{ticket.eventId}</h3>
                                            <p className="text-sm text-muted">
                                                {formatDate(ticket.purchaseDate)}
                                            </p>
                                        </div>
                                        <Link href={`/dashboard/tickets/${ticket.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Ticket
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Ticket className="w-12 h-12 text-muted mx-auto mb-4" />
                                <p className="text-muted mb-4">No upcoming events</p>
                                <Link href="/events">
                                    <Button>Browse Events</Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
