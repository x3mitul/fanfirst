"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Download,
  Tag,
  ExternalLink,
  Shield,
  Sparkles,
  Gift,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, TicketQR } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/utils";

export default function TicketDetailPage() {
  const params = useParams();
  const { user, userTickets } = useStore();
  const [showResaleModal, setShowResaleModal] = useState(false);
  const [resalePrice, setResalePrice] = useState("");

  const ticket = userTickets.find((t) => t.id === params.id);

  if (!ticket || !user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ticket not found</h1>
          <Link href="/dashboard/tickets">
            <Button>View My Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const event = ticket.event;
  const maxResalePrice = event.resaleCap
    ? (ticket.originalPrice * event.resaleCap) / 100
    : ticket.originalPrice * 1.5;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Ticket Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Ticket Card */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Event Image Header */}
              <div className="relative h-40">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={event.artistImage}
                      alt={event.artist}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg border-2 border-white object-cover"
                    />
                    <div className="text-white">
                      <h2 className="font-bold drop-shadow-lg">{event.title}</h2>
                      <p className="text-sm opacity-90">{event.artist}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-6">
                {/* Perforation Effect */}
                <div className="relative -mx-6 mb-6">
                  <div className="border-t-2 border-dashed border-border" />
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Ticket Type</span>
                    <span className="font-semibold text-primary">{ticket.tierName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Date</span>
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Time</span>
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Venue</span>
                    <span className="font-medium">{event.venue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Location</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">NFT Verified</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Token ID</span>
                      <span className="font-mono text-xs">{ticket.tokenId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Transaction</span>
                      <a
                        href={`https://polygonscan.com/tx/${ticket.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {ticket.transactionHash?.slice(0, 10)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - QR & Actions */}
          <div className="space-y-6">
            {/* QR Code */}
            {ticket.status === "active" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <TicketQR
                  ticketId={ticket.id}
                  eventName={event.title}
                  tierName={ticket.tierName}
                  holderName={user.name}
                />
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" icon={<Share2 className="w-4 h-4" />}>
                  Share Ticket
                </Button>
                <Button variant="outline" className="w-full justify-start" icon={<Download className="w-4 h-4" />}>
                  Add to Wallet
                </Button>
                {event.resaleEnabled && ticket.status === "active" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Tag className="w-4 h-4" />}
                    onClick={() => setShowResaleModal(true)}
                  >
                    List for Resale
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Post-Event Collectible Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Post-Event Collectible</h3>
                  <p className="text-sm text-muted mb-3">
                    After the event, your ticket transforms into a digital collectible with exclusive content!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>Unlocks: photos, videos, merch discounts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Resale Modal */}
        {showResaleModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowResaleModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-2">List for Resale</h3>
              <p className="text-muted text-sm mb-6">
                Set your price within the allowed range. {event.artistRoyalty}% goes to the artist.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sale Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input
                    type="number"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    placeholder={ticket.originalPrice.toString()}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                  />
                </div>
                <p className="text-xs text-muted mt-2">
                  Original price: {formatPrice(ticket.originalPrice)} • Max allowed: {formatPrice(maxResalePrice)}
                </p>
              </div>

              <div className="bg-background rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Artist Royalty ({event.artistRoyalty}%)</span>
                  <span className="text-sm">
                    {formatPrice((parseFloat(resalePrice) || 0) * (event.artistRoyalty / 100))}
                  </span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span>You receive</span>
                  <span className="text-primary">
                    {formatPrice((parseFloat(resalePrice) || 0) * (1 - event.artistRoyalty / 100))}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowResaleModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={!resalePrice || parseFloat(resalePrice) > maxResalePrice}
                >
                  List Ticket
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
