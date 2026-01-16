"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Sparkles,
  Users,
  Zap,
  QrCode,
  DollarSign,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui";

const steps = [
  {
    icon: Sparkles,
    title: "Build Your Fandom Profile",
    description:
      "Connect your Spotify account to prove you're a real fan. The more you listen, the higher your Fandom Score. Past event attendance also counts!",
    details: [
      "Spotify listening history analysis",
      "Past event attendance tracking",
      "Community vouching system",
      "Account age verification",
    ],
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&h=600&fit=crop",
  },
  {
    icon: Shield,
    title: "Invisible Bot Protection",
    description:
      "When you browse and purchase tickets, our AI silently analyzes behavioral patterns. No CAPTCHAs, no annoying puzzles—just smooth ticket buying.",
    details: [
      "Mouse movement analysis",
      "Typing pattern recognition",
      "Click timing verification",
      "Session behavior scoring",
    ],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=600&fit=crop",
  },
  {
    icon: Users,
    title: "Community Staking",
    description:
      "Vouch for friends you trust. When you stake your reputation on someone, you're helping build a network of verified fans. Abuse risks stake loss.",
    details: [
      "Vouch for up to 5 friends",
      "Stake tokens during events",
      "Build social reputation",
      "Community-driven trust",
    ],
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=600&fit=crop",
  },
  {
    icon: Zap,
    title: "NFT Ticket Minting",
    description:
      "Your ticket is minted as an NFT on Polygon. Don't worry—we handle all the crypto complexity. You just see a ticket in your dashboard.",
    details: [
      "Polygon blockchain (fast & cheap)",
      "No wallet setup required",
      "Automatic wallet creation",
      "Full ownership verification",
    ],
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=600&fit=crop",
  },
  {
    icon: QrCode,
    title: "Dynamic QR Entry",
    description:
      "Your ticket QR code refreshes every 30 seconds. Screenshots won't work at the venue. Only the real ticket holder can enter.",
    details: [
      "30-second refresh cycle",
      "Cryptographic verification",
      "Screenshot prevention",
      "Real-time validation",
    ],
    image: "https://images.unsplash.com/photo-1617802696405-1eb5e8c0e3e5?w=600&h=600&fit=crop",
  },
  {
    icon: DollarSign,
    title: "Fair Resale Market",
    description:
      "Need to sell? List your ticket within price caps set by the organizer. Artists automatically receive royalties on every resale.",
    details: [
      "Organizer-set price caps",
      "Automatic artist royalties",
      "Transparent pricing",
      "Instant secure transfer",
    ],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop",
  },
];

const faqs = [
  {
    question: "Do I need crypto knowledge to use FanFirst?",
    answer:
      "No! We've designed FanFirst to be completely crypto-invisible. You sign up with email, pay with regular payment methods, and see tickets in your dashboard. We handle all the blockchain stuff behind the scenes.",
  },
  {
    question: "How does the Fandom Score work?",
    answer:
      "Your Fandom Score is calculated from multiple inputs: Spotify listening history (how much you listen to the artist), past event attendance, account age, and community vouches. Higher scores get earlier access to ticket drops.",
  },
  {
    question: "What happens if I need to resell my ticket?",
    answer:
      "If resale is enabled for the event, you can list your ticket on our marketplace. Prices are capped by the organizer (usually 100-150% of original price), and artists receive automatic royalties (typically 5-15%).",
  },
  {
    question: "Why do QR codes refresh every 30 seconds?",
    answer:
      "This prevents ticket fraud through screenshots. Even if someone shares a picture of their QR code, it will be invalid by the time someone tries to use it. Only the actual ticket holder with the live app can enter.",
  },
  {
    question: "What is community staking?",
    answer:
      "You can vouch for friends by staking a small amount. If your vouched friends behave well, you both build reputation. If they abuse the system (scalping, fraud), you may lose your stake. This creates social accountability.",
  },
];

export default function HowItWorksPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total slides: 6 steps + 1 comparison = 7 slides (FAQs and CTA are now vertical)
  const totalSlides = steps.length + 1;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const windowHeight = window.innerHeight;

      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (containerHeight - windowHeight)));
      const slideIndex = Math.min(
        totalSlides - 1,
        Math.floor(scrollProgress * totalSlides)
      );

      setCurrentSlide(slideIndex);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalSlides]);

  return (
    <div className="min-h-screen pt-20 bg-black">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-[#ccff00]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-[#ccff00]/10 text-[#ccff00] text-sm font-medium mb-6">
              The Future of Ticketing
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white uppercase">
              How FanFirst Works
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              We&apos;ve rebuilt ticketing from the ground up to prioritize real fans,
              eliminate bots, and ensure fair access for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Horizontal Scroll Section (Steps + Comparison) */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${totalSlides * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-black">
          <div className="w-full">
            {/* Progress Indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide
                      ? "w-12 bg-[#ccff00]"
                      : "w-6 bg-zinc-700"
                    }`}
                />
              ))}
            </div>

            {/* Horizontal Slides Container */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentSlide * 100}vw)`,
                width: `${totalSlides * 100}vw`
              }}
            >
              {/* Steps Slides (6 slides) */}
              {steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  className="flex-shrink-0 w-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center"
                >
                  <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ccff00] to-[#dfff00] flex items-center justify-center">
                          <step.icon className="w-8 h-8 text-black" />
                        </div>
                        <span className="text-sm font-bold text-[#ccff00] uppercase tracking-wider">
                          Step {index + 1}
                        </span>
                      </div>

                      <h2 className="text-3xl lg:text-5xl font-black mb-6 text-white uppercase">
                        {step.title}
                      </h2>

                      <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                        {step.description}
                      </p>

                      <ul className="space-y-4">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-[#ccff00] flex-shrink-0" />
                            <span className="text-zinc-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual */}
                    <div className="flex-1 w-full max-w-md lg:max-w-xl">
                      <div className="relative aspect-square rounded-3xl border-4 border-[#ccff00]/20 overflow-hidden">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        {/* Icon Badge */}
                        <div className="absolute bottom-6 left-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ccff00] to-[#dfff00] flex items-center justify-center shadow-2xl">
                          <step.icon className="w-10 h-10 text-black" />
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-[#ccff00]" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-[#ccff00]" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-[#ccff00]" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-[#ccff00]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Comparison Slide */}
              <div className="flex-shrink-0 w-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-7xl w-full">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-white uppercase">
                      FanFirst vs Traditional Ticketing
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                      See why fans and artists are switching to fair ticketing
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Traditional */}
                    <div className="p-8 rounded-2xl bg-zinc-900 border-4 border-zinc-700">
                      <h3 className="text-2xl font-bold mb-6 text-zinc-500 uppercase">Traditional Ticketing</h3>
                      <ul className="space-y-4">
                        {[
                          "Bots buy thousands of tickets instantly",
                          "Scalpers resell at 500%+ markup",
                          "Real fans can't get tickets at face value",
                          "Artists earn $0 from resales",
                          "Fake tickets & fraud common",
                          "CAPTCHAs slow down checkout",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-3 text-zinc-400 text-lg">
                            <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0 font-bold">
                              ✕
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* FanFirst */}
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-[#ccff00]/10 to-[#dfff00]/5 border-4 border-[#ccff00]">
                      <h3 className="text-2xl font-bold mb-6 text-[#ccff00] uppercase">FanFirst Platform</h3>
                      <ul className="space-y-4">
                        {[
                          "AI blocks 99%+ of bot purchases",
                          "Price caps prevent scalping abuse",
                          "Real fans get priority access",
                          "Artists earn royalties on resales",
                          "NFT tickets = guaranteed authentic",
                          "Invisible verification = smooth UX",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-3 text-white text-lg">
                            <span className="w-6 h-6 rounded-full bg-[#ccff00]/20 text-[#ccff00] flex items-center justify-center flex-shrink-0 font-bold">
                              ✓
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Hint */}
            <div className="text-center mt-8">
              <p className="text-zinc-500 text-sm">
                Scroll to explore • {currentSlide + 1} of {totalSlides}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs - Vertical Section */}
      <section className="py-16 lg:py-24 bg-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-white uppercase">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-zinc-900 rounded-xl border-2 border-zinc-800 overflow-hidden hover:border-[#ccff00]/30 transition-colors"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-zinc-800 transition-colors">
                  <span className="font-semibold pr-4 text-white text-lg">{faq.question}</span>
                  <span className="text-[#ccff00] group-open:rotate-180 transition-transform text-xl">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 text-zinc-400 text-lg leading-relaxed">
                  {faq.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Vertical Section */}
      <section className="py-16 lg:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ccff00] to-[#dfff00] p-12 lg:p-20 text-center"
          >
            <div className="relative">
              <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-black uppercase">
                Ready to Experience Fair Ticketing?
              </h2>
              <p className="text-xl text-black/80 max-w-2xl mx-auto mb-10">
                Join thousands of fans who are already getting tickets fairly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-black text-[#ccff00] hover:bg-zinc-900 border-4 border-black font-black text-lg px-8 py-6"
                    icon={<ArrowRight className="w-6 h-6" />}
                    iconPosition="right"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/events">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-4 border-black text-black hover:bg-black/10 font-black text-lg px-8 py-6"
                  >
                    Browse Events
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
