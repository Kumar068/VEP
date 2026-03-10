import React, { useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useHaptics } from '../hooks/useHaptics';

gsap.registerPlugin(ScrollTrigger, useGSAP);


// ─── Play / Pause / Stop cycling button ───────────────────────────────────
// SVG icon paths for each state (viewBox 0 0 24 24)
const PLAY_STATE_ICONS = {
  play: {
    label: '▶ PLAY',
    // A filled triangle pointing right
    d: 'M5 3l14 9L5 21V3z',
  },
  pause: {
    label: '⏸ PAUSE',
    // Two vertical bars
    d: 'M6 4h4v16H6V4zm8 0h4v16h-4V4z',
  },
  stop: {
    label: '⏹ STOP',
    // A filled square
    d: 'M4 4h16v16H4V4z',
  },
} as const;

type PlayState = keyof typeof PLAY_STATE_ICONS;

const CYCLE: PlayState[] = ['play', 'pause', 'stop'];

// Curated dot color palette (HSL values chosen to look great on dark bg)
const DOT_COLORS = [
  '#ffffff', // white (initial)
  '#4f8ef7', // electric blue
  '#f7c948', // warm amber
  '#3de89e', // mint green
  '#f74f8e', // hot pink
  '#bf6ef7', // lavender purple
  '#f7693e', // cinematic orange
] as const;

interface PlayDotRowProps {
  className?: string;
}

const PlayDotRow: React.FC<PlayDotRowProps> = () => {
  const [playState, setPlayState] = useState<PlayState>('play');
  const [dotColorIdx, setDotColorIdx] = useState(0);

  const iconRef = useRef<SVGPathElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const handlePlayClick = useCallback(() => {
    const currentIdx = CYCLE.indexOf(playState);
    const nextState = CYCLE[(currentIdx + 1) % CYCLE.length];

    // Icon morph: pop out → in
    if (iconRef.current) {
      gsap.timeline()
        .to(iconRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.18,
          ease: 'power2.in',
          transformOrigin: '50% 50%',
          onComplete: () => setPlayState(nextState),
        })
        .to(iconRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.28,
          ease: 'back.out(2.5)',
          transformOrigin: '50% 50%',
        });
    } else {
      setPlayState(nextState);
    }

    // Button border pulse
    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { boxShadow: '0 0 0 0px rgba(255,255,255,0.6)' },
        {
          boxShadow: '0 0 0 8px rgba(255,255,255,0)',
          duration: 0.5,
          ease: 'power2.out',
        }
      );
    }
  }, [playState]);

  const handleDotClick = useCallback(() => {
    const nextIdx = (dotColorIdx + 1) % DOT_COLORS.length;
    setDotColorIdx(nextIdx);

    if (dotRef.current) {
      gsap.timeline()
        .to(dotRef.current, {
          scale: 0.5,
          duration: 0.12,
          ease: 'power2.in',
        })
        .to(dotRef.current, {
          scale: 1.3,
          duration: 0.22,
          ease: 'back.out(3)',
        })
        .to(dotRef.current, {
          scale: 1,
          duration: 0.18,
          ease: 'power3.out',
        });
    }
  }, [dotColorIdx]);

  const iconData = PLAY_STATE_ICONS[playState];

  return (
    <div className="video-element flex justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8 mt-5">

      {/* ── Play / Pause / Stop button ── */}
      <div className="video-element relative cursor-pointer select-none" onClick={handlePlayClick}>
        <div
          ref={btnRef}
          className="w-5 h-5 md:w-8 md:h-8 border-2 border-white/30 rounded-full flex items-center justify-center transition-colors duration-300"
          style={{ boxShadow: '0 0 0 0px rgba(255,255,255,0)' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white w-3 h-3 md:w-4 md:h-4"
            aria-label={iconData.label}
          >
            <path ref={iconRef} d={iconData.d} />
          </svg>
        </div>
      </div>

      {/* ── REC indicator (static, middle) ── */}
      <div className="video-element flex flex-col gap-0.5 items-center">
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-white/40 text-[7px] md:text-[9px] font-mono">REC</div>
      </div>

      {/* ── Color-cycling bounce dot ── */}
      <div
        className="video-element relative cursor-pointer select-none"
        onClick={handleDotClick}
      >
        <div className="w-5 h-5 md:w-8 md:h-8 border-2 border-white/30 rounded-full flex items-center justify-center">
          <div
            ref={dotRef}
            className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: DOT_COLORS[dotColorIdx],
              boxShadow: `0 0 8px 2px ${DOT_COLORS[dotColorIdx]}66`,
            }}
          />
        </div>
        <div
          className="absolute inset-0 border-2 rounded-full animate-ping"
          style={{ borderColor: `${DOT_COLORS[dotColorIdx]}44` }}
        ></div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const stat24Ref = useRef<HTMLDivElement>(null);
  const stat4KRef = useRef<HTMLDivElement>(null);
  const stat60Ref = useRef<HTMLDivElement>(null);
  const statIconRef = useRef<SVGSVGElement>(null);
  const { trigger } = useHaptics();

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
      )
      // 7. "Rhythm." water-fill: gradient sweeps left → right
      .to(".rhythm-fill", {
        backgroundPosition: '0% 0',
        duration: 1.4,
        ease: "power2.inOut",
      }, "-=0.8");

    // --- Stat counter animations (trigger after entry) ---
    const counterTl = gsap.timeline({ delay: 1.2 });

    // 24FPS: count 0 → 24 (Bollywood/Indian cinematic standard)
    const obj24 = { val: 0 };
    counterTl.to(obj24, {
      val: 24,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        if (stat24Ref.current)
          stat24Ref.current.textContent = `${Math.round(obj24.val)}FPS`;
      },
    }, 0);

    // 4K stat ref: animate 0 → 30, show "30+"
    const obj30 = { val: 0 };
    counterTl.to(obj30, {
      val: 30,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (stat4KRef.current)
          stat4KRef.current.textContent = `${Math.round(obj30.val)}+`;
      },
    }, 0.3);

    // 60+: count 0 → 60
    const obj60 = { val: 0 };
    counterTl.to(obj60, {
      val: 2000,
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

    const isMobileView = window.innerWidth < 768;

    gsap.to(videoRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: isMobileView ? "500px top" : "1000px top",
        scrub: true,
      },
      scale: 1.1,
      y: isMobileView ? 200 : 800,
      ease: "none"
    });

    gsap.to(textRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: isMobileView ? "500px top" : "1000px top",
        scrub: true,
      },
      opacity: 1,
      y: isMobileView ? 100 : 400,
      ease: "none"
    });

    // Autoplay video on scroll start
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "100px top",
      onEnter: () => {
        trigger('nudge');
        videoPlayerRef.current?.play().catch(console.error);
      }
    });

  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="relative z-10 min-h-screen flex flex-col justify-center items-center px-3 sm:px-4 bg-transparent pt-24 sm:pt-28 md:pt-40 overflow-hidden"
    >
      <div className="text-center mb-8 sm:mb-12 w-full overflow-hidden">
        {/* Dynamic video editing elements */}
        <PlayDotRow />

        <h1 className="hero-line flex flex-col items-center text-center mb-4 sm:mb-6 md:mb-8">
          <span
            className="relative font-black text-[#e8e6e1] leading-[0.9] font-display uppercase tracking-tighter"
            style={{ fontSize: 'clamp(1.8rem, 10vw, 7.5rem)' }}
          >
            NARRATIVE THROUGH
          </span>
          {/* Rhythm — single-element water-fill via gradient */}
          <span
            className="rhythm-fill font-serif italic leading-[0.85] tracking-tight mt-1 md:mt-2 inline-block"
            style={{
              fontSize: 'clamp(2.2rem, 12vw, 10rem)',
              WebkitTextStroke: 'clamp(1px, 0.3vw, 2px) #e8e6e1',
              background: 'linear-gradient(90deg, #1152d4 50%, transparent 50%)',
              backgroundSize: '200% 100%',
              backgroundPosition: '100% 0',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
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
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Cinematic FPS</div>
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
              }}
            >0+</div>
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Industry Ready</div>
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
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Reels Delivered</div>
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
            <div className="text-white/40 text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-bold">Filmy Magic</div>
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
            <h2 className="text-2xl sm:text-4xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 font-display text-white">
              <span className="block mb-4 overflow-hidden">
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Crafting</span>{' '}
                <span className="font-serif italic bg-gradient-to-br from-[#a78bfa] via-[#8b5cf6] to-[#6366f1] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(139,92,246,0.25)]">visual</span>{' '}
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">stories</span>
              </span>
              <span className="block mb-4 overflow-hidden">
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">built to</span>{' '}
                <span className="text-[#a5b4fc] drop-shadow-[0_0_15px_rgba(165,180,252,0.3)]">resonate</span>{' '}
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">deeply</span>
              </span>
              <span className="block overflow-hidden">
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">with</span>{' '}
                <span className="bg-gradient-to-br from-[#22d3ee] via-[#0ea5e9] to-[#2563eb] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(14,165,233,0.25)]">lasting impact</span>.
              </span>
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
            className="hero-video w-full h-full object-cover scale-110 opacity-60"
            loop
            muted
            playsInline
            controls={false}
            preload="metadata"
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
