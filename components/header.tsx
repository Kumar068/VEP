import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useHaptics } from '../hooks/useHaptics';

const Header: React.FC = () => {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const { trigger } = useHaptics();

  useGSAP(() => {
    // Reveal Animation on Load
    const tl = gsap.timeline();

    tl.fromTo(headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    )
      .fromTo(logoRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.8"
      )
      .fromTo(".nav-link",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(ctaRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );

  }, { scope: headerRef });

  const handleLinkHover = (e: React.MouseEvent) => {
    // Subtle magnetic drift for links
    trigger('nudge');
    gsap.to(e.currentTarget, {
      y: -2,
      color: "#ffffff",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleLinkLeave = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      y: 0,
      color: "#9ca3af", // tailwind gray-400
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.5,
      ease: "power2.out"
    });

    // Animate the text slightly more for "depth"
    const text = btn.querySelector('span');
    if (text) {
      gsap.to(text, {
        x: x * 0.1,
        y: y * 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)"
    });

    const text = btn.querySelector('span');
    if (text) {
      gsap.to(text, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
      });
    }
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-50 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 flex justify-between items-center"
    >
      {/* BACKGROUND BLUR STRIP */}
      {/* We separate this to keep the text sharp while blurring the background */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm border-b border-white/5" />

      {/* 1. LOGO AREA */}
      <div ref={logoRef} className="relative z-10 flex items-center gap-2 cursor-pointer group" onClick={() => { trigger(30); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
          <div className="w-2.5 h-2.5 bg-white rounded-full group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-white font-bold tracking-widest text-[10px] sm:text-xs md:text-sm uppercase font-display">
          KEERTHAN <span className="text-white/40 mx-0.5 sm:mx-1">/</span> Editor
        </span>
      </div>

      {/* 2. NAVIGATION */}
      <nav ref={navRef} className="relative z-10 hidden md:flex items-center gap-12">
        {([
          { label: 'Work', id: 'work' },
          { label: 'Showreel', id: 'showreel' },
          { label: 'Process', id: 'process' },
          { label: 'About', id: 'about' },
        ] as { label: string; id: string }[]).map(({ label, id }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="nav-link text-gray-400 text-xs font-bold uppercase tracking-[0.2em] font-display transition-colors"
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* 3. CTA & STATUS */}
      <div className="relative z-10 flex items-center gap-3 sm:gap-4 md:gap-6">
        {/* Availability Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest font-display">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          Available
        </div>

        {/* Primary Button */}
        <a
          ref={ctaRef}
          href="https://wa.me/919620020041?text=Hi%2C%20I%20am%20interested%20in%20your%20work.%20I%20want%20to%20discuss%20in%20detail."
          target="_blank"
          rel="noopener noreferrer"
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          onClick={() => trigger('success')}
          className="group relative px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 overflow-hidden rounded-full bg-white text-black text-[10px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase font-display transition-transform duration-300"
        >
          <span className="relative z-10 group-hover:text-white transition-colors duration-300 inline-block">Let's Talk</span>
          <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
      </div>
    </header>
  );
};

export default Header;