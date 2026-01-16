"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  Shield,
  Clock,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui";
import { mockResaleListings } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";

export default function ResalePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const listings = mockResaleListings.filter((listing) =>
    listing.ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.ticket.event.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      {/* Marquee Banner */}
      <div className="fixed top-20 left-0 w-full bg-secondary text-black py-1 overflow-hidden z-40 border-y-2 border-black">
        <div className="animate-marquee whitespace-nowrap font-black uppercase text-xs tracking-widest">
          VERIFIED RESALE // NO SCALPERS // NO BOTS // 100% AUTHENTIC // ARTIST APPROVED //
          VERIFIED RESALE // NO SCALPERS // NO BOTS // 100% AUTHENTIC // ARTIST APPROVED //
          VERIFIED RESALE // NO SCALPERS // NO BOTS // 100% AUTHENTIC // ARTIST APPROVED //
        </div>
      </div>

      {/* Header */}
      <section className="py-12 border-b-2 border-zinc-800 bg-zinc-950 relative overflow-hidden">
        {/* Noise Texture */}
        <div className="absolute inset-0 pointer-events-none bg-[url('/noise.svg')] bg-repeat opacity-[0.03] mix-blend-overlay"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-block bg-primary text-black px-2 py-1 font-black text-xs uppercase tracking-widest mb-4">
              Secondary Market Protocol
            </div>
            <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter mb-4 text-white">
              The <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Market</span>
            </h1>
            <p className="text-zinc-400 font-mono uppercase text-sm max-w-xl border-l-2 border-primary pl-4">
              Peer-to-peer exchange active. Price caps mandated by smart contracts. <br />
              <span className="text-primary font-bold">Scalping impossible.</span>
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2"></div>
              <div className="relative flex items-center bg-black border-2 border-zinc-800 group-hover:border-primary transition-colors">
                <Search className="w-6 h-6 text-primary ml-4" />
                <input
                  type="text"
                  placeholder="SEARCH MARKETPLACE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-4 bg-transparent outline-none uppercase font-bold text-white placeholder:text-zinc-700"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info Banner */}
      <div className="border-b-2 border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-zinc-800">
          <div className="p-6 flex items-center gap-4 hover:bg-white/5 transition-colors group">
            <Shield className="w-8 h-8 text-zinc-600 group-hover:text-primary transition-colors" />
            <div>
              <h3 className="font-black uppercase text-sm">Capped Prices</h3>
              <p className="font-mono text-xs text-zinc-500">Algorithmically limited markup</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4 hover:bg-white/5 transition-colors group">
            <TrendingUp className="w-8 h-8 text-zinc-600 group-hover:text-secondary transition-colors" />
            <div>
              <h3 className="font-black uppercase text-sm">Fair Royalties</h3>
              <p className="font-mono text-xs text-zinc-500">Artist receives split instantly</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4 hover:bg-white/5 transition-colors group">
            <Clock className="w-8 h-8 text-zinc-600 group-hover:text-accent transition-colors" />
            <div>
              <h3 className="font-black uppercase text-sm">Instant Settlment</h3>
              <p className="font-mono text-xs text-zinc-500">Ownership transfers in blocktime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b-2 border-zinc-900 gap-4">
          <p className="font-mono text-primary text-xl">
            /<span className="font-bold text-white ml-2">{listings.length} LISTINGS FOUND</span>
          </p>
          <div className="relative">
            <div className="absolute inset-0 bg-white translate-x-1 translate-y-1"></div>
            <div className="relative bg-black border-2 border-white flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-black text-white font-bold uppercase text-sm outline-none cursor-pointer"
              >
                <option value="recent" className="bg-black text-white">Recent Drops</option>
                <option value="price-low" className="bg-black text-white">Price: Low to High</option>
                <option value="price-high" className="bg-black text-white">Price: High to Low</option>
                <option value="date" className="bg-black text-white">Event Date</option>
              </select>
              <ChevronDown className="w-4 h-4 text-white mr-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Listings */}
        {listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {listings.map((listing, index) => {
              const event = listing.ticket.event;

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-zinc-950 border-2 border-zinc-800 hover:border-primary transition-colors relative"
                >
                  <div className="relative aspect-video overflow-hidden border-b-2 border-zinc-800">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute top-0 right-0 p-2">
                      <span className="bg-secondary text-white border border-black font-black uppercase text-[10px] px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
                        RESALE
                      </span>
                    </div>
                  </div>

                  <div className="p-5 relative">
                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-black uppercase text-lg leading-tight mb-1 group-hover:text-primary transition-colors truncate max-w-45">{event.title}</h4>
                        <p className="text-xs font-bold uppercase text-zinc-500">{event.artist}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white font-mono">
                          {formatPrice(listing.price)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-zinc-800 my-4"></div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 mb-6">
                      <div>
                        <span className="block text-[10px] text-zinc-600 uppercase font-bold">DATE</span>
                        {formatDate(event.date)}
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-zinc-600 uppercase font-bold">TYPE</span>
                        {listing.ticket.tierName}
                      </div>
                    </div>

                    <Link href={`/resale/${listing.id}`}>
                      <button className="w-full py-3 bg-white text-black font-black uppercase tracking-wider hover:bg-primary hover:translate-x-1 hover:-translate-y-1 transition-all border-2 border-transparent hover:border-black shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        ACQUIRE TICKET
                      </button>
                    </Link>

                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-zinc-800 group-hover:bg-primary transition-colors flex items-center justify-center border-2 border-black z-10">
                      <ArrowUpRight className="w-3 h-3 text-black" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border-2 border-dashed border-zinc-800"
          >
            <h3 className="text-2xl font-black uppercase mb-2 text-zinc-700">Database Empty</h3>
            <p className="text-zinc-500 font-mono mb-8">No matching records found in the chain</p>
            <Link href="/events">
              <Button>Browse Primary</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
