"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    ShieldCheck,
    ArrowLeft,
    Share2,
    Info,
    Brain
} from "lucide-react";
import { Button } from "@/components/ui";
import { mockEvents } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useTicketPurchase } from "@/hooks";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useStore } from "@/lib/store";
import dynamic from "next/dynamic";
import { AdaptivePurchaseButton } from "@/components/web3/AdaptivePurchaseButton";
import { toggleReminder } from "@/actions/events";
import type { Event } from "@/lib/types";

const QuizModal = dynamic(() => import("@/components/quiz/QuizModal"), {
    loading: () => null
});

const AIDecisionPanel = dynamic(() => import("@/components/web3/AIDecisionPanel").then(mod => mod.AIDecisionPanel), {
    ssr: false
});

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const { buyTicket, isPending, isSuccess, error, isConnected } = useTicketPurchase();
    const { user } = useUser();
    const { isAuthenticated } = useStore();
    const [isReminded, setIsReminded] = useState(false);
    const [isReminderPending, startTransition] = useTransition();
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showWalletPrompt, setShowWalletPrompt] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [hasSeenQuizPrompt, setHasSeenQuizPrompt] = useState(false);

    useEffect(() => {
        if (user && event) {
            // Initial check can still use fetch or be preloaded server-side
            // prioritizing keeping current behavior for initial load but refactoring toggle
            fetch(`/api/events/${event.id}/reminders`)
                .then(res => res.json())
                .then(data => setIsReminded(data.isReminded))
                .catch(err => console.error("Failed to fetch reminder status", err));
        }
    }, [user, event]);

    const handleToggleReminder = () => {
        if (!user || !event) return;

        // Optimistic update
        setIsReminded(prev => !prev);

        startTransition(async () => {
            try {
                const result = await toggleReminder(event.id);
                if (result.success && result.isReminded !== undefined) {
                    setIsReminded(result.isReminded);
                    if (result.isReminded) {
                        toast.success("Reminder set successfully! 🔔", {
                            description: "We'll email you before the event starts."
                        });
                    } else {
                        toast.info("Reminder removed");
                    }
                } else {
                    // Revert on failure
                    console.error(result.error);
                    setIsReminded(prev => !prev);
                    toast.error("Failed to update reminder");
                }
            } catch (error) {
                console.error("Failed to toggle reminder", error);
                setIsReminded(prev => !prev);
            }
        });
    };

    const handlePurchase = async () => {
        if (!selectedTier || !event) return;

        // Check wallet connection first
        if (!isConnected) {
            setShowWalletPrompt(true);
            return;
        }

        // Show quiz prompt first (only once per session)
        if (!hasSeenQuizPrompt) {
            setShowQuizPrompt(true);
            setHasSeenQuizPrompt(true);
            return;
        }

        const tier = event.ticketTiers.find(t => t.id === selectedTier);
        if (tier) {
            try {
                await buyTicket(1, tier.price.toString());
            } catch (err) {
                console.error("Purchase error:", err);
            }
        }
    };

    const startQuiz = () => {
        setShowQuizPrompt(false);
        setShowQuizModal(true);
    };

    const handleQuizComplete = (score: number, correct: number, total: number) => {
        setShowQuizModal(false);
        setQuizCompleted(true);
        // Auto-proceed to purchase after quiz
        const tier = event?.ticketTiers.find(t => t.id === selectedTier);
        if (tier) {
            buyTicket(1, tier.price.toString()).catch(err => {
                console.error("Purchase error:", err);
            });
        }
    };

    if (!event) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-black mb-4 uppercase italic">Event Not Found</h1>
                <p className="text-muted-foreground mb-8">The event you are looking for does not exist or has been moved.</p>
                <Button onClick={() => router.push("/events")}>Browse All Events</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <Image
                    src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop"}
                    alt={event.title || "Event Image"}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span>Back to Events</span>
                            </button>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                                            {event.category}
                                        </span>
                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                            <ShieldCheck className="w-4 h-4 text-accent" />
                                            <span>Verified Event</span>
                                        </div>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
                                        {event.title}
                                    </h1>
                                    <p className="text-xl md:text-2xl text-white/60 font-medium">with {event.artist}</p>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="secondary" className="rounded-full w-12 h-12 p-0 flex items-center justify-center">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        className={`rounded-full px-8 h-12 ${isReminded ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                        onClick={handleToggleReminder}
                                        disabled={isReminderPending || !user}
                                    >
                                        {isReminderPending ? "Loading..." : isReminded ? "Reminder Set ✓" : "Set Reminder"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Event Details */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold uppercase italic mb-6 flex items-center gap-3">
                                <Info className="w-6 h-6 text-primary" />
                                About this Event
                            </h2>
                            <p className="text-lg text-white/70 leading-relaxed font-light">
                                {event.description}
                            </p>
                        </section>

                        <section className="grid sm:grid-cols-2 gap-8">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <Calendar className="w-8 h-8 text-primary mb-4" />
                                <h3 className="font-bold uppercase text-sm text-white/40 mb-1 tracking-widest">Date</h3>
                                <p className="text-xl font-bold">{formatDate(event.date)}</p>
                                <p className="text-sm text-white/60">{event.time}</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <MapPin className="w-8 h-8 text-primary mb-4" />
                                <h3 className="font-bold uppercase text-sm text-white/40 mb-1 tracking-widest">Venue</h3>
                                <p className="text-xl font-bold">{event.venue}</p>
                                <p className="text-sm text-white/60">{event.location}</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold uppercase italic mb-6">Artist</h2>
                            <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                                    <Image
                                        src={event.artistImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop"}
                                        alt={event.artist || "Artist"}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100px, 96px"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic">{event.artist}</h3>
                                    <p className="text-white/60 mb-4">Verified Creator • 1.2M Followers</p>
                                    <Button variant="outline" size="sm">View Profile</Button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Tickets */}
                    <div className="relative">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl">
                                <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tight">Select Passes</h2>

                                <div className="space-y-4 mb-8">
                                    {event.ticketTiers?.map((tier) => (
                                        <button
                                            key={tier.id}
                                            onClick={() => setSelectedTier(tier.id)}
                                            className={`w-full p-6 rounded-3xl border text-left transition-all duration-300 ${selectedTier === tier.id
                                                ? 'bg-primary border-primary text-black'
                                                : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold uppercase tracking-tighter text-lg">{tier.name}</span>
                                                <span className="font-black text-xl">{formatPrice(tier.price)}</span>
                                            </div>
                                            <p className={`text-sm ${selectedTier === tier.id ? 'text-black/60' : 'text-white/40'}`}>
                                                {tier.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 text-white/60 text-sm">
                                            <Users className="w-4 h-4" />
                                            <span>{event.totalTickets - event.soldTickets} remaining</span>
                                        </div>
                                        <div className="text-sm font-mono text-primary font-bold">128 sold in 24h</div>
                                    </div>

                                    {isSuccess && (
                                        <div className="mb-6 p-4 bg-accent/20 border border-accent/20 rounded-2xl text-accent text-sm flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5" />
                                            <div>
                                                <p className="font-bold">Purchase Successful!</p>
                                                <button
                                                    onClick={() => router.push('/dashboard/tickets')}
                                                    className="underline hover:text-white transition-colors"
                                                >
                                                    View your NFT ticket in dashboard
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex items-center gap-3">
                                            <Info className="w-5 h-5" />
                                            <p>{(error as any)?.shortMessage || error.message || "Transaction failed"}</p>
                                        </div>
                                    )}

                                    <AdaptivePurchaseButton
                                        ticketPrice={selectedTier ? formatPrice(event.ticketTiers.find(t => t.id === selectedTier)?.price || 0) : 'Select tier'}
                                        tierName={selectedTier ? event.ticketTiers.find(t => t.id === selectedTier)?.name || '' : ''}
                                        onWalletPurchase={handlePurchase}
                                        isPending={isPending}
                                        disabled={!selectedTier}
                                    />

                                    <p className="text-center text-[10px] text-white/30 uppercase tracking-widest mt-6">
                                        AI adapts Web3 to your comfort level
                                    </p>
                                </div>
                            </div>

                            {/* Security Banner */}
                            <div className="p-6 bg-accent/10 border border-accent/20 rounded-3xl flex items-center gap-4">
                                <ShieldCheck className="w-10 h-10 text-accent flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-accent">Smart Resale Protection</h4>
                                    <p className="text-xs text-white/60">Tickets cannot be resold for more than {event.resaleCap}% of original price.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FanIQ Quiz Prompt Modal */}
            {showQuizPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                <Brain className="w-8 h-8 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic mb-2">Prove Your Fandom</h2>
                            <p className="text-white/60 text-sm">
                                Real fans get priority access! Take the FanIQ quiz to boost your position in the ticket queue.
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">1</div>
                                <span className="text-sm text-white/80">Answer {event.artist} trivia questions</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 text-sm font-bold">2</div>
                                <span className="text-sm text-white/80">Earn Fandom Score points</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold">3</div>
                                <span className="text-sm text-white/80">Top scorers get early access to tickets</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                className="w-full h-14 rounded-full text-lg font-black uppercase"
                                onClick={startQuiz}
                            >
                                <Brain className="w-5 h-5 mr-2" />
                                Take FanIQ Quiz
                            </Button>
                            <button
                                onClick={() => setShowQuizPrompt(false)}
                                className="w-full py-3 text-white/40 hover:text-white/60 text-sm transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Wallet Connection Prompt Modal */}
            {showWalletPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-orange-400" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic mb-2">Connect Wallet</h2>
                            <p className="text-white/60 text-sm">
                                Connect your wallet to purchase NFT tickets. Your ticket will be minted directly to your wallet.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-center text-xs text-white/40 mb-4">
                                Use the wallet button in the header to connect your EVM or Solana wallet.
                            </p>
                            <button
                                onClick={() => setShowWalletPrompt(false)}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Quiz Modal */}
            <QuizModal
                isOpen={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                onComplete={handleQuizComplete}
                artistName={event.artist}
            />

            {/* AI Decision Panel */}
            <AIDecisionPanel />
        </div>
    );
}
