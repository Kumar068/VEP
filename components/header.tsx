import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Header: React.FC = () => {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
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

  }, []);

  const handleLinkHover = (e: React.MouseEvent) => {
    // Subtle magnetic drift for links
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

  return (
    <header 
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center"
    >
      {/* BACKGROUND BLUR STRIP */}
      {/* We separate this to keep the text sharp while blurring the background */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm border-b border-white/5" />

      {/* 1. LOGO AREA */}
      <div ref={logoRef} className="relative z-10 flex items-center gap-2 cursor-pointer group">
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
          <div className="w-2.5 h-2.5 bg-white rounded-full group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-white font-medium tracking-wide text-sm uppercase">
          John Doe <span className="text-white/40 mx-1">/</span> Editor
        </span>
      </div>

      {/* 2. NAVIGATION */}
      <nav ref={navRef} className="relative z-10 hidden md:flex items-center gap-12">
        {['Work', 'Showreel', 'Process', 'About'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="nav-link text-gray-400 text-sm font-medium uppercase tracking-wider transition-colors"
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
          >
            {item}
          </a>
        ))}
      </nav>

      {/* 3. CTA & STATUS */}
      <div className="relative z-10 flex items-center gap-6">
        {/* Availability Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-white/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Available for hire
        </div>

        {/* Primary Button */}
        <button 
          ref={ctaRef}
          className="group relative px-6 py-2 overflow-hidden rounded-full bg-white text-black text-sm font-bold tracking-wide hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10 group-hover:text-white transition-colors duration-300">Let's Talk</span>
          <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
      </div>
    </header>
  );
};

export default Header;