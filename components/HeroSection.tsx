import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // We use useGSAP to handle GSAP context and animations safely in React
  useGSAP(() => {
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
        "-=0.5"
      );

    gsap.to(videoRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "1000px top",
        scrub: true,
      },
      scale: 1.1,
      y: 800, // Move more significantly to open up space
      ease: "none"
    });

    gsap.to(textRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "1000px top",
        scrub: true,
      },
      opacity: 1,
      y: 400, // Counter-scroll to keep it centered in the screen longer
      ease: "none"
    });

    // Autoplay video on scroll start
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "100px top",
      onEnter: () => {
        videoPlayerRef.current?.play().catch(console.error);
      }
    });

  }, { scope: containerRef });

  return (
    <div
      id="work"
      ref={containerRef}
      className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 bg-transparent pt-40"
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
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
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

        <h1 className="hero-line flex flex-col items-center text-center mb-8">
          <span className="relative text-[5rem] md:text-[7rem] lg:text-[7.5rem] font-black text-[#e8e6e1] leading-[0.85] font-display uppercase tracking-tighter">
            NARRATIVE THROUGH
            {/* Small cyan dot detail on the A */}
          </span>
          <span className="text-[5.5rem] md:text-[8rem] lg:text-[10rem] font-serif italic leading-[0.8] tracking-tight mt-2 text-transparent" style={{ WebkitTextStroke: '2px #e8e6e1' }}>
            Rhythm.
          </span>
        </h1>

        {/* Dynamic video editing metrics */}
        <p className="hero-subtext text-white/50 text-xs md:text-sm text-center mb-16 max-w-lg mx-auto leading-relaxed font-sans">
          Transforming raw footage into visceral emotional experiences through<br />cinematic storytelling and expert post-production.
        </p>

        {/* Live editing stats */}
        <div className="grid grid-cols-4 gap-4 md:gap-12 max-w-3xl mx-auto w-full mb-16">
          <div className="stat-item text-center">
            <div className="text-[#e8e6e1] text-2xl md:text-4xl font-black mb-3 font-display">24FPS</div>
            <div className="text-white/40 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Frame Rate</div>
          </div>
          <div className="stat-item text-center">
            <div className="text-[#e8e6e1] text-2xl md:text-4xl font-black mb-3 font-display">4K</div>
            <div className="text-white/40 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Resolution</div>
          </div>
          <div className="stat-item text-center">
            <div className="text-[#e8e6e1] text-2xl md:text-4xl font-black mb-3 font-display">60+</div>
            <div className="text-white/40 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Projects</div>
          </div>
          <div className="stat-item text-center flex flex-col items-center">
            <div className="text-[#e8e6e1] text-2xl md:text-4xl font-black mb-3 font-display">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10 mx-auto"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" /></svg>
            </div>
            <div className="text-white/40 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Creativity</div>
          </div>
        </div>
      </div>

      {/* Main Hero Layout - Stacked for Reveal Effect */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-start">

        {/* 1. Text Layer - Positioned Absolute/Behind or Top Flow */}
        {/* We place it conceptually "above" the video, but it needs to trigger effectively */}
        {/* Actually, putting it strictly above in flow works if we position the video correctly. */}
        {/* Based on request: "empty space opens above the video... text reveals into that space" */}

        <div
          ref={textRef}
          className="absolute top-0 w-full text-center z-20 pt-2 opacity-0 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight leading-[1.1] mb-6 font-display">
              <span className="block mb-2">Crafting <span className="font-serif italic">visual</span> stories</span>
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
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            poster="/video/poster.jpg" // Added simple placeholder or existing SVG
          >
            <source src="/content/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60 pointer-events-none"></div>
        </div>
      </div>

      {/* Add proper spacing before ShowreelPage */}
      {/* Increased spacing to accommodate the deep video scroll reveal */}
      <div className="h-[100vh]"></div>
    </div>
  );
};

export default HeroSection;
