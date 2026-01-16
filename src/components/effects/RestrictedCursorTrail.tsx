"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface RestrictedCursorTrailProps {
    enabled?: boolean;
}

// Your trail images from public/trail-images
const TRAIL_IMAGES = [
    "/trail-images/image1.avif",
    "/trail-images/image2.jpg",
    "/trail-images/image3.jpg",
    "/trail-images/image4.jpg",
    "/trail-images/image5.jpg",
    "/trail-images/image6.jpg",
    "/trail-images/image7.webp",
    "/trail-images/image8.jpg",
    "/trail-images/image9.jpg",
    "/trail-images/image10.jpg",
    "/trail-images/image11.jpg",
    "/trail-images/image12.jpg",
    "/trail-images/image13.jpg",
    "/trail-images/image14.jpg",
    "/trail-images/image15.jpg",
    "/trail-images/image16.jpg",
    "/trail-images/image17.jpg",
    "/trail-images/image18.jpg",
    "/trail-images/image19.jpg",
    "/trail-images/image20.jpg",
];

export function RestrictedCursorTrail({ enabled = true }: RestrictedCursorTrailProps) {
    const globalCursorRef = useRef<HTMLDivElement>(null);
    const restrictedAreaRef = useRef<HTMLDivElement>(null);
    const introTextRef = useRef<HTMLDivElement>(null);
    const introOverlayRef = useRef<HTMLDivElement>(null);
    const collageRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [introComplete, setIntroComplete] = useState(false);
    const [timerCount, setTimerCount] = useState(0);
    const [showTimer, setShowTimer] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // New Intro sequence logic: Collage -> Video/Timer -> Collage
    useEffect(() => {
        if (!mounted || !enabled) return;

        const timeline = gsap.timeline();

        // 1. Collage Appearance (Fast)
        timeline.set(".collage-container", { opacity: 1, visibility: 'visible' });
        const collageItems = document.querySelectorAll('.collage-item');
        if (collageItems.length > 0) {
            timeline.fromTo(collageItems,
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, stagger: 0.01, ease: "back.out(1.7)" }
            );
        }

        // 2. Video Fade-In
        timeline.to({}, { duration: 0.3 });
        timeline.add(() => setShowVideo(true));
        // Add delay to let React render the element before animating
        timeline.to({}, { duration: 0.1 });
        timeline.add(() => {
            const overlay = document.querySelector(".intro-video-overlay");
            if (overlay) {
                gsap.fromTo(overlay,
                    { opacity: 0 },
                    { opacity: 1, duration: 1, ease: "power2.inOut" }
                );
            }
        });

        // 3. Clock Timer and Video Play
        timeline.add(() => {
            setShowTimer(true);
            let count = 0;
            const interval = setInterval(() => {
                count += 1;
                if (count >= 100) {
                    count = 100;
                    setTimerCount(count);
                    clearInterval(interval);

                    // 4. Video Fade-Out to reveal collage again
                    setTimeout(() => {
                        const targets = [".intro-video-overlay", ".clock-timer-container"]
                            .map(sel => document.querySelector(sel))
                            .filter(Boolean);
                        if (targets.length > 0) {
                            gsap.to(targets, {
                                opacity: 0,
                                duration: 0.8,
                                ease: "power2.inOut",
                                onComplete: () => {
                                    setShowVideo(false);
                                    setShowTimer(false);
                                    setIntroComplete(true);
                                    if (introOverlayRef.current) {
                                        gsap.to(introOverlayRef.current, {
                                            opacity: 0,
                                            duration: 0.5,
                                            onComplete: () => setShowIntro(false)
                                        });
                                    } else {
                                        setShowIntro(false);
                                    }
                                }
                            });
                        } else {
                            setShowVideo(false);
                            setShowTimer(false);
                            setIntroComplete(true);
                            setShowIntro(false);
                        }
                    }, 500);
                } else {
                    setTimerCount(count);
                }
            }, 30);
        });

    }, [mounted, enabled]);

    // Scroll-based dissolve effect
    useEffect(() => {
        if (!enabled || !mounted || !introComplete) return;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const dissolveStart = 100;
            const dissolveEnd = 600;

            const progress = Math.min(Math.max((scrollY - dissolveStart) / (dissolveEnd - dissolveStart), 0), 1);
            setScrollProgress(progress);

            if (collageRef.current) {
                gsap.to(collageRef.current, {
                    opacity: 1 - progress,
                    scale: 1 - (progress * 0.3),
                    y: -(progress * 100),
                    duration: 0.1,
                    ease: "none"
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [enabled, mounted, introComplete]);

    if (!enabled || !mounted) return null;

    return (
        <>
            {/* Enlarged cursor style */}
            <style jsx global>{`
        * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2 L2 28 L12 18 L18 28 L22 26 L16 16 L28 16 Z" fill="white" stroke="black" stroke-width="1"/></svg>') 2 2, auto !important;
        }
        
        a, button, [role="button"] {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M6 6 L6 20 L12 14 L16 22 L20 20 L16 12 L24 12 Z" fill="white" stroke="black" stroke-width="1.5"/></svg>') 6 6, pointer !important;
        }
      `}</style>

            {/* Intro Overlay */}
            {showIntro && (
                <div
                    ref={introOverlayRef}
                    className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden"
                >
                    {showVideo && (
                        <div className="intro-video-overlay absolute inset-0 bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                                style={{ filter: 'brightness(0.6) contrast(1.2)' }}
                            >
                                <source src="/trail-images/Song_Listening_To_Artist_Collage.mp4" type="video/mp4" />
                            </video>
                        </div>
                    )}

                    {showTimer && (
                        <div className="clock-timer-container relative z-20 flex flex-col items-center justify-center">
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="80" fill="transparent" stroke="rgba(204, 255, 0, 0.1)" strokeWidth="8" />
                                    <circle
                                        cx="96" cy="96" r="80"
                                        fill="transparent"
                                        stroke="#CCFF00"
                                        strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 80}
                                        strokeDashoffset={2 * Math.PI * 80 * (1 - timerCount / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-75 ease-linear"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-primary font-black text-4xl tracking-tighter">{timerCount}%</span>
                                </div>
                            </div>
                            <div className="mt-8 text-primary/60 font-bold uppercase tracking-[0.5em] text-sm animate-pulse">
                                Loading Experience
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="fixed inset-0 z-10">
                {(introComplete || showIntro) && (
                    <div
                        ref={collageRef}
                        className="collage-container fixed right-8 top-0"
                        style={{
                            width: '60%',
                            height: '100vh',
                            opacity: 0,
                            paddingTop: '96px', // Space for navbar (24 * 4px = 96px)
                        }}
                    >
                        {/* Grid of images with Focus Zoom Effect */}
                        <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-1" style={{ paddingTop: '96px' }}>
                            {TRAIL_IMAGES.map((imageSrc, index) => {
                                const isHovered = hoveredImageIndex === index;
                                const isOtherHovered = hoveredImageIndex !== null && hoveredImageIndex !== index;

                                return (
                                    <div
                                        key={index}
                                        className="collage-item relative cursor-pointer aspect-square"
                                        onMouseEnter={() => setHoveredImageIndex(index)}
                                        onMouseLeave={() => setHoveredImageIndex(null)}
                                        style={{
                                            transition: 'transform 0.4s ease-out, opacity 0.4s ease-out, box-shadow 0.4s ease-out',
                                            transform: isHovered ? 'scale(1.8)' : isOtherHovered ? 'scale(0.85)' : 'scale(1)',
                                            opacity: isOtherHovered ? 0.6 : 1,
                                            zIndex: isHovered ? 100 : 1,
                                            pointerEvents: 'auto',
                                            boxShadow: isHovered
                                                ? '0 0 60px rgba(204, 255, 0, 0.9), 0 0 100px rgba(204, 255, 0, 0.7), 0 0 140px rgba(204, 255, 0, 0.5)'
                                                : '0 0 20px rgba(204, 255, 0, 0.2)',
                                        }}
                                    >
                                        <div className="w-full h-full overflow-hidden relative">
                                            <img
                                                src={imageSrc}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div
                ref={restrictedAreaRef}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{
                    width: '60%',
                    height: '50%',
                }}
            />
        </>
    );
}
