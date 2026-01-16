"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    Bell,
    Wallet,
    Music,
    Shield,
    Eye,
    EyeOff,
    Check,
    ChevronRight,
    Camera,
    LogOut,
    Trash2,
    AlertTriangle,
    Copy,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useAccount, useDisconnect } from "wagmi";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";

interface Auth0User {
    name: string;
    email: string;
    picture: string | null;
}

interface SettingsClientProps {
    auth0User: Auth0User | null;
}

export default function SettingsClient({ auth0User }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState("profile");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const { spotifyConnected, setSpotifyConnected, user: storeUser } = useStore();

    // Get connected wallet from wagmi
    const { address, isConnected, connector } = useAccount();
    const { disconnect } = useDisconnect();
    
    // Get Solana wallet
    const { address: solanaAddress, connected: solanaConnected, disconnect: disconnectSolana, shortAddress } = useSolanaWallet();

    // Use Auth0 user data if available
    const currentUser = auth0User ? {
        name: auth0User.name,
        email: auth0User.email,
        avatar: auth0User.picture,
    } : storeUser;

    // Form states - initialize with Auth0 data
    const [profile, setProfile] = useState({
        name: auth0User?.name || storeUser?.name || "",
        email: auth0User?.email || storeUser?.email || "",
        username: (auth0User?.name || storeUser?.name || "").toLowerCase().replace(/\s+/g, ''),
        bio: "Music lover, concert enthusiast. Synthwave is life. 🎹",
    });

    const [notifications, setNotifications] = useState({
        emailTickets: true,
        emailEvents: true,
        emailResale: false,
        pushTickets: true,
        pushEvents: false,
        pushResale: true,
    });

    const [privacy, setPrivacy] = useState({
        showFandomScore: true,
        showEventsAttended: true,
        showVouches: false,
        publicProfile: true,
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSignOut = () => {
        if (auth0User) {
            window.location.href = '/auth/logout';
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy", icon: Shield },
        { id: "connected", label: "Connected Apps", icon: Music },
        { id: "wallet", label: "Wallet", icon: Wallet },
    ];

    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-muted">Manage your account preferences</p>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                        ? "bg-primary text-white"
                                        : "hover:bg-card text-muted hover:text-foreground"
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-border">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-danger hover:bg-danger/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
                            {/* Profile Tab */}
                            {activeTab === "profile" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                                        {/* Avatar */}
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="relative">
                                                {currentUser?.avatar ? (
                                                    <img
                                                        src={currentUser.avatar}
                                                        alt={currentUser.name || "User"}
                                                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                        <span className="text-3xl font-bold text-black">
                                                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                )}
                                                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors">
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="font-medium">{profile.name}</p>
                                                <p className="text-sm text-muted">@{profile.username}</p>
                                                {auth0User && (
                                                    <p className="text-xs text-accent mt-1">✓ Auth0 Verified</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Form */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Username</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                                                    <input
                                                        type="text"
                                                        value={profile.username}
                                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                                        className="w-full pl-8 pr-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                    disabled={!!auth0User}
                                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                                {auth0User && (
                                                    <p className="text-xs text-muted mt-1">Email is managed by Auth0</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2">Bio</label>
                                                <textarea
                                                    value={profile.bio}
                                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                                />
                                                <p className="text-xs text-muted mt-1">Max 160 characters</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                        <Button variant="outline">Cancel</Button>
                                        <Button onClick={handleSave}>
                                            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === "security" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Password</h2>

                                        {auth0User ? (
                                            <div className="p-4 bg-background rounded-lg border border-border">
                                                <p className="text-muted">Your password is managed by Auth0. To change it, please use the Auth0 password reset feature.</p>
                                                <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.href = '/auth/login?screen_hint=reset-password'}>
                                                    Reset Password
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-w-md">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Current Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            placeholder="Enter current password"
                                                            className="w-full px-4 py-3 pr-12 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                                                        >
                                                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">New Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showNewPassword ? "text" : "password"}
                                                            placeholder="Enter new password"
                                                            className="w-full px-4 py-3 pr-12 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                                                        >
                                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                                        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium">Authenticator App</p>
                                                <p className="text-sm text-muted">Add an extra layer of security</p>
                                            </div>
                                            <Button variant="outline" size="sm">Enable</Button>
                                        </div>
                                    </div>

                                    {!auth0User && (
                                        <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                            <Button variant="outline">Cancel</Button>
                                            <Button onClick={handleSave}>Update Password</Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === "notifications" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Email Notifications</h2>

                                        <div className="space-y-4">
                                            {[
                                                { key: "emailTickets", label: "Ticket updates", desc: "When your ticket status changes" },
                                                { key: "emailEvents", label: "Event reminders", desc: "Upcoming events you have tickets for" },
                                                { key: "emailResale", label: "Resale opportunities", desc: "When tickets you want are listed" },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{item.label}</p>
                                                        <p className="text-sm text-muted">{item.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notifications[item.key as keyof typeof notifications]}
                                                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>

                                        <div className="space-y-4">
                                            {[
                                                { key: "pushTickets", label: "Ticket alerts", desc: "Real-time ticket updates" },
                                                { key: "pushEvents", label: "Event alerts", desc: "New events from artists you follow" },
                                                { key: "pushResale", label: "Price drops", desc: "When resale prices drop" },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{item.label}</p>
                                                        <p className="text-sm text-muted">{item.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notifications[item.key as keyof typeof notifications]}
                                                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-border">
                                        <Button onClick={handleSave}>
                                            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : "Save Preferences"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === "privacy" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>

                                        <div className="space-y-4">
                                            {[
                                                { key: "publicProfile", label: "Public profile", desc: "Allow others to see your profile" },
                                                { key: "showFandomScore", label: "Show fandom score", desc: "Display your score on your profile" },
                                                { key: "showEventsAttended", label: "Show events attended", desc: "Display events you've been to" },
                                                { key: "showVouches", label: "Show vouches", desc: "Display vouch activity publicly" },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{item.label}</p>
                                                        <p className="text-sm text-muted">{item.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacy[item.key as keyof typeof privacy]}
                                                            onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>

                                        <div className="space-y-4">
                                            <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-background/80 transition-colors text-left">
                                                <div>
                                                    <p className="font-medium">Download your data</p>
                                                    <p className="text-sm text-muted">Get a copy of your FanFirst data</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted" />
                                            </button>
                                            <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-background/80 transition-colors text-left">
                                                <div>
                                                    <p className="font-medium">Privacy policy</p>
                                                    <p className="text-sm text-muted">Learn how we handle your data</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-border">
                                        <Button onClick={handleSave}>
                                            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : "Save Settings"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Connected Apps Tab */}
                            {activeTab === "connected" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Connected Apps</h2>
                                        <p className="text-muted mb-6">Connect your accounts to boost your fandom score</p>

                                        <div className="space-y-4">
                                            {/* Google (Auth0) */}
                                            {auth0User && (
                                                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-accent/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                                                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Google Account</p>
                                                            <p className="text-sm text-muted">Connected • {auth0User.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                                                        Active
                                                    </span>
                                                </div>
                                            )}

                                            {/* Spotify */}
                                            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-[#1DB954] flex items-center justify-center">
                                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Spotify</p>
                                                        <p className="text-sm text-muted">
                                                            {spotifyConnected ? "Connected • Earning fandom points" : "Connect to verify music preferences"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant={spotifyConnected ? "outline" : "secondary"}
                                                    size="sm"
                                                    onClick={() => setSpotifyConnected(!spotifyConnected)}
                                                >
                                                    {spotifyConnected ? "Disconnect" : "Connect"}
                                                </Button>
                                            </div>

                                            {/* Apple Music */}
                                            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#fc3c44] to-[#c21d25] flex items-center justify-center">
                                                        <Music className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Apple Music</p>
                                                        <p className="text-sm text-muted">Connect your Apple Music account</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">Connect</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Wallet Tab */}
                            {activeTab === "wallet" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Wallets</h2>
                                        <p className="text-muted mb-6">Manage your crypto wallets for NFT tickets and community features</p>

                                        {/* EVM Wallet */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold tracking-wider text-primary mb-3">ETHEREUM / EVM WALLET</h3>
                                            {isConnected && address ? (
                                                <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <Wallet className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Connected Wallet</p>
                                                                <p className="text-sm text-muted">{connector?.name || 'MetaMask'}</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                                                            Active
                                                        </span>
                                                    </div>
                                                    <div className="p-3 bg-card rounded-lg font-mono text-sm flex items-center justify-between">
                                                        <span>{address}</span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(address);
                                                                    setCopied(true);
                                                                    setTimeout(() => setCopied(false), 2000);
                                                                }}
                                                                className="p-2 hover:bg-background rounded transition-colors"
                                                                title="Copy address"
                                                            >
                                                                {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted" />}
                                                            </button>
                                                            <a
                                                                href={`https://polygonscan.com/address/${address}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 hover:bg-background rounded transition-colors"
                                                                title="View on explorer"
                                                            >
                                                                <ExternalLink className="w-4 h-4 text-muted" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-4">
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => disconnect()}
                                                        >
                                                            Disconnect
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-background rounded-xl border border-border">
                                                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-3">
                                                        <Wallet className="w-6 h-6 text-muted" />
                                                    </div>
                                                    <h4 className="font-semibold mb-1 text-sm">No EVM wallet connected</h4>
                                                    <p className="text-xs text-muted">For ticket purchases - Use the navbar to connect</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Solana Wallet */}
                                        <div>
                                            <h3 className="text-sm font-bold tracking-wider text-[#14F195] mb-3">SOLANA WALLET</h3>
                                            {solanaConnected && solanaAddress ? (
                                                <div className="p-6 bg-gradient-to-br from-[#14F195]/10 to-purple-500/10 rounded-xl border border-[#14F195]/20">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-[#14F195]/20 flex items-center justify-center">
                                                                <span className="text-lg">◎</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Connected Wallet</p>
                                                                <p className="text-sm text-muted">Phantom</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full bg-[#14F195]/20 text-[#14F195] text-sm font-medium">
                                                            Active
                                                        </span>
                                                    </div>
                                                    <div className="p-3 bg-card rounded-lg font-mono text-sm flex items-center justify-between">
                                                        <span>{solanaAddress}</span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(solanaAddress);
                                                                    setCopied(true);
                                                                    setTimeout(() => setCopied(false), 2000);
                                                                }}
                                                                className="p-2 hover:bg-background rounded transition-colors"
                                                                title="Copy address"
                                                            >
                                                                {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted" />}
                                                            </button>
                                                            <a
                                                                href={`https://explorer.solana.com/address/${solanaAddress}?cluster=devnet`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 hover:bg-background rounded transition-colors"
                                                                title="View on Solana Explorer"
                                                            >
                                                                <ExternalLink className="w-4 h-4 text-muted" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-4">
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => disconnectSolana()}
                                                        >
                                                            Disconnect
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-background rounded-xl border border-border">
                                                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-3">
                                                        <span className="text-2xl">◎</span>
                                                    </div>
                                                    <h4 className="font-semibold mb-1 text-sm">No Solana wallet connected</h4>
                                                    <p className="text-xs text-muted">For community features - Use the navbar to connect</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isConnected && (
                                        <div className="pt-6 border-t border-border">
                                            <h3 className="text-lg font-semibold mb-4">NFT Tickets Owned</h3>
                                            <p className="text-3xl font-bold text-primary">0</p>
                                            <p className="text-sm text-muted">No NFT tickets in this wallet yet</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Danger Zone */}
                        {activeTab === "profile" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mt-8 bg-card rounded-2xl border border-danger/30 p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-danger" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-danger mb-1">Danger Zone</h3>
                                        <p className="text-sm text-muted mb-4">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />}>
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
