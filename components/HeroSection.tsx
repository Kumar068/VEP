import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection: React.FC = () => {
   const containerRef = useRef<HTMLDivElement>(null);

  // We use useLayoutEffect to prevent a "flash" of unstyled content
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Target the text lines directly via class
      tl.fromTo(".hero-line",
        { y: "100%", opacity: 0, skewY: 7 }, // Start state
        { y: "0%", opacity: 1, skewY: 0, duration: 1.2, stagger: 0.15 } // End state
      )
      // 2. Subtext reveal
      .fromTo(".hero-subtext",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      )
      // 3. Video editing elements scroll animation
      .fromTo(".video-element",
        { y: 50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
        "-=0.4"
      )
      // 4. Stats grid scroll animation
      .fromTo(".stat-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05 },
        "-=0.3"
      )
      // 5. Timeline scroll animation
      .fromTo(".timeline-element",
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.2"
      )
      // 6. Scroll indicator
      .fromTo(".scroll-indicator",
        { height: 0, opacity: 0 },
        { height: "4rem", opacity: 0.5, duration: 1 },
        "-=0.4"
      );
    }, containerRef); // Scope the selector to this ref

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
   <div 
        ref={containerRef}
        className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4"
      >
        <div className="text-center">
          {/* Dynamic video editing elements */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="video-element relative">
              <div className="w-16 h-16 border-2 border-white/30 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl animate-pulse">▶</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white/40"></div>
            </div>
            
            <div className="video-element flex flex-col gap-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-white/40 text-xs font-mono">REC</div>
            </div>

            <div className="video-element relative">
              <div className="w-16 h-16 border-2 border-white/30 rounded-lg flex items-center justify-center">
                <div className="text-white text-xl">◉</div>
              </div>
              <div className="absolute inset-0 border-2 border-white/20 rounded-lg animate-ping"></div>
            </div>
          </div>

          <h1 className="hero-line text-6xl md:text-8xl font-bold text-white mb-8">
            Narrative Through <span className="italic">Rhythm</span>
          </h1>

          {/* Dynamic video editing metrics */}
          <p className="hero-subtext text-white/70 text-lg text-center mb-8">
            Transforming raw footage into <span className="text-white">visceral emotional experiences</span> through cinematic storytelling and expert post-production
          </p>

          {/* Live editing stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">24fps</div>
              <div className="text-white/40 text-xs">Frame Rate</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">4K</div>
              <div className="text-white/40 text-xs">Resolution</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">60min</div>
              <div className="text-white/40 text-xs">Avg. Project</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">∞</div>
              <div className="text-white/40 text-xs">Creativity</div>
            </div>
          </div>

          {/* Animated timeline element */}
          <div className="timeline-element mt-8 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-white/60 to-transparent"></div>
              <span className="font-mono">00:00:00:00</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 text-center">
          <span className="scroll-indicator text-white/40 text-sm animate-pulse">
            Scroll to explore
          </span>
        </div>
      </div>
  );
};

export default HeroSection;