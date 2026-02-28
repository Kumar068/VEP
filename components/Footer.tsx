import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Footer: React.FC = () => {
    const footerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        const heading = footerRef.current?.querySelector<HTMLElement>('.footer-heading');
        const email = footerRef.current?.querySelector<HTMLElement>('.footer-email');
        const meta = footerRef.current?.querySelector<HTMLElement>('.footer-meta');

        if (heading && email && meta) {
            gsap.fromTo([heading, email],
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.15, ease: 'power3.out', duration: 1,
                    scrollTrigger: { trigger: footerRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
                }
            );
            gsap.fromTo(meta,
                { opacity: 0 },
                {
                    opacity: 1, ease: 'power2.out', duration: 1, delay: 0.3,
                    scrollTrigger: { trigger: footerRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
                }
            );
        }
    }, { scope: footerRef });

    return (
        <footer
            ref={footerRef}
            id="contact"
            className="relative z-10 border-t border-white/[0.07] text-white overflow-hidden"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.012) 0%, transparent 100%)' }}
            aria-label="Contact footer"
        >
            {/* oversized ghost text */}
            <div
                className="absolute -bottom-6 -left-4 font-black text-[18vw] leading-none text-white/[0.022] select-none pointer-events-none uppercase tracking-tighter"
                aria-hidden="true"
            >
                CONTACT
            </div>

            <div className="relative px-8 md:px-20 py-20 md:py-24 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-end">

                {/* ── Left: CTA block ─────────────────────────────────────────── */}
                <div>
                    {/* section label */}
                    <div className="flex items-center gap-4 mb-10">
                        <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/25">— 05</span>
                        <div className="h-px flex-1 bg-white/[0.07]" />
                        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-blue-500">Get in Touch</span>
                    </div>

                    {/* heading */}
                    <h2
                        className="footer-heading font-black leading-[0.88] uppercase tracking-tight mb-8"
                        style={{ fontSize: 'clamp(2.6rem,6.5vw,6rem)' }}
                    >
                        Let's Make<br />
                        Something<br />
                        <span className="font-serif italic font-normal" style={{ color: '#1152d4', WebkitTextStroke: '0px' }}>
                            Unforgettable.
                        </span>
                    </h2>

                    {/* email */}
                    <a
                        href="mailto:hello@johndoe.film"
                        className="footer-email group inline-block font-serif italic text-blue-400 hover:text-blue-300 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        style={{ fontSize: 'clamp(1.25rem,2.8vw,2.5rem)' }}
                    >
                        <span className="inline-flex items-center gap-3">
                            hello@johndoe.film
                            <svg
                                className="opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200"
                                width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.5"
                                aria-hidden="true"
                            >
                                <line x1="0" y1="7" x2="15" y2="7" />
                                <polyline points="9,1 15,7 9,13" />
                            </svg>
                        </span>
                    </a>

                    {/* social / availability pill */}
                    <div className="mt-10 flex items-center gap-4">
                        <span className="inline-flex items-center gap-2 border border-white/[0.12] rounded-full px-4 py-2">
                            <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/50">Available for work</span>
                        </span>
                    </div>
                </div>

                {/* ── Right: meta block ────────────────────────────────────────── */}
                <div className="footer-meta text-right md:text-right text-left">
                    {/* role + location */}
                    <div className="mb-6 space-y-1">
                        <div className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">Video Editor</div>
                        <div className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">Post-Production</div>
                        <div className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">Bengaluru, India</div>
                    </div>

                    {/* nav links */}
                    <nav aria-label="Footer navigation">
                        <ul className="space-y-2">
                            {['Work', 'Process', 'About', 'Contact'].map(link => (
                                <li key={link}>
                                    <a
                                        href={`#${link.toLowerCase()}`}
                                        className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 hover:text-blue-400 transition-colors duration-200"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>

            {/* ── Bottom bar ──────────────────────────────────────────────── */}
            <div className="relative px-8 md:px-20 py-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="font-mono text-[8px] tracking-[0.2em] text-white/15 uppercase">
                    © 2026 John Doe — All rights reserved
                </span>
                <span className="font-mono text-[8px] tracking-[0.15em] text-white/[0.08] uppercase">
                    VEP v2.0
                </span>
            </div>
        </footer>
    );
};

export default Footer;
