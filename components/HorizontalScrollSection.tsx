import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useHaptics } from '../hooks/useHaptics';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const CLIPS = [
  { title: 'Ember & Ash', meta: 'Commercial · 2:30', color: '#1152d4', bg: '#040e2a', year: '2025', videoSrc: '/content/reels/reel-01.mp4' },
  { title: 'Pulse', meta: 'Music Video · 4:12', color: '#f74a4a', bg: '#200404', year: '2025', videoSrc: '/content/reels/reel-02.mp4' },
  { title: 'Meridian', meta: 'Short Film · 12:00', color: '#00c896', bg: '#041a10', year: '2024', videoSrc: '/content/reels/reel-03.mp4' },
  { title: 'Ghost Static', meta: 'Documentary · 18:40', color: '#9b59b6', bg: '#12041a', year: '2024', videoSrc: '/content/reels/reel-04.mp4' },
  { title: 'Solstice', meta: 'Brand Film · 3:15', color: '#f39c12', bg: '#1a1000', year: '2024', videoSrc: '/content/reels/reel-05.mp4' },
  { title: 'Undercurrent', meta: 'Art Film · 7:44', color: '#1abc9c', bg: '#001a16', year: '2023', videoSrc: '/content/reels/reel-06.mp4' },
  { title: 'The Divide', meta: 'Narrative · 22:10', color: '#e74c3c', bg: '#1a0005', year: '2023', videoSrc: '/content/reels/reel-07.mp4' },
];
// ↑ Download reels as mp4, place in /public/content/reels/, set videoSrc to '/content/reels/filename.mp4'

const PROCESS_STEPS = [
  {
    num: '01',
    label: 'Discovery',
    title: 'Brief & Vision',
    desc: 'Deep dive into your story. Understanding the emotional core before a single frame is touched.',
    accent: '#1152d4',
  },
  {
    num: '02',
    label: 'Craft',
    title: 'Assembly Cut',
    desc: 'Rough structure laid down. Finding the narrative spine and pacing rhythm in the raw material.',
    accent: '#f74a4aff',
  },
  {
    num: '03',
    label: 'Atmosphere',

    title: 'Color & Sound',
    desc: 'Grading for atmosphere. Sound design that makes every moment breathe with intention.',
    accent: '#00c896',
  },
  {
    num: '04',
    label: 'Launch',
    title: 'Final Delivery',
    desc: 'Multiple format exports. Optimized for every screen, every platform, every audience.',
    accent: '#f39c12',
  },
];

const STATEMENT_WORDS = [
  { text: 'Crafting', italic: false },
  { text: 'visual', italic: true },
  { text: 'stories', italic: false },
  { text: 'that', italic: false },
  { text: 'resonate', italic: false },
  { text: 'deeply', italic: false },
  { text: 'and', italic: false },
  { text: 'leave', italic: false },
  { text: 'a', italic: false },
  { text: 'lasting', italic: false },
  { text: 'emotional', italic: true },
  { text: 'impact.', italic: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Section label row
// ─────────────────────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ id: string; label: string }> = ({ id, label }) => (
  <div className="flex items-center gap-5 mb-0">
    <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/30">{id}</span>
    <div className="flex-1 h-px bg-white/[0.07]" />
    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-blue-500">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Waveform Canvas — dual-colour, centre-mirrored
// ─────────────────────────────────────────────────────────────────────────────

const WaveformCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const off = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;

    const draw = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
      ctx.clearRect(0, 0, c.width, c.height);

      const gap = 6;
      const bw = 4;
      const bars = Math.floor(c.width / gap);
      const cy = c.height / 2;

      for (let i = 0; i < bars; i++) {
        const x = i * gap;
        const h = (Math.sin(i * 0.25 + off.current) * 0.45 + 0.55) * cy * 0.9;
        const t = i / bars;
        // gradient colour across bar row
        const r = Math.round(74 + t * 181);
        const g = Math.round(108 + t * -68);
        const b = Math.round(247 + t * -216);
        const a = 0.25 + Math.abs(Math.sin(i * 0.25 + off.current)) * 0.65;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        // top half
        ctx.beginPath();
        ctx.roundRect(x, cy - h, bw, h, 2);
        ctx.fill();
        // mirror bottom
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.35})`;
        ctx.beginPath();
        ctx.roundRect(x, cy, bw, h * 0.5, 2);
        ctx.fill();
      }
      off.current += 0.045;
      rafRef.current = requestAnimationFrame(draw);
    };

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else draw();
    };

    document.addEventListener('visibilitychange', onVis);
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="relative rounded-sm overflow-hidden border border-white/[0.07] bg-white/[0.02]" style={{ height: '160px' }}>
      {/* HUD labels */}
      <span className="absolute top-2 left-3 font-mono text-[7px] tracking-[0.25em] text-white/20 uppercase z-10 select-none">
        Audio Waveform
      </span>
      <span className="absolute top-2 right-3 font-mono text-[7px] tracking-[0.2em] text-white/20 uppercase z-10 select-none">
        48kHz / 24bit
      </span>
      {/* shimmer playhead */}
      <div
        className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent z-10"
        style={{ animation: 'wf-playhead 4s linear infinite' }}
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="w-full h-full block" aria-hidden="true" />
      <style>{`
        @keyframes wf-playhead {
          from { left: 0; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          to   { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Clip Card — editorial accordion style
// ─────────────────────────────────────────────────────────────────────────────

const ClipCard: React.FC<typeof CLIPS[number] & { index: number }> = ({
  index, title, meta, color, bg, year, videoSrc,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(videoSrc);

  // Play when card is ≥30% in view, pause when it leaves
  useEffect(() => {
    if (!hasVideo || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => { });
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [hasVideo]);

  return (
    <div
      ref={cardRef}
      className="group relative flex-shrink-0 overflow-hidden cursor-pointer"
      style={{
        width: 'clamp(240px, 70vw, 300px)',
        height: 'clamp(340px, 85vw, 440px)',
        background: bg,
        transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}
      role="article"
      aria-label={`${title} — ${meta}`}
      tabIndex={0}
    >
      {/* ── Native video ── */}
      {hasVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover z-0"
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* colour accent top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
        style={{ background: color }}
        aria-hidden="true"
      />
      {/* ambient glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}22 0%, transparent 70%)` }}
        aria-hidden="true"
      />
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 transition-opacity duration-500 ${hasVideo ? 'opacity-70 group-hover:opacity-30' : ''}`}
      />

      {/* index mark */}
      <div
        className="absolute top-5 left-5 font-mono text-[9px] tracking-[0.2em] z-20 transition-colors duration-300"
        style={{ color: `${color}99` }}
      >
        REEL {String(index + 1).padStart(2, '0')}
      </div>
      {/* year badge */}
      <div className="absolute top-5 right-5 font-mono text-[8px] tracking-[0.2em] text-white/20 z-20">
        {year}
      </div>

      {/* play button — placeholder cards only */}
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center
              opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100
              transition-all duration-400 ease-out backdrop-blur-md border"
            style={{ borderColor: `${color}60`, background: `${color}22`, boxShadow: `0 0 40px ${color}40` }}
          >
            <svg width="12" height="14" viewBox="0 0 12 14" fill="white" aria-hidden="true">
              <path d="M1 1l10 6L1 13V1z" />
            </svg>
          </div>
        </div>
      )}

      {/* info block */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h3
          className="font-black text-[1.4rem] leading-tight uppercase text-white mb-1
            translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
            transition-all duration-300"
        >
          {title}
        </h3>
        <p
          className="font-mono text-[9px] tracking-[0.2em] uppercase
            translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
            transition-all duration-300 delay-75"
          style={{ color: `${color}cc` }}
        >
          {meta}
        </p>
      </div>

      {/* always-visible footer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px z-20" style={{ background: `${color}30` }} />
    </div>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// Manifesto / Statement
// ─────────────────────────────────────────────────────────────────────────────

const StatementSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(() => {
    const words = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
    words.forEach((word, i) => {
      gsap.fromTo(word,
        { opacity: 0.08, y: 12, filter: 'blur(4px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `top+=${i * 50} 65%`,
            end: `top+=${i * 50 + 80} 65%`,
            scrub: 1,
          },
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <div
      ref={sectionRef}
      className="relative px-4 sm:px-8 md:px-20 py-20 sm:py-28 md:py-40 overflow-hidden"
      aria-label="Manifesto"
    >
      {/* oversized ghost background word */}
      <div
        className="absolute -bottom-10 -right-6 font-black text-[18vw] leading-none text-white/[0.025] select-none pointer-events-none uppercase tracking-tighter"
        aria-hidden="true"
      >
        STORY
      </div>

      <p
        className="mt-8 sm:mt-12 font-serif text-[clamp(1.4rem,4.8vw,4.5rem)] leading-[1.18] tracking-[-0.02em]"
        aria-label="Crafting visual stories that resonate deeply and leave a lasting emotional impact."
      >
        {STATEMENT_WORDS.map((w, i) => (
          <React.Fragment key={i}>
            <span
              ref={el => { wordRefs.current[i] = el; }}
              className="inline-block"
              style={{ opacity: 0.08 }}
            >
              {w.italic
                ? <em className="not-italic" style={{ color: '#1152d4' }}>{w.text}</em>
                : w.text}
            </span>
            {' '}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Process Step Card
// ─────────────────────────────────────────────────────────────────────────────

const ProcessStep: React.FC<typeof PROCESS_STEPS[number] & { isHovered: boolean; onHover: (h: boolean) => void }> = ({
  num, label, title, desc, accent, isHovered, onHover,
}) => (
  <div
    className="group relative p-5 sm:p-8 md:p-10 overflow-hidden cursor-default transition-colors duration-500"
    style={{ background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent' }}
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
    role="listitem"
  >
    {/* sliding bottom accent */}
    <div
      className="absolute bottom-0 left-0 h-[2px] transition-all duration-600 ease-out"
      style={{ width: isHovered ? '100%' : '0%', background: accent }}
    />
    {/* left accent bar on hover */}
    <div
      className="absolute top-0 left-0 w-[2px] transition-all duration-500"
      style={{ height: isHovered ? '100%' : '0%', background: accent, transitionDelay: '0.05s' }}
    />

    {/* ghost step number */}
    <span
      className="absolute -top-2 right-4 font-black leading-none select-none pointer-events-none transition-all duration-500"
      style={{
        fontSize: 'clamp(3.5rem,8vw,7rem)',
        color: isHovered ? `${accent}18` : 'rgba(255,255,255,0.03)',
      }}
      aria-hidden="true"
    >
      {num}
    </span>

    {/* label */}
    <div
      className="font-mono text-[9px] tracking-[0.3em] uppercase mb-5 transition-colors duration-300"
      style={{ color: isHovered ? accent : 'rgba(255,255,255,0.25)' }}
    >
      {label}
    </div>

    {/* title */}
    <div className="font-black text-base sm:text-lg md:text-xl tracking-tight text-white mb-3 uppercase">
      {title}
    </div>

    {/* desc */}
    <p className="text-[12px] sm:text-[13px] text-white/35 leading-[1.75]">{desc}</p>

    {/* arrow icon on hover */}
    <div
      className="mt-6 flex items-center gap-2 transition-all duration-300"
      style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateX(0)' : 'translateX(-8px)' }}
      aria-hidden="true"
    >
      <div className="h-px w-6 transition-all" style={{ background: accent }} />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={accent} strokeWidth="1.5">
        <line x1="0" y1="5" x2="8" y2="5" />
        <polyline points="4,1 8,5 4,9" />
      </svg>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tools Marquee — infinite loop strip
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS_ROW1 = [
  'Adobe Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Final Cut Pro',
  'Adobe Audition', 'Lumetri Color', 'Fusion', 'CapCut', 'Motion',
  'Media Encoder', 'Fairlight', 'Premiere Rush',
];
const TOOLS_ROW2 = [
  'Photoshop', 'Lightroom', 'Illustrator', 'Frame.io', 'Resolve Color',
  'Adobe XD', 'Figma', 'Topaz AI', 'Neat Video', 'Red Giant',
  'Boris FX', 'Mocha Pro',
];

const ToolsMarquee: React.FC = () => (
  <div
    className="relative w-full py-7 overflow-hidden border-y border-white/[0.05]"
    aria-label="Tools I work with"
  >
    {/* subtle gradient fade on edges */}
    <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
      style={{ background: 'linear-gradient(to right, #000, transparent)' }} />
    <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
      style={{ background: 'linear-gradient(to left, #000, transparent)' }} />

    {/* Row 1 — scroll left */}
    <div className="flex gap-0 mb-3" style={{ animation: 'marquee-left 28s linear infinite', width: 'max-content' }}>
      {[...TOOLS_ROW1, ...TOOLS_ROW1].map((tool, i) => (
        <span key={i} className="inline-flex items-center gap-4 px-6 whitespace-nowrap">
          <span className="font-black text-[11px] uppercase tracking-[0.22em] text-white/50 hover:text-white/90 transition-colors duration-200">
            {tool}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/15 flex-shrink-0" aria-hidden="true" />
        </span>
      ))}
    </div>

    {/* Row 2 — scroll right (reverse) */}
    <div className="flex gap-0" style={{ animation: 'marquee-right 22s linear infinite', width: 'max-content' }}>
      {[...TOOLS_ROW2, ...TOOLS_ROW2].map((tool, i) => (
        <span key={i} className="inline-flex items-center gap-4 px-6 whitespace-nowrap">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/25 hover:text-blue-400 transition-colors duration-200">
            {tool}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10 flex-shrink-0" aria-hidden="true" />
        </span>
      ))}
    </div>

    <style>{`
      @keyframes marquee-left {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes marquee-right {
        from { transform: translateX(-50%); }
        to   { transform: translateX(0); }
      }
    `}</style>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Glimpse Section — image left, achievements right
// ─────────────────────────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  {
    num: '01',
    title: '1st Place',
    sub: 'Karnataka State Editing Challenge',
    detail: 'Beat 300+ editors across South India in a live competitive edit.',
    accent: '#1152d4',
  },
  {
    num: '02',
    title: '30+ Industries',
    sub: 'Diverse Client Portfolio',
    detail: 'From fashion to fintech — adapting visual language across every sector.',
    accent: '#f74a4a',
  },
  {
    num: '03',
    title: 'Senior Editor',
    sub: 'Digital Marketing Agency',
    detail: 'Leading high-retention video content strategies at scale.',
    accent: '#00c896',
  },
  {
    num: '04',
    title: '2000+ Projects',
    sub: 'Delivered & Counting',
    detail: 'From concept to final export — every frame intentional.',
    accent: '#f39c12',
  },
];

const GlimpseSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const imgInnerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ── 1. Image card: clip-path wipe-up reveal ──────────────────────────
    if (cardWrapRef.current) {
      gsap.fromTo(cardWrapRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
          ease: 'power4.out', duration: 1.4,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      );
    }

    // ── 2. Inner image: scroll scrub parallax (moves slower than page) ───
    if (imgInnerRef.current) {
      gsap.fromTo(imgInnerRef.current, { y: 80 }, {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.8 },
      });
    }

    // ── 3. Floating background orbs at different scroll speeds ───────────
    if (orb1Ref.current) {
      gsap.fromTo(orb1Ref.current, { y: 0, x: 0 }, {
        y: -120, x: 30, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 },
      });
    }
    if (orb2Ref.current) {
      gsap.fromTo(orb2Ref.current, { y: 0, x: 0 }, {
        y: 80, x: -40, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 3 },
      });
    }

    // ── 4. Right column: slides in from right on scroll ──────────────────
    if (rightColRef.current) {
      gsap.fromTo(rightColRef.current, { x: 60, opacity: 0 }, {
        x: 0, opacity: 1, ease: 'power3.out', duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', toggleActions: 'play none none reverse' },
      });
    }

    // ── 5. Achievement cards: stagger + slight parallax offset ───────────
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>('.glimpse-card');
    if (cards?.length) {
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { x: 50, opacity: 0 },
          {
            x: 0, opacity: 1, ease: 'power3.out', duration: 0.7, delay: i * 0.08,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 68%', toggleActions: 'play none none reverse' },
          }
        );
        // each card drifts up slightly at different parallax rates
        gsap.to(card, {
          y: -(i + 1) * 12,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 + i * 0.3 },
        });
      });
    }

    // ── 6. Heading: letter-by-letter skew reveal ─────────────────────────
    const heading = sectionRef.current?.querySelector<HTMLElement>('.glimpse-heading');
    if (heading) {
      gsap.fromTo(heading, { y: 50, skewY: 4, opacity: 0 }, {
        y: 0, skewY: 0, opacity: 1, ease: 'power4.out', duration: 1.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
      });
    }
  }, { scope: sectionRef });

  // ── Mouse-move 3D tilt on image card ────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 → 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, { rotateY: x * 14, rotateX: -y * 10, scale: 1.03, duration: 0.5, ease: 'power2.out', transformPerspective: 900 });
    // glow follows cursor
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: (e.clientX - rect.left) - rect.width / 2,
        y: (e.clientY - rect.top) - rect.height / 2,
        opacity: 1, duration: 0.4, ease: 'power2.out',
      });
    }
  };
  const handleMouseLeave = () => {
    const el = cardWrapRef.current;
    if (!el) return;
    gsap.to(el, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1,0.4)', transformPerspective: 900 });
    if (glowRef.current) gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
  };

  return (
    <div
      ref={sectionRef}
      id="work"
      className="relative px-4 sm:px-8 md:px-20 pt-20 sm:pt-24 pb-8 sm:pb-10 md:pt-36 md:pb-12 overflow-hidden"
      aria-label="A glimpse — achievements"
      style={{ perspective: '1200px' }}
    >
      {/* ── Floating background orbs ──────────────────────────────────── */}
      <div ref={orb1Ref} className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(circle, rgba(17,82,212,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div ref={orb2Ref} className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Ghost heading */}
      <div className="absolute -top-6 -left-4 font-black text-[18vw] leading-none text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter" aria-hidden="true">
        GLIMPSE
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">

        {/* ── Left: image with 3D tilt ──────────────────────────────── */}
        <div
          ref={cardWrapRef}
          className="relative w-full sm:w-2/3 mx-auto sm:mx-10 my-6 sm:my-10 lg:mx-0 aspect-[3/4] rounded-sm overflow-hidden cursor-none"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)', transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Cursor-following glow */}
          <div ref={glowRef} className="absolute w-40 h-40 rounded-full pointer-events-none opacity-0 z-20"
            style={{
              background: 'radial-gradient(circle, rgba(17,82,212,0.6) 0%, transparent 70%)',
              transform: 'translate(-50%,-50%)',
              filter: 'blur(20px)',
            }}
            aria-hidden="true"
          />

          {/* Parallax inner image layer */}
          <div ref={imgInnerRef} className="absolute inset-0 scale-[1.2]"
            style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #1152d4 40%, #00c896 100%)' }}
          >
            <img
              src="/content/glimpse-image.webp"
              alt="Keerthan at work"
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Film grain */}
            <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '180px',
              }}
            />
          </div>

          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-7 h-7 border-l-2 border-t-2 border-white/50 z-10" aria-hidden="true" />
          <div className="absolute top-4 right-4 w-7 h-7 border-r-2 border-t-2 border-white/50 z-10" aria-hidden="true" />
          <div className="absolute bottom-16 left-4 w-7 h-7 border-l-2 border-b-2 border-white/50 z-10" aria-hidden="true" />
          <div className="absolute bottom-16 right-4 w-7 h-7 border-r-2 border-b-2 border-white/50 z-10" aria-hidden="true" />

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10 pointer-events-none" />

          {/* Name tag at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
            <div className="font-black text-lg uppercase tracking-tight text-white">Keerthan</div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase mt-0.5">Senior Video Editor</div>
          </div>
        </div>

        {/* ── Right: achievements ───────────────────────────────────── */}
        <div ref={rightColRef}>
          <div className="glimpse-heading mb-12">
            <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/25 mb-4">A Glimpse</div>
            <h2 className="font-black text-[clamp(2rem,5vw,5rem)] leading-[0.9] uppercase tracking-tight">
              Behind the{' '}
              <span className="font-serif italic font-normal" style={{ color: '#1152d4' }}>Edit</span>
            </h2>
            <p className="mt-4 sm:mt-5 text-white/40 text-[13px] sm:text-[14px] leading-[1.8] max-w-[42ch]">
              Years of obsessive craft, competitive wins, and cross-industry storytelling —
              all converging into a single frame at a time.
            </p>
          </div>

          <div className="flex flex-col gap-px">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.num}
                className="glimpse-card group relative flex items-start gap-5 p-5 rounded-sm transition-all duration-500 hover:bg-white/[0.04] cursor-default"
                style={{ willChange: 'transform' }}
              >
                {/* hover: full-width glow bar at top */}
                <div className="absolute inset-x-0 top-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: a.accent }} aria-hidden="true" />
                {/* left accent */}
                <div className="mt-1 w-[2px] self-stretch flex-shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: a.accent }} aria-hidden="true" />
                {/* number */}
                <div className="font-mono text-[9px] tracking-[0.25em] mt-1 flex-shrink-0 w-6" style={{ color: `${a.accent}99` }}>
                  {a.num}
                </div>
                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="font-black text-base sm:text-lg md:text-xl tracking-tight text-white uppercase leading-tight group-hover:translate-x-1 transition-transform duration-300">
                    {a.title}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase mt-1 mb-2" style={{ color: a.accent }}>
                    {a.sub}
                  </div>
                  <p className="text-white/30 text-[13px] leading-[1.7]">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const HorizontalScrollSection: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const clipsRef = useRef<HTMLDivElement>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const { trigger } = useHaptics();

  // ── Drag-to-scroll ───────────────────────────────────────────────────────
  const drag = useRef({ down: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = clipsRef.current; if (!el) return;
    drag.current = { down: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = 'grabbing';
  }, []);
  const onMouseLeave = useCallback(() => {
    drag.current.down = false;
    if (clipsRef.current) clipsRef.current.style.cursor = 'grab';
  }, []);
  const onMouseUp = useCallback(() => {
    drag.current.down = false;
    if (clipsRef.current) clipsRef.current.style.cursor = 'grab';
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = clipsRef.current; if (!el || !drag.current.down) return;
    e.preventDefault();
    el.scrollLeft = drag.current.scrollLeft - (e.pageX - el.offsetLeft - drag.current.startX) * 1.5;
  }, []);

  // ── GSAP section entrances ────────────────────────────────────────────────
  useGSAP(() => {
    // waveform section: split left/right
    const wfLeft = rootRef.current?.querySelector<HTMLElement>('.wf-left');
    const wfRight = rootRef.current?.querySelector<HTMLElement>('.wf-right');
    if (wfLeft && wfRight) {
      gsap.fromTo([wfLeft, wfRight],
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, ease: 'power3.out', duration: 1, stagger: 0.15,
          scrollTrigger: { trigger: wfLeft, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      );
    }

    // clips header
    const clipsHead = rootRef.current?.querySelector<HTMLElement>('.clips-header');
    if (clipsHead) {
      gsap.fromTo(clipsHead,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, ease: 'power3.out', duration: 0.8,
          scrollTrigger: { trigger: clipsHead, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );
    }

    // clip cards stagger
    const cards = rootRef.current?.querySelectorAll<HTMLElement>('.clip-card-item');
    if (cards?.length) {
      gsap.fromTo(cards,
        { y: 60, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1, ease: 'power3.out', stagger: 0.07, duration: 0.8,
          scrollTrigger: { trigger: clipsRef.current, start: 'top 88%', toggleActions: 'play none none reverse' }
        }
      );
    }

    // process steps
    const steps = rootRef.current?.querySelectorAll<HTMLElement>('.process-step-item');
    if (steps?.length) {
      gsap.fromTo(steps,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: steps[0], start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );
    }
  }, { scope: rootRef });

  return (
    <div ref={rootRef} className="relative z-10 text-white overflow-x-hidden">

      {/* ── Glimpse ── */}
      <GlimpseSection />

      {/* ── Tools Marquee ── */}
      <ToolsMarquee />

      <div
        className="relative px-4 sm:px-8 md:px-20 pt-8 sm:pt-10 pb-20 sm:pb-24 md:pt-14 md:pb-32"
      >
        {/* top section label */}

        <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 md:gap-24 items-center">
          {/* left */}
          <div className="wf-left">
            {/* oversized ghost */}
            <div
              className="font-black text-[10vw] sm:text-[13vw] md:text-[8vw] leading-none text-white/[0.04] select-none uppercase tracking-tighter mb-2 -ml-1"
              aria-hidden="true"
            >
              SOUND
            </div>
            <h2 className="font-black text-[clamp(2rem,5.5vw,5.5rem)] leading-[0.88] uppercase tracking-tight -mt-4 mb-6 sm:mb-8">
              Sound<br />
              Shapes{' '}
              <span className="font-serif italic font-normal" style={{ color: '#1152d4', WebkitTextStroke: '0px' }}>
                Story
              </span>
            </h2>
            <p className="text-[13px] sm:text-[14px] md:text-[15px] text-white/45 leading-[1.85] max-w-[38ch]">
              Every cut is intentional. Every beat synced. The rhythm of the edit breathes life into
              footage, transforming it into an emotional journey the audience feels in their bones.
            </p>

            {/* stat row */}
            <div className="mt-8 sm:mt-10 flex gap-6 sm:gap-10 pt-6 sm:pt-8">
              {[['48kHz', 'Sample Rate'], ['24-bit', 'Depth'], ['5.1', 'Mix Output']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div className="font-black text-xl sm:text-2xl text-white tracking-tight">{val}</div>
                  <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-white/25 mt-1">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right */}
          <div className="wf-right flex flex-col gap-4">
            <WaveformCanvas />
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[8px] tracking-[0.2em] text-white/20">00:00:00:00</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
                <span className="font-mono text-[8px] tracking-[0.2em] text-blue-500">REC LIVE</span>
              </div>
              <span className="font-mono text-[8px] tracking-[0.2em] text-white/20">00:04:00:00</span>
            </div>
            {/* secondary mini tracks */}
            <div className="flex flex-col gap-[3px] opacity-30" aria-hidden="true">
              {[0.6, 0.4, 0.25].map((h, i) => (
                <div key={i} className="h-2 rounded-sm overflow-hidden bg-white/[0.05]">
                  <div className="h-full rounded-sm opacity-60"
                    style={{ width: `${55 + i * 15}%`, background: `rgba(74,108,247,${h})` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <StatementSection />
      </div>
      <div
        className="pt-20 pb-28"
        id="showreel"
        aria-label="Latest clips — 07 projects"
        style={{ scrollMarginTop: '80px' }}
      >
        {/* header */}
        <div className="clips-header px-4 sm:px-8 md:px-20 mb-10 sm:mb-14">
          <div className="mt-8 flex items-end justify-between">
            <h2 className="font-black uppercase tracking-tight leading-[0.88] text-[clamp(2rem,6vw,6rem)]">
              Latest{' '}
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.2)' }}
              >
                Clips
              </span>
            </h2>
            <div className="text-right mb-1">
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase block">07 Projects</span>
              <span className="font-mono text-[9px] tracking-[0.15em] text-white/15 uppercase">2025 - 2026</span>
            </div>
          </div>
        </div>

        {/* card strip */}
        <div
          ref={clipsRef}
          className="flex gap-[3px] overflow-x-auto px-4 sm:px-8 md:px-20 select-none"
          style={{ scrollbarWidth: 'none', cursor: 'grab' }}
          role="list"
          aria-label="Project clip cards"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {CLIPS.map((clip, i) => (
            <div key={i} className="clip-card-item flex-shrink-0" role="listitem">
              <ClipCard index={i} {...clip} />
            </div>
          ))}
        </div>

        {/* scroll hint */}
        <div className="px-4 sm:px-8 md:px-20 mt-5 flex items-center gap-3 opacity-30" aria-hidden="true">
          <div className="h-px w-8 bg-white/40" />
          <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/50">Drag to explore</span>
        </div>
      </div>



      <div
        className="px-4 sm:px-8 md:px-20 py-16 sm:py-24 md:py-32"
        id="process"
        aria-label="The Process — 4 steps"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.014) 0%, transparent 100%)', scrollMarginTop: '80px' }}
      >

        <div className="mt-10 mb-16">
          <h2 className="font-black text-[clamp(2rem,5.5vw,5.5rem)] leading-[0.88] uppercase tracking-tight">
            How It{' '}
            <span className="font-serif italic font-normal" style={{ color: '#1152d4' }}>
              Works
            </span>
          </h2>
        </div>

        {/* grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px sm:gap-0"
          role="list"
          aria-label="4-step process"
        >
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.num}
              className="process-step-item border-t lg:border-t-0 border-white/[0.07] first:border-t-0"
              role="listitem"
            >
              <ProcessStep
                {...step}
                isHovered={hoveredStep === i}
                onHover={(h) => {
                  setHoveredStep(h ? i : null);
                  if (h) trigger(40);
                }}
              />
            </div>
          ))}
        </div>

        {/* bottom CTA strip */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 pt-8 sm:pt-10 border-t border-white/[0.06]">
          <p className="text-white/30 text-sm leading-relaxed max-w-sm font-light">
            Every project begins with a conversation. Let's build something that outlasts the trend.
          </p>
          <a
            href="#contact"
            onClick={() => trigger('success')}
            className="group inline-flex items-center gap-4 font-mono text-[11px] tracking-[0.25em] uppercase text-white/70
              hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            <span>Start a Project</span>
            <span
              className="inline-flex items-center justify-center w-10 h-10 border border-white/20 rounded-full
                group-hover:border-blue-500 group-hover:bg-blue-500/10 transition-all duration-300"
              aria-hidden="true"
            >
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="0" y1="5" x2="10" y2="5" />
                <polyline points="6,1 10,5 6,9" />
              </svg>
            </span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default HorizontalScrollSection;
