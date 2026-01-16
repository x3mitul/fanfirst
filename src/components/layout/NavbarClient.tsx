"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    Ticket,
    Search,
    ChevronDown,
    Calendar,
    MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { DualWalletButton } from "@/components/ui";
import { mockEvents } from "@/lib/mock-data";
import { useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";

interface Auth0User {
    name: string;
    email: string;
    picture: string | null;
}

interface NavbarClientProps {
    auth0User: Auth0User | null;
}

const navLinks = [
    { href: "/events", label: "EVENTS" },
    { href: "/resale", label: "MARKET" },
    { href: "/community", label: "COMMUNITY" },
    { href: "/how-it-works", label: "PROTOCOL" },
];

export default function NavbarClient({ auth0User }: NavbarClientProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user: storeUser, isAuthenticated, logout, events } = useStore();

    // Wallet disconnect hooks
    const { disconnect: disconnectEVM } = useDisconnect();
    const { disconnect: disconnectSolana } = useWallet();

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Use mock events if store is empty
    const allEvents = events.length > 0 ? events : mockEvents;

    // Filter events based on search query
    const searchResults = searchQuery.trim()
        ? allEvents.filter(
            (event) =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    // Use Auth0 user if available, otherwise fall back to store user
    const currentUser = auth0User ? {
        name: auth0User.name,
        email: auth0User.email,
        avatar: auth0User.picture,
        fandomScore: storeUser?.fandomScore || 0,
    } : storeUser;

    const isLoggedIn = !!auth0User || isAuthenticated;

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Close search on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSearchOpen(false);
                setSearchQuery("");
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    // Keyboard shortcut to open search (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearchSelect = (eventId: string) => {
        setSearchOpen(false);
        setSearchQuery("");
        router.push(`/events/${eventId}`);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-24">
                <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 h-full">
                    <div className="flex items-center justify-between h-full">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 ml-2">
                            <div className="w-14 h-14 bg-primary flex items-center justify-center">
                                <Ticket className="w-8 h-8 text-black" />
                            </div>
                            <span className="text-2xl font-black tracking-tight">FANFIRST.</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-base font-bold tracking-wider transition-colors",
                                        pathname === link.href
                                            ? "text-primary"
                                            : "text-muted hover:text-foreground"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            <button
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-card/80 border border-border rounded-lg transition-colors text-muted hover:text-foreground"
                                onClick={() => setSearchOpen(true)}
                                title="Search (Ctrl+K)"
                            >
                                <Search className="w-4 h-4" />
                                <span className="text-sm">Search</span>
                                <div className="flex items-center gap-1 ml-2">
                                    <kbd className="px-1.5 py-0.5 text-xs bg-background rounded border border-border">CTRL</kbd>
                                    <kbd className="px-1.5 py-0.5 text-xs bg-background rounded border border-border">K</kbd>
                                </div>
                            </button>
                            {/* Mobile search button */}
                            <button
                                className="sm:hidden p-2 hover:bg-card rounded-lg transition-colors"
                                onClick={() => setSearchOpen(true)}
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Only show wallet button when logged in */}
                            {isLoggedIn && <DualWalletButton />}

                            {isLoggedIn && currentUser ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-3 px-3 py-1.5 border border-border hover:border-primary transition-colors bg-card"
                                    >
                                        <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-full overflow-hidden flex items-center justify-center">
                                            {currentUser.avatar ? (
                                                <Image
                                                    src={currentUser.avatar}
                                                    alt={currentUser.name || ''}
                                                    width={32}
                                                    height={32}
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-black">
                                                    {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold uppercase hidden sm:block">
                                            {currentUser.name?.split(' ')[0] || 'User'}
                                        </span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-64 bg-card border border-border p-2 shadow-2xl z-50"
                                            >
                                                <div className="p-2 border-b border-border mb-2">
                                                    <p className="font-bold uppercase text-sm truncate">{currentUser.email}</p>
                                                    {currentUser.fandomScore > 0 && (
                                                        <p className="text-xs text-primary font-mono mt-1">SCORE: {currentUser.fandomScore}</p>
                                                    )}
                                                    {auth0User && (
                                                        <p className="text-xs text-accent font-mono mt-1">✓ AUTH0 VERIFIED</p>
                                                    )}
                                                </div>
                                                <Link href="/dashboard" className="block px-4 py-2 text-sm font-bold uppercase hover:bg-primary hover:text-black transition-colors">
                                                    Dashboard
                                                </Link>
                                                <Link href="/dashboard/tickets" className="block px-4 py-2 text-sm font-bold uppercase hover:bg-primary hover:text-black transition-colors">
                                                    My Tickets
                                                </Link>
                                                <Link href="/dashboard/settings" className="block px-4 py-2 text-sm font-bold uppercase hover:bg-primary hover:text-black transition-colors">
                                                    Settings
                                                </Link>
                                                <Link href="/organizer" className="block px-4 py-2 text-sm font-bold uppercase hover:bg-primary hover:text-black transition-colors">
                                                    Organizer Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        // Disconnect all wallets first
                                                        disconnectEVM();
                                                        disconnectSolana();
                                                        // Clear store state
                                                        logout();
                                                        setUserMenuOpen(false);
                                                        // Redirect to Auth0 logout if using Auth0
                                                        if (auth0User) window.location.href = '/auth/logout';
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm font-bold uppercase text-red-500 hover:bg-red-500 hover:text-black transition-colors mt-2 border-t border-border pt-2"
                                                >
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="text-sm font-bold uppercase hover:text-primary">
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 bg-primary text-black text-sm font-bold uppercase hover:bg-primary/90 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-card border-b border-border"
                        >
                            <nav className="px-4 py-4 space-y-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block text-sm font-bold tracking-wider"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Search Modal */}
            <AnimatePresence>
                {searchOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                            }}
                        />

                        {/* Search Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
                        >
                            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 p-4 border-b border-border">
                                    <Search className="w-5 h-5 text-muted flex-shrink-0" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search events, artists, venues..."
                                        className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted"
                                    />
                                    <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-background rounded border border-border text-muted">
                                        ESC
                                    </kbd>
                                </div>

                                {/* Search Results */}
                                {searchQuery.trim() && (
                                    <div className="max-h-80 overflow-y-auto">
                                        {searchResults.length > 0 ? (
                                            <div className="p-2">
                                                {searchResults.map((event) => (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => handleSearchSelect(event.id)}
                                                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-background transition-colors text-left"
                                                    >
                                                        <img
                                                            src={event.image}
                                                            alt={event.title}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold truncate">{event.title}</p>
                                                            <p className="text-sm text-muted truncate">{event.artist}</p>
                                                            <div className="flex items-center gap-3 text-xs text-muted mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(event.date).toLocaleDateString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {event.venue}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-muted">
                                                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>No events found for "{searchQuery}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Empty State */}
                                {!searchQuery.trim() && (
                                    <div className="p-6 text-center text-muted">
                                        <p className="text-sm">Start typing to search events, artists, or venues</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
