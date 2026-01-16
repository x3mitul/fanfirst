"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Ticket, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { useNFTTickets } from "@/hooks";
import { TicketCard } from "@/components/tickets";
import { mockEvents } from "@/lib/mock-data";
import { useAccount } from "wagmi";

export default function TicketsPage() {
  const { isConnected } = useAccount();
  const { tickets, isLoading, error, hasTickets } = useNFTTickets();

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted mb-6">
                Please connect your wallet to view your NFT tickets
              </p>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted">Your NFT tickets with dynamic QR codes</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-500">Error loading tickets</p>
              <p className="text-sm text-muted mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !hasTickets && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-10 h-10 text-muted" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Tickets Yet</h3>
              <p className="text-muted mb-6">
                You haven&apos;t purchased any tickets yet. Browse events to get started!
              </p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tickets Grid */}
        {!isLoading && !error && hasTickets && (
          <div className="grid lg:grid-cols-2 gap-8">
            {tickets.map((ticket) => {
              // Find matching event from mock data (in real app, fetch from contract metadata)
              const event = mockEvents.find(e => e.id === ticket.eventId) || mockEvents[0];
              const tier = event.ticketTiers[0]; // Would come from ticket metadata

              return (
                <TicketCard
                  key={`${ticket.contractAddress}-${ticket.tokenId}`}
                  ticket={ticket}
                  event={{
                    title: event.title,
                    date: new Date(event.date),
                    venue: event.venue,
                    location: event.location,
                    time: event.time,
                    image: event.image,
                    artistImage: event.artistImage,
                  }}
                  tier={tier}
                />
              );
            })}
          </div>
        )}

        {/* Info Banner */}
        {hasTickets && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl border border-border"
          >
            <h3 className="font-semibold mb-2">📱 How to Use Your Ticket</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Show the QR code at venue entry (refreshes every 30 seconds)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Screenshots won&apos;t work - QR codes are time-based for security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Download your QR code or copy your ticket ID for reference</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Your tickets are NFTs - you own them on the blockchain!</span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
