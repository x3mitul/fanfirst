"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Ticket,
  Settings,
  Eye,
  Edit,
  MoreVertical,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";

// Mock organizer data
const organizerStats = {
  totalRevenue: 127450,
  ticketsSold: 892,
  activeEvents: 3,
  avgFandomScore: 72,
};

const organizerEvents = [
  {
    id: "org-evt-1",
    title: "Summer Music Festival 2026",
    date: new Date("2026-07-15"),
    venue: "Central Park",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop",
    status: "on-sale",
    ticketsSold: 3240,
    totalTickets: 5000,
    revenue: 89500,
    resaleVolume: 12300,
  },
  {
    id: "org-evt-2",
    title: "Indie Showcase Night",
    date: new Date("2026-02-20"),
    venue: "The Bowery Ballroom",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop",
    status: "on-sale",
    ticketsSold: 180,
    totalTickets: 300,
    revenue: 12600,
    resaleVolume: 850,
  },
  {
    id: "org-evt-3",
    title: "Electronic Dreams After Party",
    date: new Date("2026-04-21"),
    venue: "Warehouse 42",
    location: "Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=200&fit=crop",
    status: "draft",
    ticketsSold: 0,
    totalTickets: 800,
    revenue: 0,
    resaleVolume: 0,
  },
];

const recentActivity = [
  { type: "sale", message: "15 tickets sold for Summer Music Festival", time: "2 min ago", amount: 1125 },
  { type: "resale", message: "Resale transaction completed", time: "15 min ago", amount: 89 },
  { type: "sale", message: "VIP package purchased", time: "1 hour ago", amount: 299 },
  { type: "royalty", message: "Resale royalty earned", time: "2 hours ago", amount: 12 },
  { type: "sale", message: "8 tickets sold for Indie Showcase", time: "3 hours ago", amount: 560 },
];

export default function OrganizerDashboard() {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
            <p className="text-muted">Manage your events and track performance</p>
          </div>
          <Link href="/organizer/create">
            <Button icon={<Plus className="w-5 h-5" />}>
              Create Event
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <span className="flex items-center gap-1 text-sm text-accent">
                <ArrowUpRight className="w-4 h-4" />
                +12.5%
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{formatPrice(organizerStats.totalRevenue)}</p>
            <p className="text-sm text-muted">Total Revenue</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <span className="flex items-center gap-1 text-sm text-accent">
                <ArrowUpRight className="w-4 h-4" />
                +8.3%
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{organizerStats.ticketsSold.toLocaleString()}</p>
            <p className="text-sm text-muted">Tickets Sold</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{organizerStats.activeEvents}</p>
            <p className="text-sm text-muted">Active Events</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <span className="flex items-center gap-1 text-sm text-accent">
                <ArrowUpRight className="w-4 h-4" />
                +5
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{organizerStats.avgFandomScore}</p>
            <p className="text-sm text-muted">Avg. Buyer Score</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Events List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Your Events</h2>
              </div>
              
              <div className="divide-y divide-border">
                {organizerEvents.map((event) => {
                  const progress = (event.ticketsSold / event.totalTickets) * 100;
                  
                  return (
                    <div key={event.id} className="p-6 hover:bg-background/50 transition-colors">
                      <div className="flex gap-4">
                        <Image
                          src={event.image}
                          alt={event.title}
                          width={96}
                          height={64}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold truncate">{event.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(event.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                event.status === "on-sale" 
                                  ? "bg-accent/10 text-accent"
                                  : event.status === "draft"
                                  ? "bg-muted/20 text-muted"
                                  : "bg-secondary/10 text-secondary"
                              }`}>
                                {event.status === "on-sale" ? "On Sale" : "Draft"}
                              </span>
                              <button className="p-2 hover:bg-background rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted mb-1">Tickets Sold</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                              </div>
                              <p className="text-xs text-muted mt-1">
                                {event.ticketsSold.toLocaleString()} / {event.totalTickets.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted mb-1">Revenue</p>
                              <p className="font-semibold">{formatPrice(event.revenue)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted mb-1">Resale Royalties</p>
                              <p className="font-semibold text-secondary">{formatPrice(event.resaleVolume * 0.1)}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Link href={`/organizer/events/${event.id}`}>
                              <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />}>
                                View
                              </Button>
                            </Link>
                            <Link href={`/organizer/events/${event.id}/edit`}>
                              <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/organizer/events/${event.id}/analytics`}>
                              <Button variant="ghost" size="sm" icon={<BarChart3 className="w-4 h-4" />}>
                                Analytics
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Recent Activity */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold">Recent Activity</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === "sale" 
                          ? "bg-accent/10" 
                          : activity.type === "resale"
                          ? "bg-secondary/10"
                          : "bg-primary/10"
                      }`}>
                        {activity.type === "sale" ? (
                          <Ticket className="w-4 h-4 text-accent" />
                        ) : activity.type === "resale" ? (
                          <TrendingUp className="w-4 h-4 text-secondary" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted">{activity.time}</span>
                          <span className="text-sm font-medium text-accent">+{formatPrice(activity.amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/organizer/create" className="block">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Create Event</p>
                      <p className="text-xs text-muted">Set up a new event</p>
                    </div>
                  </button>
                </Link>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Resale Rules</p>
                    <p className="text-xs text-muted">Configure price caps</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">View Reports</p>
                    <p className="text-xs text-muted">Download analytics</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Royalties Info */}
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl border border-secondary/20 p-6">
              <h3 className="font-semibold mb-2">Resale Royalties</h3>
              <p className="text-sm text-muted mb-4">
                You earn 10% on every resale transaction. Fair for artists, fair for fans.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">This month</span>
                <span className="text-xl font-bold text-secondary">
                  {formatPrice(1315)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
