"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Calendar,
    MapPin,
    ArrowLeft,
    ShieldCheck,
    TrendingUp,
    User,
    Wallet,
    CheckCircle,
    AlertCircle,
    ArrowUpRight,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { mockResaleListings } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";
import { useTicketPurchase } from "@/hooks";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ResaleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { buyTicket, isPending, isSuccess, error, hash } = useTicketPurchase();

    const listing = mockResaleListings.find((l) => l.id === params.id);

    const handlePurchase = async () => {
        if (!listing) return;
        try {
            await buyTicket(1, listing.price.toString());
        } catch (err) {
            console.error("Purchase error:", err);
        }
    };

    if (!listing) {
        return (
            <div className="min-h-screen bg-black text-white pt-20 flex flex-col items-center justify-center text-center px-4">
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto mb-6 border-4 border-zinc-800 flex items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-zinc-600" />
                    </div>
                    <h1 className="text-4xl font-black uppercase mb-4">Listing Not Found</h1>
                    <p className="text-zinc-500 font-mono mb-8">
                        This listing may have been sold or removed from the marketplace.
                    </p>
                </div>
                <Button onClick={() => router.push("/resale")}>Back to Market</Button>
            </div>
        );
    }

    const event = listing.ticket.event;
    const originalPrice = listing.ticket.originalPrice;
    const currentPrice = listing.price;
    const markup = Math.round(((currentPrice - originalPrice) / originalPrice) * 100);
    const artistRoyalty = event.artistRoyalty;
    const royaltyAmount = (currentPrice * artistRoyalty) / 100;

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Marquee Banner */}
            <div className="fixed top-20 left-0 w-full bg-secondary text-black py-1 overflow-hidden z-40 border-y-2 border-black">
                <div className="animate-marquee whitespace-nowrap font-black uppercase text-xs tracking-widest">
                    VERIFIED RESALE TICKET // PRICE CAPPED BY SMART CONTRACT // ARTIST RECEIVES {artistRoyalty}% ROYALTY //
                    VERIFIED RESALE TICKET // PRICE CAPPED BY SMART CONTRACT // ARTIST RECEIVES {artistRoyalty}% ROYALTY //
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

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
                                <span className="font-mono text-sm uppercase">Back to Market</span>
                            </button>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest border border-black">
                                    Resale
                                </span>
                                <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest">
                                    {event.category}
                                </span>
                                <div className="flex items-center gap-2 text-white/80 text-sm">
                                    <ShieldCheck className="w-4 h-4 text-accent" />
                                    <span className="font-mono">Verified Ticket</span>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-2">
                                {event.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/60 font-medium">
                                {listing.ticket.tierName} • {event.artist}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Event Info */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid sm:grid-cols-2 gap-4"
                        >
                            <div className="p-6 bg-zinc-950 border-2 border-zinc-800 hover:border-primary transition-colors group">
                                <Calendar className="w-6 h-6 text-primary mb-3" />
                                <h3 className="font-black uppercase text-xs text-zinc-500 mb-1 tracking-widest">Date & Time</h3>
                                <p className="text-lg font-bold">{formatDate(event.date)}</p>
                                <p className="text-sm text-zinc-400 font-mono">{event.time}</p>
                            </div>
                            <div className="p-6 bg-zinc-950 border-2 border-zinc-800 hover:border-primary transition-colors group">
                                <MapPin className="w-6 h-6 text-primary mb-3" />
                                <h3 className="font-black uppercase text-xs text-zinc-500 mb-1 tracking-widest">Venue</h3>
                                <p className="text-lg font-bold">{event.venue}</p>
                                <p className="text-sm text-zinc-400 font-mono">{event.location}</p>
                            </div>
                        </motion.section>

                        {/* Price Breakdown */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 bg-zinc-950 border-2 border-zinc-800"
                        >
                            <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-secondary" />
                                Price Analysis
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-dashed border-zinc-800">
                                    <span className="text-zinc-400 font-mono text-sm">Original Price</span>
                                    <span className="font-bold">{formatPrice(originalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-dashed border-zinc-800">
                                    <span className="text-zinc-400 font-mono text-sm">Resale Price</span>
                                    <span className="font-black text-xl">{formatPrice(currentPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-dashed border-zinc-800">
                                    <span className="text-zinc-400 font-mono text-sm">Markup</span>
                                    <span className={`font-bold ${markup > 0 ? 'text-secondary' : 'text-accent'}`}>
                                        {markup > 0 ? '+' : ''}{markup}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-mono text-sm">Artist Royalty ({artistRoyalty}%)</span>
                                    <span className="font-bold text-primary">{formatPrice(royaltyAmount)}</span>
                                </div>
                            </div>
                        </motion.section>

                        {/* Verification Info */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 bg-accent/10 border-2 border-accent/30"
                        >
                            <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-3 text-accent">
                                <ShieldCheck className="w-5 h-5" />
                                Why This Ticket is Verified
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Price Capped</p>
                                        <p className="text-xs text-zinc-400">Max {event.resaleCap}% above original</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Blockchain Verified</p>
                                        <p className="text-xs text-zinc-400">NFT ownership confirmed</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Artist Approved</p>
                                        <p className="text-xs text-zinc-400">Official resale channel</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Instant Transfer</p>
                                        <p className="text-xs text-zinc-400">Ownership transfers on-chain</p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Seller Info */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 bg-zinc-950 border-2 border-zinc-800"
                        >
                            <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-3">
                                <User className="w-5 h-5 text-zinc-400" />
                                Seller Information
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                                        <User className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold font-mono">
                                            {listing.sellerId.slice(0, 12)}...
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Listed {formatDate(listing.listedAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Status</p>
                                    <p className="font-bold text-accent uppercase">{listing.status}</p>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column: Purchase */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-32 space-y-6"
                        >
                            <div className="bg-zinc-950 border-4 border-white p-8 relative">
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1"></div>

                                <div className="text-center mb-8">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Total Price</p>
                                    <p className="text-5xl font-black font-mono">{formatPrice(currentPrice)}</p>
                                    <p className="text-sm text-zinc-400 mt-2">
                                        Includes {artistRoyalty}% artist royalty
                                    </p>
                                </div>

                                <div className="border-t-2 border-dashed border-zinc-800 my-6"></div>

                                <div className="space-y-3 mb-8 text-sm">
                                    <div className="flex justify-between font-mono">
                                        <span className="text-zinc-500">Tier</span>
                                        <span className="font-bold">{listing.ticket.tierName}</span>
                                    </div>
                                    <div className="flex justify-between font-mono">
                                        <span className="text-zinc-500">Original</span>
                                        <span>{formatPrice(originalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between font-mono">
                                        <span className="text-zinc-500">Markup</span>
                                        <span className={markup > 0 ? 'text-secondary' : 'text-accent'}>
                                            {markup > 0 ? '+' : ''}{markup}%
                                        </span>
                                    </div>
                                </div>

                                {isSuccess && (
                                    <div className="mb-6 p-4 bg-accent/20 border-2 border-accent text-accent text-sm">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                            <div>
                                                <p className="font-black uppercase">Purchase Complete!</p>
                                                <button
                                                    onClick={() => router.push('/dashboard/tickets')}
                                                    className="underline hover:text-white transition-colors"
                                                >
                                                    View in Dashboard →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold mb-1">
                                                    {error.message?.includes('User rejected') || error.message?.includes('User denied')
                                                        ? 'Transaction Cancelled'
                                                        : error.message?.includes('insufficient')
                                                            ? 'Insufficient Funds'
                                                            : 'Transaction Failed'}
                                                </p>
                                                <p className="text-xs text-red-400/70">
                                                    {error.message?.includes('User rejected') || error.message?.includes('User denied')
                                                        ? 'You cancelled the transaction in your wallet.'
                                                        : error.message?.includes('insufficient')
                                                            ? 'You don\'t have enough funds to complete this purchase.'
                                                            : 'Something went wrong. Please try again.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Wallet Connection / Buy Button */}
                                {!isConnected ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-zinc-900 border-2 border-dashed border-zinc-700 text-center">
                                            <Wallet className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                                            <p className="text-sm text-zinc-400 mb-1">Connect your wallet to purchase</p>
                                            <p className="text-xs text-zinc-600">Supports MetaMask, WalletConnect, and more</p>
                                        </div>
                                        <div className="flex justify-center [&>button]:w-full [&>div]:w-full">
                                            <ConnectButton
                                                showBalance={false}
                                                chainStatus="none"
                                                accountStatus="avatar"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {hash && !isSuccess && (
                                            <div className="mb-6 p-4 bg-primary/10 border-2 border-primary/30 text-primary text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold">Confirming transaction...</p>
                                                        <p className="text-xs opacity-70 font-mono truncate">
                                                            {hash.slice(0, 16)}...{hash.slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={handlePurchase}
                                            disabled={isPending || isSuccess}
                                            className="w-full py-4 bg-primary text-black font-black uppercase tracking-wider text-lg hover:bg-white hover:translate-x-1 hover:-translate-y-1 transition-all border-2 border-transparent hover:border-black shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : isSuccess ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    Purchased!
                                                </>
                                            ) : (
                                                <>
                                                    <Wallet className="w-5 h-5" />
                                                    Buy Now
                                                </>
                                            )}
                                        </button>

                                        <p className="text-center text-xs text-zinc-500 mt-4">
                                            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                                        </p>
                                    </>
                                )}

                                <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest mt-6">
                                    Secured by FanFirst Protocol
                                </p>
                            </div>

                            {/* Artist Info */}
                            <div className="p-6 bg-zinc-950 border-2 border-zinc-800 flex items-center gap-4">
                                <div className="relative w-16 h-16 overflow-hidden border-2 border-zinc-700 grayscale hover:grayscale-0 transition-all">
                                    <Image src={event.artistImage} alt={event.artist} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Artist</p>
                                    <p className="font-black uppercase">{event.artist}</p>
                                    <p className="text-xs text-primary">Receives {formatPrice(royaltyAmount)} from this sale</p>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-zinc-600" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
