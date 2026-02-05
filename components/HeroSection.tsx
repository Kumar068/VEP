import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

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
        // 6. Video player reveal
        .fromTo(".hero-video",
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.0 },
          "-=0.1"
        )
        // 7. Text reveal animations
        .fromTo(".text-reveal-line",
          { x: (index) => index % 2 === 0 ? -100 : 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.2"
        );
    }, containerRef); // Scope the selector to this ref

    // Scroll effect for cinematic video sticky behavior and text reveal
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Video Animation
      if (videoRef.current) {
        // Subtle scaling for depth - Capped at 1.1x
        const scale = Math.min(1 + (scrollY * 0.0005), 1.1);

        // "Sticky" effect: Move down with scroll - Capped at 150px
        const translateY = Math.min(scrollY * 0.5, 450);

        videoRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      }

      // Text Reveal Animation
      if (textRef.current) {
        // Text reveals as video moves down
        // Starts revealing immediately, fully visible by 300px
        const textProgress = Math.min(scrollY / 300, 1);

        textRef.current.style.opacity = textProgress.toString();
        // Text slides in slightly from TOP
        // Start at -50px (higher), end at 0 (original position)
        const textTranslateY = -50 + (textProgress * 50);
        textRef.current.style.transform = `translate3d(0, ${textTranslateY}px, 0)`;
      }

      // Autoplay video logic (kept similar but tuned)
      if (videoPlayerRef.current) {
        if (scrollY > 50 && videoPlayerRef.current.paused) {
          videoPlayerRef.current.play().catch(console.error);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 bg-transparent pt-60"
    >
      <div className="text-center mb-12">
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

      {/* Main Hero Layout - Stacked for Reveal Effect */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-start pt-20">

        {/* 1. Text Layer - Positioned Absolute/Behind or Top Flow */}
        {/* We place it conceptually "above" the video, but it needs to trigger effectively */}
        {/* Actually, putting it strictly above in flow works if we position the video correctly. */}
        {/* Based on request: "empty space opens above the video... text reveals into that space" */}

        <div
          ref={textRef}
          className="absolute top-0 w-full text-center z-0 pt-32 opacity-0 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight leading-[1.1] mb-6 font-display">
              <span className="block mb-2">Crafting visual stories</span>
              <span className="block">that resonate deeply and leave a lasting emotional impact.</span>
            </h2>
          </div>
        </div>

        {/* 2. Video Player - The "First" Element Conceptually */}
        <div
          ref={videoRef}
          className="relative z-10 w-full h-[50vh] md:h-auto md:max-w-6xl md:aspect-video bg-black/80 rounded-xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5"
        >
          {/* Professional UI Overlays */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Corners */}
            <div className="absolute top-6 left-6 w-4 h-4 border-l-2 border-t-2 border-blue-500/80"></div>
            <div className="absolute top-6 right-6 w-4 h-4 border-r-2 border-t-2 border-blue-500/80"></div>
            <div className="absolute bottom-6 left-6 w-4 h-4 border-l-2 border-b-2 border-blue-500/80"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-blue-500/80"></div>

            {/* UI Markers */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            </div>

            {/* Safe Area Guides (Cinematic) */}
            <div className="absolute inset-12 border border-white/5 opacity-50"></div>
          </div>

          <video
            ref={videoPlayerRef}
            className="w-full h-full object-cover opacity-90"
            muted
            loop
            playsInline
            poster="/video/poster.jpg" // Added simple placeholder or existing SVG
          >
            <source src="/video/showreel.mp4" type="video/mp4" />
            <source src="/video/showreel.webm" type="video/webm" />
          </video>

          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60 pointer-events-none"></div>
        </div>
      </div>

      {/* Add proper spacing before ShowreelPage */}
      <div className="h-[50vh]"></div>
    </div>
  );
};

export default HeroSection;
