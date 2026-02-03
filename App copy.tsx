
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Background from './components/Background';
import Navigation from './components/Navigation';
import ProjectCard from './components/ProjectCard';
import { PROJECTS, STATS } from './constants';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {


    const ctx = gsap.context(() => {
      // 1. Initial Hero Entrance
      gsap.to(heroRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2
      });

      // 2. Scroll Animations for main sections
      const sections = [aboutRef.current]; // Removing worksRef from generic fade, handling it specifically
      sections.forEach((section) => {
        if (!section) return;
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      /*
      // 3a. Work Section Header Entrance
      gsap.from('#work-header', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out', // Simple ease
        scrollTrigger: {
          trigger: '#work',
          start: 'top bottom', // Trigger as soon as section hits bottom of viewpoint
          toggleActions: 'play none none reverse'
        }
      });

      // 3b. Individual Card Zoom Entrances
      const cards = gsap.utils.toArray<HTMLElement>('.project-card-anim');
      cards.forEach((card) => {
        gsap.fromTo(card,
          {
            scale: 1.15,
            opacity: 0,
            y: 50
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 60%',
              scrub: 1,
            }
          }
        );
      });
      */

      // 4. Parallax effect for the main glass pane
      gsap.to('.glass-pane', {
        scale: 1.02,
        scrollTrigger: {
          trigger: '.glass-pane',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // 5. Stat cards entrance
      gsap.from('.stat-card', {
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#stats-container',
          start: 'top 90%',
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <Background />
      <Navigation />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-32 pb-24 px-4 md:px-6 lg:px-8">
        <main className="glass-pane w-full max-w-[1200px] rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 lg:p-20 flex flex-col gap-24 md:gap-32 relative">

          {/* Hero Section */}
          <section ref={heroRef} className="flex flex-col gap-10 relative z-10 mt-4 md:mt-10">
            {/* Background Video for Hero */}
            <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden pointer-events-none">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover opacity-40 mix-blend-lighten grayscale-[0.3]"
              >
                <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-dark-ink-2458-large.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
            </div>

            <div className="flex flex-col gap-6 max-w-4xl">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 w-fit backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/90">Booking 2026</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-extrabold tracking-tight leading-[0.9]">
                I'm <br />
                <span className="text-gradient">Keerthan.</span>
              </h1>
              <p className="text-lg md:text-2xl text-white/60 max-w-2xl font-light leading-relaxed">
                Crafting narratives through rhythm, color, and motion. Defining the visual language of the future, frame by frame.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <button className="group relative flex items-center justify-center gap-3 h-14 pl-8 pr-6 rounded-full bg-white text-background-dark text-base font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden">
                <span className="relative z-10">Watch Showreel</span>
                <div className="relative z-10 size-8 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-45">arrow_outward</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
              <a
                className="flex items-center justify-center h-14 px-8 rounded-full border border-white/10 bg-white/5 text-white text-base font-medium hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                href="#work"
              >
                View Projects
              </a>
            </div>
          </section>

          {/* Selected Works Grid */}
          {/* Selected Works Grid */}
          <section ref={worksRef} className="flex flex-col gap-12" id="work">
            <div id="work-header" className="flex items-end justify-between border-b border-white/5 pb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Selected Works</h2>
              <a className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-white transition-colors group" href="#">
                View Full Archive
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
            <div id="work-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {PROJECTS.map((project, idx) => (
                <div key={project.id} className="relative">
                  <ProjectCard project={project} offset={idx % 2 === 1} />
                </div>
              ))}
            </div>
          </section>

          {/* Philosophy Section */}
          <section ref={aboutRef} className="flex flex-col xl:flex-row gap-16 items-start py-12 border-t border-white/5 relative" id="about">
            <div className="absolute right-0 top-20 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
            <div className="w-full xl:w-1/3 sticky top-32">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
                <span className="w-8 h-px bg-primary"></span>
                Philosophy
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold leading-tight text-white mb-6">The Edit Is The Final Rewrite.</h3>
              <p className="text-white/50 text-sm font-mono uppercase tracking-widest">EST. 2018 — NEW YORK / TOKYO</p>
            </div>
            <div className="w-full xl:w-2/3 flex flex-col gap-8 relative z-10">
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                I believe that editing is more than just cutting footage. It's about finding the pulse of the story. In 2026, where attention is the most valuable currency, <span className="text-white font-semibold">rhythm and pacing</span> are the tools we use to captivate.
              </p>
              <div id="stats-container" className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {STATS.map((stat) => (
                  <div key={stat.id} className="stat-card glass-shard p-6 rounded-2xl flex flex-col gap-2">
                    <span className="material-symbols-outlined text-primary mb-2">{stat.icon}</span>
                    <span className="block text-3xl font-bold text-white">{stat.value}</span>
                    <span className="text-xs text-white/50 uppercase tracking-widest font-bold">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col md:flex-row justify-between items-center gap-8 w-full pt-12 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="size-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="font-black text-lg">VS</span>
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg">Visual Storyteller</div>
                <div className="text-sm text-white/40">© 2026 All Rights Reserved</div>
              </div>
            </div>
            <div className="flex gap-4">
              <a aria-label="Email" className="group size-12 flex items-center justify-center rounded-full glass-shard hover:bg-white/20 hover:text-white transition-all text-white/70" href="mailto:contact@visualstoryteller.com">
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">mail</span>
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
