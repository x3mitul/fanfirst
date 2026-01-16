"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    X,
} from "lucide-react";
import { EventCard } from "@/components/events";
import { VideoIntro } from "@/components/events/VideoIntro";
import { Button } from "@/components/ui";
import { categories } from "@/lib/mock-data";
import { artistQuotes, ArtistQuote } from "@/lib/artist-quotes";
import { cn } from "@/lib/utils";
import { Event } from "@/lib/types";
import Image from "next/image";

const locations = [
    "All Locations",
    "New York, NY",
    "Los Angeles, CA",
    "London, UK",
    "Indio, CA",
];

const sortOptions = [
    { value: "date", label: "Date (Soonest)" },
    { value: "price-low", label: "Price (Low to High)" },
    { value: "price-high", label: "Price (High to Low)" },
    { value: "popularity", label: "Most Popular" },
];

interface EventsPageClientProps {
    events: Event[];
}

export default function EventsPageClient({ events }: EventsPageClientProps) {
    const [showIntro, setShowIntro] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState("All Locations");
    const [sortBy, setSortBy] = useState("date");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [currentQuote, setCurrentQuote] = useState<ArtistQuote>(artistQuotes[0]);
    const [visibleEventIndex, setVisibleEventIndex] = useState(0);

    const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Check if intro has been shown before
    useEffect(() => {
        const hasSeenIntro = localStorage.getItem('fanfirst-intro-shown');
        if (!hasSeenIntro) {
            setShowIntro(true);
        }
    }, []);

    const handleIntroComplete = () => {
        setShowIntro(false);
        localStorage.setItem('fanfirst-intro-shown', 'true');
    };

    const filteredEvents = useMemo(() => {
        let filtered = [...events];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (event) =>
                    event.title.toLowerCase().includes(query) ||
                    event.artist.toLowerCase().includes(query) ||
                    event.venue.toLowerCase().includes(query)
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter((event) => event.category === selectedCategory);
        }

        if (selectedLocation !== "All Locations") {
            filtered = filtered.filter((event) => event.location === selectedLocation);
        }

        filtered = filtered.filter((event) => {
            const minPrice = Math.min(...event.ticketTiers.map((t) => t.price));
            return minPrice >= priceRange[0] && minPrice <= priceRange[1];
        });

        switch (sortBy) {
            case "date":
                filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                break;
            case "price-low":
                filtered.sort((a, b) => {
                    const aMin = Math.min(...a.ticketTiers.map((t) => t.price));
                    const bMin = Math.min(...b.ticketTiers.map((t) => t.price));
                    return aMin - bMin;
                });
                break;
            case "price-high":
                filtered.sort((a, b) => {
                    const aMin = Math.min(...a.ticketTiers.map((t) => t.price));
                    const bMin = Math.min(...b.ticketTiers.map((t) => t.price));
                    return bMin - aMin;
                });
                break;
            case "popularity":
                filtered.sort((a, b) => b.soldTickets / b.totalTickets - a.soldTickets / a.totalTickets);
                break;
        }

        return filtered;
    }, [events, searchQuery, selectedCategory, selectedLocation, sortBy, priceRange]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = document.getElementById("events-scroll-container");
            if (!scrollContainer) return;

            const scrollTop = scrollContainer.scrollTop;
            const containerHeight = scrollContainer.clientHeight;
            const centerY = scrollTop + containerHeight / 2;

            let closestIndex = 0;
            let closestDistance = Infinity;

            eventRefs.current.forEach((ref, index) => {
                if (ref) {
                    const rect = ref.getBoundingClientRect();
                    const scrollContainerRect = scrollContainer.getBoundingClientRect();
                    const elementCenter = rect.top - scrollContainerRect.top + scrollTop + rect.height / 2;
                    const distance = Math.abs(elementCenter - centerY);

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                }
            });

            if (closestIndex !== visibleEventIndex) {
                setVisibleEventIndex(closestIndex);
            }
        };

        const scrollContainer = document.getElementById("events-scroll-container");
        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll);
            return () => scrollContainer.removeEventListener("scroll", handleScroll);
        }
    }, [visibleEventIndex, filteredEvents.length]);

    useEffect(() => {
        if (filteredEvents[visibleEventIndex]) {
            const event = filteredEvents[visibleEventIndex];
            const categoryQuotes = artistQuotes.filter(q => q.category === event.category);
            const quote = categoryQuotes.length > 0
                ? categoryQuotes[visibleEventIndex % categoryQuotes.length]
                : artistQuotes[visibleEventIndex % artistQuotes.length];
            setCurrentQuote(quote);
        }
    }, [visibleEventIndex, filteredEvents]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory(null);
        setSelectedLocation("All Locations");
        setPriceRange([0, 1000]);
        setSortBy("date");
    };

    const hasActiveFilters =
        searchQuery ||
        selectedCategory ||
        selectedLocation !== "All Locations" ||
        priceRange[0] > 0 ||
        priceRange[1] < 1000;

    return (
        <>
            {showIntro && (
                <VideoIntro
                    onComplete={handleIntroComplete}
                />
            )}

            <div className="min-h-screen pt-20 bg-black">
                <section className="bg-gradient-to-b from-zinc-900 to-black py-12 lg:py-16 border-b border-zinc-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-6xl lg:text-8xl font-black mb-4 uppercase tracking-tight"
                                style={{
                                    WebkitTextStroke: '2px #dfff00',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 60px rgba(223, 255, 0, 0.8), 0 0 120px rgba(223, 255, 0, 0.4), 0 0 180px rgba(204, 255, 0, 0.2)',
                                    filter: 'drop-shadow(0 0 30px rgba(223, 255, 0, 0.5))'
                                }}
                            >
                                Discover Events
                            </h1>
                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfff00] via-[#00ff88] to-[#00d4ff] text-lg max-w-2xl mx-auto font-semibold">
                                Find your next unforgettable experience with verified NFT tickets
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#dfff00]" />
                                <input
                                    type="text"
                                    placeholder="Search events, artists, or venues..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#dfff00] focus:shadow-[0_0_20px_rgba(223,255,0,0.2)] transition-all"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-zinc-800">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-bold transition-all",
                                    !selectedCategory
                                        ? "bg-[#dfff00] text-black shadow-[0_0_15px_rgba(223,255,0,0.4)]"
                                        : "bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                                )}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                                        selectedCategory === cat.id
                                            ? "bg-[#dfff00] text-black shadow-[0_0_15px_rgba(223,255,0,0.4)]"
                                            : "bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                                    )}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 text-gray-400 hover:text-[#dfff00]"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-gray-400">
                            <span className="text-[#dfff00] font-bold">{filteredEvents.length}</span> events found
                        </p>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#dfff00]"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex gap-8 h-[calc(100vh-350px)] min-h-[700px]">
                        <div
                            id="events-scroll-container"
                            className="flex-1 overflow-y-auto pr-4 space-y-6"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#dfff00 #18181b'
                            }}
                        >
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        ref={(el) => { eventRefs.current[index] = el }}
                                        onClick={() => setVisibleEventIndex(index)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="cursor-pointer"
                                    >
                                        <EventCard
                                            event={event}
                                            index={index}
                                            isInView={index === visibleEventIndex}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-gray-400 text-lg mb-4">
                                        No events found matching your criteria
                                    </p>
                                    <Button variant="outline" onClick={clearFilters} className="border-[#dfff00] text-[#dfff00] hover:bg-[#dfff00] hover:text-black">
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="w-[550px] flex-shrink-0 sticky top-0 h-fit">
                            <motion.div
                                className="relative bg-gradient-to-br from-purple-900/20 via-zinc-900 to-blue-900/20 border-2 rounded-2xl overflow-hidden p-10"
                                style={{
                                    borderImage: 'linear-gradient(135deg, #dfff00, #00ff88, #00d4ff, #ff00ff) 1'
                                }}
                                animate={{
                                    boxShadow: [
                                        '0 0 40px rgba(223, 255, 0, 0.3)',
                                        '0 0 60px rgba(0, 255, 136, 0.3)',
                                        '0 0 40px rgba(223, 255, 0, 0.3)'
                                    ]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentQuote.id}
                                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                                        transition={{ duration: 0.6 }}
                                        className="relative z-10"
                                    >
                                        <motion.div
                                            className="relative w-full h-80 mb-6 rounded-2xl overflow-hidden"
                                            style={{
                                                border: '3px solid transparent',
                                                backgroundImage: 'linear-gradient(black, black), linear-gradient(135deg, #dfff00, #00ff88, #00d4ff)',
                                                backgroundOrigin: 'border-box',
                                                backgroundClip: 'padding-box, border-box'
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <Image
                                                src={currentQuote.image}
                                                alt={currentQuote.author}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                        </motion.div>

                                        <div className="space-y-5">
                                            <motion.div
                                                className="relative"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <p className="text-2xl font-bold text-white leading-relaxed italic">
                                                    "{currentQuote.quote}"
                                                </p>
                                            </motion.div>

                                            <motion.div
                                                className="flex items-center gap-4 pt-5"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                style={{
                                                    borderTop: '2px solid transparent',
                                                    borderImage: 'linear-gradient(90deg, #dfff00, #00ff88, #00d4ff) 1'
                                                }}
                                            >
                                                <div className="w-1.5 h-16 rounded-full bg-gradient-to-b from-[#dfff00] via-[#00ff88] to-[#00d4ff]" />
                                                <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfff00] via-[#00ff88] to-[#00d4ff] font-black text-xl uppercase tracking-wider">
                                                    — {currentQuote.author}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
