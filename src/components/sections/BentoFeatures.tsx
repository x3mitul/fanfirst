"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Ticket, Shield, Music, Star, Zap, Users } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        title: "Buy & Sell Tickets",
        subtitle: "Instantly",
        description: "No fees, no bots, just real fans getting real tickets.",
        color: "bg-gradient-to-br from-purple-600 to-purple-800",
        image: "/trail-images/image1.avif",
        icon: Ticket,
        size: "large",
        href: "/events",
    },
    {
        title: "Verified Fans",
        subtitle: "Only",
        description: "Our protocol ensures only genuine fans get access.",
        color: "bg-gradient-to-br from-emerald-700 to-emerald-900",
        image: "/trail-images/image2.jpg",
        icon: Shield,
        size: "medium",
        href: "/how-it-works",
    },
    {
        title: "All Your Events",
        subtitle: "One Place",
        description: "Track upcoming shows, past memories, and wishlist.",
        color: "bg-gradient-to-br from-blue-700 to-blue-900",
        image: "/trail-images/image3.jpg",
        icon: Music,
        size: "medium",
        href: "/dashboard/tickets",
    },
    {
        title: "Earn Rewards",
        subtitle: "Every Event",
        description: "Loyalty points, exclusive merch, and VIP upgrades.",
        color: "bg-gradient-to-br from-orange-400 to-orange-600",
        image: "/trail-images/image4.jpg",
        icon: Star,
        size: "large",
        href: "/community",
    },
    {
        title: "Instant Transfer",
        subtitle: "Zero Limits",
        description: "Send tickets to friends in seconds.",
        color: "bg-gradient-to-br from-pink-500 to-rose-600",
        image: "/trail-images/image5.jpg",
        icon: Zap,
        size: "small",
        href: "/dashboard",
    },
    {
        title: "Join the Community",
        subtitle: "Connect",
        description: "Meet fellow fans, share experiences.",
        color: "bg-gradient-to-br from-cyan-500 to-teal-600",
        image: "/trail-images/image6.jpg",
        icon: Users,
        size: "small",
        href: "/community",
    },
];

export function BentoFeatures() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLAnchorElement[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Split screen reveal animation on scroll
        const cards = cardsRef.current.filter(Boolean);

        cards.forEach((card, index) => {
            const isLeft = index % 2 === 0;

            gsap.fromTo(
                card,
                {
                    x: isLeft ? -100 : 100,
                    opacity: 0,
                    scale: 0.9,
                },
                {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        end: "top 50%",
                        scrub: 1,
                    },
                }
            );
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section ref={containerRef} className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-black to-zinc-950">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto mb-20 text-center">
                <h2 className="text-6xl font-black uppercase mb-4">
                    <span className="text-white">The </span>
                    <span className="text-primary">Complete</span>
                    <span className="text-white"> Experience</span>
                </h2>
                <p className="text-xl text-white/60 max-w-2xl mx-auto">
                    Everything you need for the ultimate fan experience, all in one platform.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const sizeClasses = {
                        large: "col-span-2 row-span-2",
                        medium: "col-span-2 row-span-1",
                        small: "col-span-1 row-span-1",
                    };

                    return (
                        <Link
                            key={feature.title}
                            href={feature.href}
                            ref={(el) => { if (el) cardsRef.current[index] = el; }}
                            className={`
                                ${sizeClasses[feature.size as keyof typeof sizeClasses]}
                                ${feature.color}
                                relative rounded-3xl p-8 overflow-hidden cursor-pointer
                                group transition-all duration-500 ease-out
                                hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10
                                hover:z-10 block
                            `}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                <img
                                    src={feature.image}
                                    alt=""
                                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>

                            {/* Animated background glow on hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1] pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                }}
                            />

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
                                <div>
                                    <Icon className="w-10 h-10 text-white/80 mb-4 group-hover:scale-110 group-hover:text-white transition-all duration-300" />
                                    <h3 className="text-3xl font-black text-white mb-1 group-hover:translate-y-[-4px] transition-transform duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xl font-bold text-white/70 group-hover:text-white transition-colors duration-300">
                                        {feature.subtitle}
                                    </p>
                                </div>

                                <p className="text-white/60 mt-4 group-hover:text-white/80 transition-colors duration-300 max-w-xs">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Hover border effect */}
                            <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none" />

                            {/* Corner accent */}
                            <div
                                className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-20 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle at top right, white 0%, transparent 70%)',
                                }}
                            />
                        </Link>
                    );
                })}
            </div>

            {/* Center Logo/Text */}
        </section>
    );
}
