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
  const stat24Ref = useRef<HTMLDivElement>(null);
  const stat4KRef = useRef<HTMLDivElement>(null);
  const stat60Ref = useRef<HTMLDivElement>(null);
  const statIconRef = useRef<SVGSVGElement>(null);

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
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
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

    // --- Stat counter animations (trigger after entry) ---
    const counterTl = gsap.timeline({ delay: 1.2 });

    // 24FPS: count 0 → 24
    const obj24 = { val: 0 };
    counterTl.to(obj24, {
      val: 60,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        if (stat24Ref.current)
          stat24Ref.current.textContent = `${Math.round(obj24.val)}FPS`;
      },
    }, 0);

    // 4K: pop in with a scale bounce
    if (stat4KRef.current) {
      counterTl.fromTo(
        stat4KRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)" },
        0.3
      );
    }

    // 60+: count 0 → 60
    const obj60 = { val: 0 };
    counterTl.to(obj60, {
      val: 60,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        if (stat60Ref.current)
          stat60Ref.current.textContent = `${Math.round(obj60.val)}+`;
      },
    }, 0);

    // Creativity icon: continuous slow spin
    if (statIconRef.current) {
      gsap.to(statIconRef.current, {
        rotation: 360,
        duration: 6,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    }

    // Shimmer sweep across each stat value after load
    gsap.fromTo(
      ".stat-value",
      { backgroundPositionX: "-200%" },
      {
        backgroundPositionX: "200%",
        duration: 1.5,
        stagger: 0.15,
        delay: 1.6,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 5,
      }
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
      className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 bg-transparent pt-28 md:pt-40"
    >
      <div className="text-center mb-12">
        {/* Dynamic video editing elements */}
        <div className="flex justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="video-element relative">
            <div className="w-10 h-10 md:w-16 md:h-16 border-2 border-white/30 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg md:text-2xl animate-pulse">▶</span>
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-0.5 bg-white/40"></div>
          </div>

          <div className="video-element flex flex-col gap-1">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-white/40 text-[9px] md:text-xs font-mono">REC</div>
          </div>

          <div className="video-element relative">
            <div className="w-10 h-10 md:w-16 md:h-16 border-2 border-white/30 rounded-lg flex items-center justify-center">
              <div className="text-white text-lg md:text-xl">◉</div>
            </div>
            <div className="absolute inset-0 border-2 border-white/20 rounded-lg animate-ping"></div>
          </div>
        </div>

        <h1 className="hero-line flex flex-col items-center text-center mb-6 md:mb-8">
          <span className="relative text-[3rem] sm:text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-black text-[#e8e6e1] leading-[0.9] font-display uppercase tracking-tighter">
            NARRATIVE THROUGH
          </span>
          <span className="text-[3.5rem] sm:text-[4.5rem] md:text-[7rem] lg:text-[10rem] font-serif italic leading-[0.85] tracking-tight mt-1 md:mt-2 text-transparent" style={{ WebkitTextStroke: '2px #e8e6e1' }}>
            Rhythm.
          </span>
        </h1>

        {/* Dynamic video editing metrics */}
        <p className="hero-subtext text-white/50 text-xs md:text-sm text-center mb-10 md:mb-16 max-w-xs sm:max-w-lg mx-auto leading-relaxed font-sans px-2">
          Transforming raw footage into visceral emotional experiences through
          cinematic storytelling and expert post-production.
        </p>

        {/* Live editing stats — 2 cols on mobile, 4 on md */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-xs sm:max-w-sm md:max-w-3xl mx-auto w-full mb-10 md:mb-16">
          <div
            className="stat-item text-center cursor-default"
            onMouseEnter={e => gsap.to(e.currentTarget, { y: -4, scale: 1.08, duration: 0.3, ease: 'back.out(2)' })}
            onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.4, ease: 'power3.out' })}
          >
            <div
              ref={stat24Ref}
              className="stat-value text-[#e8e6e1] text-lg md:text-2xl font-black mb-2 md:mb-3 font-display"
              style={{
                background: 'linear-gradient(90deg, #e8e6e1 40%, #ffffff 50%, #e8e6e1 60%)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >0FPS</div>
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Frame Rate</div>
          </div>

          <div
            className="stat-item text-center cursor-default"
            onMouseEnter={e => gsap.to(e.currentTarget, { y: -4, scale: 1.08, duration: 0.3, ease: 'back.out(2)' })}
            onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.4, ease: 'power3.out' })}
          >
            <div
              ref={stat4KRef}
              className="stat-value text-[#e8e6e1] text-xl md:text-4xl font-black mb-2 md:mb-3 font-display"
              style={{
                background: 'linear-gradient(90deg, #e8e6e1 40%, #ffffff 50%, #e8e6e1 60%)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: 0,
              }}
            >4K</div>
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Resolution</div>
          </div>

          <div
            className="stat-item text-center cursor-default"
            onMouseEnter={e => gsap.to(e.currentTarget, { y: -4, scale: 1.08, duration: 0.3, ease: 'back.out(2)' })}
            onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.4, ease: 'power3.out' })}
          >
            <div
              ref={stat60Ref}
              className="stat-value text-[#e8e6e1] text-xl md:text-4xl font-black mb-2 md:mb-3 font-display"
              style={{
                background: 'linear-gradient(90deg, #e8e6e1 40%, #ffffff 50%, #e8e6e1 60%)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >0+</div>
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Projects</div>
          </div>

          <div
            className="stat-item text-center flex flex-col items-center cursor-default"
            onMouseEnter={e => gsap.to(e.currentTarget, { y: -4, scale: 1.08, duration: 0.3, ease: 'back.out(2)' })}
            onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.4, ease: 'power3.out' })}
          >
            <div className="text-[#e8e6e1] text-xl md:text-4xl font-black mb-2 md:mb-3 font-display">
              <svg
                ref={statIconRef}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="w-6 h-6 md:w-10 md:h-10 mx-auto"
              >
                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
              </svg>
            </div>
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Creativity</div>
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

        {/* 2. Video Player */}
        <div
          ref={videoRef}
          className="relative z-10 w-full aspect-[9/16] sm:aspect-video md:max-w-6xl md:aspect-video bg-black/80 rounded-xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5"
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
            <source src="/content/hero-video.webm" type="video/webm" />
          </video>

          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60 pointer-events-none"></div>
        </div>
      </div>

      {/* Scroll spacer */}
      <div className="h-[50vh] md:h-[100vh]"></div>
    </div>
  );
};

export default HeroSection;
