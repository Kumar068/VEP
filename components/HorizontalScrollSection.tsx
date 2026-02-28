import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const CLIPS = [
  { title: 'Ember & Ash', meta: 'Commercial · 2:30', color: '#1152d4', bg: '#040e2a', year: '2025' },
  { title: 'Pulse', meta: 'Music Video · 4:12', color: '#4a6cf7', bg: '#040420', year: '2025' },
  { title: 'Meridian', meta: 'Short Film · 12:00', color: '#00c896', bg: '#041a10', year: '2024' },
  { title: 'Ghost Static', meta: 'Documentary · 18:40', color: '#9b59b6', bg: '#12041a', year: '2024' },
  { title: 'Solstice', meta: 'Brand Film · 3:15', color: '#f39c12', bg: '#1a1000', year: '2024' },
  { title: 'Undercurrent', meta: 'Art Film · 7:44', color: '#1abc9c', bg: '#001a16', year: '2023' },
  { title: 'The Divide', meta: 'Narrative · 22:10', color: '#e74c3c', bg: '#1a0005', year: '2023' },
];

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
    accent: '#4a6cf7',
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
  index, title, meta, color, bg, year,
}) => (
  <div
    className="group relative flex-shrink-0 overflow-hidden cursor-pointer"
    style={{
      width: '300px',
      height: '440px',
      background: bg,
      transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
    }}
    role="article"
    aria-label={`${title} — ${meta}`}
    tabIndex={0}
  >
    {/* colour accent top edge */}
    <div
      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: color }}
      aria-hidden="true"
    />
    {/* ambient glow */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}22 0%, transparent 70%)` }}
      aria-hidden="true"
    />
    {/* bottom overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

    {/* index mark */}
    <div
      className="absolute top-5 left-5 font-mono text-[9px] tracking-[0.2em] z-10 transition-colors duration-300"
      style={{ color: `${color}99` }}
    >
      REEL {String(index + 1).padStart(2, '0')}
    </div>
    {/* year badge */}
    <div className="absolute top-5 right-5 font-mono text-[8px] tracking-[0.2em] text-white/20 z-10">
      {year}
    </div>

    {/* play button */}
    <div className="absolute inset-0 flex items-center justify-center z-10">
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

    {/* info block */}
    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
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
    <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `${color}30` }} />
  </div>
);

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
      className="relative px-8 md:px-20 py-28 md:py-40 overflow-hidden"
      aria-label="Manifesto"
    >
      {/* oversized ghost background word */}
      <div
        className="absolute -bottom-10 -right-6 font-black text-[18vw] leading-none text-white/[0.025] select-none pointer-events-none uppercase tracking-tighter"
        aria-hidden="true"
      >
        STORY
      </div>

      <SectionLabel id="— 02" label="Manifesto" />

      <p
        className="mt-12 font-serif text-[clamp(1.9rem,4.8vw,4.5rem)] leading-[1.18] tracking-[-0.02em]"
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
    className="group relative p-8 md:p-10 overflow-hidden cursor-default transition-colors duration-500"
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
        fontSize: 'clamp(5rem,8vw,7rem)',
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
    <div className="font-black text-lg md:text-xl tracking-tight text-white mb-3 uppercase">
      {title}
    </div>

    {/* desc */}
    <p className="text-[13px] text-white/35 leading-[1.75]">{desc}</p>

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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const HorizontalScrollSection: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const clipsRef = useRef<HTMLDivElement>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

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
    <div ref={rootRef} id="process" className="relative z-10 text-white overflow-x-hidden">

      {/* ────────────────────────────────────────────────────────────────────
          1. WAVEFORM — Sound Shapes Story
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="relative px-8 md:px-20 py-24 md:py-32 border-t border-white/[0.06]"
        id="showreel"
        aria-label="Sound shapes story"
      >
        {/* top section label */}
        <SectionLabel id="— 01" label="Sound & Vision" />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* left */}
          <div className="wf-left">
            {/* oversized ghost */}
            <div
              className="font-black text-[13vw] md:text-[8vw] leading-none text-white/[0.04] select-none uppercase tracking-tighter mb-2 -ml-1"
              aria-hidden="true"
            >
              SOUND
            </div>
            <h2 className="font-black text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.88] uppercase tracking-tight -mt-4 mb-8">
              Sound<br />
              Shapes{' '}
              <span className="font-serif italic font-normal" style={{ color: '#1152d4', WebkitTextStroke: '0px' }}>
                Story
              </span>
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/45 leading-[1.85] max-w-[38ch]">
              Every cut is intentional. Every beat synced. The rhythm of the edit breathes life into
              footage, transforming it into an emotional journey the audience feels in their bones.
            </p>

            {/* stat row */}
            <div className="mt-10 flex gap-10 pt-8 border-t border-white/[0.07]">
              {[['48kHz', 'Sample Rate'], ['24-bit', 'Depth'], ['5.1', 'Mix Output']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div className="font-black text-2xl text-white tracking-tight">{val}</div>
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

      {/* ────────────────────────────────────────────────────────────────────
          2. MANIFESTO
      ──────────────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06]">
        <StatementSection />
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          3. LATEST CLIPS
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="pt-20 pb-28 border-t border-white/[0.06]"
        id="work"
        aria-label="Latest clips — 07 projects"
      >
        {/* header */}
        <div className="clips-header px-8 md:px-20 mb-14">
          <SectionLabel id="— 03" label="Selected Work" />
          <div className="mt-8 flex items-end justify-between">
            <h2 className="font-black uppercase tracking-tight leading-[0.88] text-[clamp(2.5rem,6vw,6rem)]">
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
              <span className="font-mono text-[9px] tracking-[0.15em] text-white/15 uppercase">2023 — 2025</span>
            </div>
          </div>
        </div>

        {/* card strip */}
        <div
          ref={clipsRef}
          className="flex gap-[3px] overflow-x-auto px-8 md:px-20 select-none"
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
        <div className="px-8 md:px-20 mt-5 flex items-center gap-3 opacity-30" aria-hidden="true">
          <div className="h-px w-8 bg-white/40" />
          <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/50">Drag to explore</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          4. PROCESS
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="px-8 md:px-20 py-24 md:py-32 border-t border-white/[0.06]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.014) 0%, transparent 100%)' }}
        id="process-steps"
        aria-label="The Process — 4 steps"
      >
        <SectionLabel id="— 04" label="The Process" />

        <div className="mt-10 mb-16">
          <h2 className="font-black text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[0.88] uppercase tracking-tight">
            How It{' '}
            <span className="font-serif italic font-normal" style={{ color: '#1152d4' }}>
              Works
            </span>
          </h2>
        </div>

        {/* grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/[0.07] divide-x divide-white/[0.07]"
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
                onHover={(h) => setHoveredStep(h ? i : null)}
              />
            </div>
          ))}
        </div>

        {/* bottom CTA strip */}
        <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-10 border-t border-white/[0.06]">
          <p className="text-white/30 text-sm leading-relaxed max-w-sm font-light">
            Every project begins with a conversation. Let's build something that outlasts the trend.
          </p>
          <a
            href="#contact"
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
