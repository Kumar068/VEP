import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useHaptics } from '../hooks/useHaptics';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── Social link data ────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
    {
        label: 'Instagram',
        href: 'https://instagram.com/',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
        ),
    },
    {
        label: 'YouTube',
        href: 'https://youtube.com/',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" opacity=".9" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#000" />
            </svg>
        ),
    },
    {
        label: 'LinkedIn',
        href: 'https://linkedin.com/',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </svg>
        ),
    },
    {
        label: 'X (Twitter)',
        href: 'https://x.com/',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
];

const Footer: React.FC = () => {
    const footerRef = useRef<HTMLElement>(null);
    const { trigger } = useHaptics();

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
                className="absolute -bottom-6 -left-4 font-black text-[30vw] md:text-[18vw] leading-none text-white/[0.022] select-none pointer-events-none uppercase tracking-tighter"
                aria-hidden="true"
            >
                CONTACT
            </div>

            <div className="relative px-6 md:px-20 py-14 md:py-24 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-12 items-end">

                {/* ── Left: CTA block ─────────────────────────────────────────── */}
                <div>
                    <h2
                        className="footer-heading font-black leading-[0.88] uppercase tracking-tight mb-8"
                        style={{ fontSize: 'clamp(2rem,6.5vw,6rem)' }}
                    >
                        Let's Make<br />
                        Something<br />
                        <span className="font-serif italic font-normal" style={{ color: '#1152d4', WebkitTextStroke: '0px' }}>
                            Unforgettable.
                        </span>
                    </h2>

                    <a
                        href="https://wa.me/919620020041?text=Hi%2C%20I%20am%20interested%20in%20your%20work.%20I%20want%20to%20discuss%20in%20detail."
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trigger('success')}
                        className="footer-email group inline-block font-serif italic text-[#25D366] hover:text-[#4fe888] transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#25D366]"
                        style={{ fontSize: 'clamp(0.9rem,2.8vw,2.5rem)' }}
                    >
                        <span className="inline-flex items-center gap-2 md:gap-3">
                            WhatsApp Me
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                                alt="WhatsApp"
                                className="w-5 h-5 md:w-7 md:h-7 opacity-60 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200"
                                aria-hidden="true"
                            />
                        </span>
                    </a>

                    <div className="mt-6 sm:mt-10 flex items-center gap-4">
                        <span className="inline-flex items-center gap-2 border border-white/[0.12] rounded-full px-4 py-2">
                            <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/50">Available for work</span>
                        </span>
                    </div>
                </div>

                {/* ── Right: meta block ────────────────────────────────────────── */}
                <div className="footer-meta text-left md:text-right">
                    {/* role + location */}
                    <div className="mb-6 space-y-1">
                        <div className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">Video Editor</div>
                        <div className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">Post-Production</div>
                        <div className="font-mono text-[9px] tracking-[0.2em] text-white/20 uppercase">Bengaluru, India</div>
                    </div>

                    {/* ── Social icons ────────────────────────────────────────── */}
                    <div className="flex items-center gap-3 mb-6 md:justify-end">
                        {SOCIAL_LINKS.map(({ label, href, icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                onClick={() => trigger(30)}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/[0.1] text-white/30 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all duration-200"
                            >
                                <span className="w-[15px] h-[15px]">{icon}</span>
                            </a>
                        ))}
                    </div>

                    {/* nav links */}
                    <nav aria-label="Footer navigation">
                        <ul className="space-y-2">
                            {['Work', 'Process', 'About', 'Contact'].map(link => (
                                <li key={link}>
                                    <a
                                        href={`#${link.toLowerCase()}`}
                                        onClick={() => trigger(30)}
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
            <div className="relative px-6 md:px-20 py-4 md:py-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="font-mono text-[8px] tracking-[0.2em] text-white/15 uppercase">
                    © 2026 KEERTHAN — All rights reserved
                </span>

                {/* Social icons repeated in bottom bar for mobile visibility */}
                <div className="flex items-center gap-2 sm:hidden">
                    {SOCIAL_LINKS.map(({ label, href, icon }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            onClick={() => trigger(30)}
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-white/[0.08] text-white/20 hover:text-white hover:border-white/25 transition-all duration-200"
                        >
                            <span className="w-[13px] h-[13px]">{icon}</span>
                        </a>
                    ))}
                </div>

                <span className="font-mono text-[8px] tracking-[0.15em] text-white/[0.08] uppercase">
                    VEP v2.0
                </span>
            </div>
        </footer>
    );
};

export default Footer;
