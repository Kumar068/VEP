import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ReelsSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    // Replicate the video to create a seamless loop
    const videos = new Array(8).fill("/content/background.mp4");

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (!sliderRef.current || !containerRef.current) return;

            const slider = sliderRef.current;

            // Basic horizontal marquee
            tweenRef.current = gsap.to(slider, {
                xPercent: -50,
                ease: "none",
                duration: 20, // Adjust speed here
                repeat: -1,
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        // Pause the marquee
        tweenRef.current?.pause();

        // Scale up the hovered target
        gsap.to(e.currentTarget, {
            scale: 1.3,
            zIndex: 50,
            duration: 0.4,
            ease: "power3.out",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        });

        // Dim siblings
        gsap.to(sliderRef.current?.children || [], {
            opacity: 0.5,
            duration: 0.4,
            overwrite: "auto"
        });
        gsap.to(e.currentTarget, {
            opacity: 1,
            duration: 0.4,
            overwrite: "auto"
        });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        // Resume the marquee
        tweenRef.current?.play();

        // Reset the hovered target
        gsap.to(e.currentTarget, {
            scale: 1,
            zIndex: 1,
            duration: 0.4,
            ease: "power3.out",
            boxShadow: "none"
        });

        // Reset siblings opacity
        gsap.to(sliderRef.current?.children || [], {
            opacity: 1,
            duration: 0.4,
        });
    };

    return (
        <div ref={containerRef} className="relative py-20 bg-background-dark overflow-hidden z-10">

            {/* Header */}
            <div className="container mx-auto px-8 mb-12">
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
                    LATEST <span className="text-zinc-500">CLIPS</span>
                </h2>
            </div>

            {/* Marquee Container */}
            {/* We render the list TWICE to create the seamless loop effect for the animation */}
            {/* w-max ensures the container takes full width of children, enabling horizontal layout */}
            <div className="flex w-max" ref={sliderRef}>
                {[...videos, ...videos].map((src, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 relative w-[280px] md:w-[350px] aspect-[9/16] mx-4 rounded-xl overflow-hidden border border-white/10 group cursor-pointer transition-transform"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Video */}
                        <video
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                            src={src}
                            autoPlay
                            muted
                            loop
                            playsInline
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                <span className="text-xs font-bold tracking-widest text-white/80 uppercase">Reel {index % videos.length + 1}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white leading-tight">cinematic_shot_{index % videos.length + 1}.mp4</h3>
                        </div>

                        {/* Play Icon on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReelsSection;
