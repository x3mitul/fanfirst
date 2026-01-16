"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Music,
  Disc,
  QrCode,
} from "lucide-react";
import { EventCard } from "@/components/events";
import { Button } from "@/components/ui";
import { RestrictedCursorTrail, ScatteredArtistNames } from "@/components/effects";
import { BentoFeatures } from "@/components/sections";
import { mockEvents, categories } from "@/lib/mock-data";
import { useFadeInStagger, useScrollScrub, useZoomOnScroll, useZoomInOut } from "@/hooks";

// Duplicate for marquee effect
const stats = [
  "NO BOTS ALLOWED",
  "•",
  "FAIR PRICING",
  "•",
  "NFT PROOF",
  "•",
  "INSTANT TRANSFER",
  "•",
  "REAL FANS ONLY",
  "•",
  "NO BOTS ALLOWED",
  "•",
  "FAIR PRICING",
  "•",
  "NFT PROOF",
  "•",
  "INSTANT TRANSFER",
  "•",
  "REAL FANS ONLY",
];

const features = [
  {
    icon: Shield,
    title: "ANTI-BOT",
    description: "AI behavioral analysis blocks 99.9% of automated scripts instantly.",
  },
  {
    icon: Music,
    title: "SPOTIFY SYNC",
    description: "Proof of fandom. Connect your library to unlock priority access.",
  },
  {
    icon: Disc,
    title: "COMMUNITY",
    description: "Vouch for friends. Build your reputation score to earn trust.",
  },
  {
    icon: QrCode,
    title: "NFT TIX",
    description: "Dynamic rotating QR codes on Polygon. Uncopiable. Secure.",
  },
];

export default function HomePage() {
  const featuredEvents = mockEvents.filter((e) => e.status !== "past").slice(0, 3);
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  // GSAP Refs
  const heroRef = useRef<HTMLElement>(null);
  const eventsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const eventsTitleRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useScrollScrub(
    heroRef,
    { opacity: 1, scale: 1, y: 0 },
    { opacity: 0, scale: 0.95, y: -100 },
    "top top",
    "bottom top"
  );

  useFadeInStagger(eventsRef, ".event-card", 0.15);
  useFadeInStagger(featuresRef, ".feature-item", 0.2);
  useFadeInStagger(categoriesRef, ".category-item", 0.1);
  useScrollScrub(
    heroVisualRef,
    { scale: 0.8, opacity: 0, rotation: -10 },
    { scale: 1, opacity: 1, rotation: 0 },
    "top center",
    "center center"
  );

  // Zoom effects
  useZoomOnScroll(marqueeRef, 0.95, 1.05);
  useZoomInOut(eventsTitleRef, 1.2);

  return (
    <>
      <RestrictedCursorTrail />

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-black">
        {/* Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 border-b border-border pt-20"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] pointer-events-none" />

          <div className="max-w-8xl mx-auto w-full z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
              >
                <div className="w-2 h-2 bg-primary animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary">System Online v2.4</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="font-black text-7xl sm:text-8xl lg:text-[10rem] leading-[0.85] tracking-tighter mb-8 uppercase"
              >
                Fan
                <span className="text-stroke block text-transparent">First</span>
                <span className="text-primary block">Tickets</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl text-muted-foreground max-w-xl mb-12 font-light border-l-2 border-primary pl-6"
              >
                The algorithmic ticketing protocol. <span className="text-white font-medium">Zero bots. Zero scalping.</span> Pure access for genuine fans.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/events">
                  <Button size="lg" className="w-full sm:w-auto" icon={<ArrowRight />}>
                    Enter Arena
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Protocol Logic
                  </Button>
                </Link>
              </motion.div>
            </div>

            <div
              ref={heroVisualRef}
              className="hidden lg:block relative h-[600px] w-full"
            >
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary mix-blend-overlay blur-[100px] animate-pulse" />
              <div className="absolute inset-20 border-2 border-primary/50 flex items-center justify-center">
                <div className="text-9xl font-black text-white/5 rotate-90 whitespace-nowrap tracking-widest">
                  NO SCALPERS
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="border-b border-border bg-primary text-black overflow-hidden py-4">
          <motion.div
            style={{ x }}
            className="flex whitespace-nowrap gap-8 text-4xl font-black uppercase tracking-tight"
          >
            {[...stats, ...stats].map((item, i) => (
              <span key={i} className="flex items-center gap-4">
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <ScatteredArtistNames />
        <BentoFeatures />

        {/* Events Grid */}
        <section ref={eventsRef} className="py-32 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div ref={eventsTitleRef}>
              <h2 className="text-6xl font-black uppercase mb-4 text-center">Live Now</h2>
              <div className="h-1 w-32 bg-primary" />
            </div>
            <Link href="/events" className="text-xl hover:text-primary transition-colors uppercase font-bold flex items-center gap-2">
              View All Events <ArrowRight className="w-6 h-6" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event, index) => (
              <div key={event.id} className="event-card">
                <EventCard event={event} index={index} />
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section ref={featuresRef} className="border-y border-border bg-white/5 backdrop-blur-3xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {features.map((feature, index) => (
              <div key={index} className="feature-item p-12 hover:bg-white/5 transition-colors group opacity-0">
                <feature.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-black uppercase mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section - Rotating 3D Carousel */}
        <section ref={categoriesRef} className="py-32 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto overflow-hidden">
          <h2 className="text-6xl font-black uppercase mb-8 text-center">
            Discover<br /><span className="text-primary">Experience</span>
          </h2>

          <div className="relative h-[400px] w-full flex items-center justify-center perspective-[20000px]">
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                animation: 'rotateCarousel 40s linear infinite'
              }}
            >
              {categories.map((category, index) => {
                const angle = (index / categories.length) * 360;
                return (
                  <Link
                    key={category.id}
                    href={`/events?category=${category.id}`}
                    className="category-item absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] aspect-square border border-white/10 flex flex-col items-center justify-center hover:text-black transition-all duration-500 group overflow-hidden opacity-0"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(400px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${category.image})` }}
                    />
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-primary/80 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                    <span className="text-5xl mb-6 z-10 group-hover:scale-125 transition-transform duration-500">{category.icon}</span>
                    <span className="text-xl font-bold uppercase tracking-[0.2em] z-10">{category.name}</span>
                    <span className="text-sm opacity-50 mt-3 z-10 group-hover:opacity-100 transition-opacity font-mono">{category.count} Shows</span>

                    <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-500 z-20" />
                  </Link>
                );
              })}
            </div>
          </div>

          <style jsx>{`
            @keyframes rotateCarousel {
              from { transform: rotateY(0deg); }
              to { transform: rotateY(360deg); }
            }
            .perspective-\[2000px\] {
              perspective: 2000px;
            }
            div[style*="preserve-3d"]:hover {
              animation-play-state: paused;
            }
          `}</style>
        </section>
      </div>
    </>
  );
}
