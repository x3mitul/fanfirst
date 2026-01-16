"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    MapPin,
    ShieldCheck,
    Wallet,
    ExternalLink,
    Ticket as TicketIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { mockEvents } from "@/lib/mock-data";
import { format } from "date-fns";

// Parse the QR data from URL params
// QR format: { contract, token, owner, event, tier, ts }
interface TicketData {
    contract: string;
    token: string;
    owner: string;
    event?: string;
    tier?: string;
    ts: number;
}

export default function VerifyTicketPage() {
    const params = useParams();
    const ticketId = params.ticketId as string;

    // Try to parse ticket data from base64 encoded param or plain JSON
    let ticketData: TicketData | null = null;
    let isValid = false;

    try {
        // First try base64 decode
        const decoded = atob(ticketId);
        ticketData = JSON.parse(decoded);
        isValid = true;
    } catch {
        try {
            // Fall back to URL decoded JSON
            ticketData = JSON.parse(decodeURIComponent(ticketId));
            isValid = true;
        } catch {
            // Invalid data
            isValid = false;
        }
    }

    // Find matching event from mock data (in production, this would be fetched from blockchain)
    const event = ticketData?.event
        ? mockEvents.find(e => e.title.toLowerCase().includes(ticketData!.event!.toLowerCase()))
        : mockEvents[0];

    // Check if timestamp is recent (within last 30 seconds for demo)
    const currentTs = Math.floor(Date.now() / 30000);
    const isTimestampValid = ticketData ? Math.abs(currentTs - ticketData.ts) <= 1 : false;

    const truncateAddress = (address: string) => {
        if (!address || address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!isValid || !ticketData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#0a0a0a] p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invalid Ticket</h1>
                    <p className="text-white/60 mb-6">
                        This QR code does not contain valid ticket information.
                    </p>
                    <Link href="/">
                        <Button>Go to FanFirst</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0a0a] p-4 py-12">
            <div className="max-w-md mx-auto">
                {/* Verification Status */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-center gap-2 mb-6 py-3 px-4 rounded-full ${isTimestampValid
                            ? "bg-green-500/10 border border-green-500/30"
                            : "bg-yellow-500/10 border border-yellow-500/30"
                        }`}
                >
                    <ShieldCheck className={`w-5 h-5 ${isTimestampValid ? "text-green-500" : "text-yellow-500"}`} />
                    <span className={`text-sm font-medium ${isTimestampValid ? "text-green-500" : "text-yellow-500"}`}>
                        {isTimestampValid ? "VERIFIED - Dynamic QR Valid" : "QR EXPIRED - Request fresh code"}
                    </span>
                </motion.div>

                {/* Mini Ticket Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header with event image */}
                    {event && (
                        <div
                            className="h-32 bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${event.image})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                            <div className="absolute top-4 left-4">
                                <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase bg-black/50 px-3 py-1 rounded-full">
                                    Official NFT Ticket
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Ticket Content */}
                    <div className="p-6">
                        {/* Event Title */}
                        <div className="flex items-center gap-4 mb-6">
                            {event && (
                                <img
                                    src={event.artistImage}
                                    alt={event.artist}
                                    className="w-14 h-14 rounded-xl border-2 border-primary object-cover"
                                />
                            )}
                            <div>
                                <h1 className="text-xl font-black text-white uppercase tracking-tight">
                                    {ticketData.event || event?.title || "NFT Ticket"}
                                </h1>
                                <p className="text-white/60 text-sm">{event?.artist}</p>
                            </div>
                        </div>

                        {/* Event Details */}
                        {event && (
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-white/70">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{format(new Date(event.date), "EEEE, MMMM do, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/70">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{event.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/70">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-sm text-white">{event.venue}</p>
                                        <p className="text-xs text-white/50">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Perforation Line */}
                        <div className="relative -mx-6 my-6">
                            <div className="border-t-2 border-dashed border-white/10" />
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0a0a0a]" />
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0a0a0a]" />
                        </div>

                        {/* Ticket Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Pass Type</p>
                                <p className="text-sm font-bold text-white uppercase">{ticketData.tier || "General"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Token ID</p>
                                <p className="text-sm font-mono text-primary font-bold">#{ticketData.token}</p>
                            </div>
                        </div>

                        {/* Wallet Address */}
                        <div className="bg-black/30 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Owner Wallet</p>
                                    <p className="text-sm font-mono text-white">{truncateAddress(ticketData.owner)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Blockchain Link */}
                        <div className="flex items-center justify-between">
                            <a
                                href={`https://polygonscan.com/token/${ticketData.contract}?a=${ticketData.token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] font-mono text-white/30 hover:text-primary transition-colors uppercase tracking-widest"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View on Polygonscan
                            </a>
                            <div className="flex items-center gap-1 text-[10px] text-white/30">
                                <TicketIcon className="w-3 h-3" />
                                <span>FanFirst Protocol</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <Link href="/">
                        <Button variant="outline" className="border-white/20">
                            Visit FanFirst
                        </Button>
                    </Link>
                    <p className="text-white/30 text-xs mt-4">
                        Powered by FanFirst • Blockchain-verified ticketing
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
