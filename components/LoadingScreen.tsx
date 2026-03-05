import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useHaptics } from '../hooks/useHaptics';

// ─────────────────────────────────────────────────────────────────────────────
// LoadingScreen
// Displays until window 'load' fires (all assets, videos, images resolved).
// Drop your GIF at /public/content/loader.gif
// ─────────────────────────────────────────────────────────────────────────────

const LoadingScreen: React.FC = () => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(true);
    const { trigger } = useHaptics();

    useEffect(() => {
        const hide = () => {
            if (!overlayRef.current) return;

            // Small delay so the last paint is visible before fade
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.inOut',
                delay: 0.3,
                onComplete: () => {
                    trigger('success');
                    setVisible(false);
                },
            });
        };

        if (document.readyState === 'complete') {
            // Already loaded (HMR re-mounts etc.)
            hide();
        } else {
            window.addEventListener('load', hide, { once: true });
        }

        return () => window.removeEventListener('load', hide);
    }, []);

    if (!visible) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
            aria-label="Loading"
            role="status"
        >
            {/* ── GIF / Logo ────────────────────────────────────────────────── */}
            <div className="relative flex flex-col items-center gap-6 select-none">
                <img
                    src="/content/loader.gif"
                    alt="Loading…"
                    className="w-32 h-32 object-contain"
                    onError={(e) => {
                        // Fallback: animated letter mark if no GIF present yet
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                />

                {/* Fallback spinner shown when no GIF */}
                <div
                    className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white"
                    style={{ animation: 'spin 0.9s linear infinite' }}
                    aria-hidden="true"
                />

                {/* Brand wordmark */}
                <div className="font-black text-[11px] tracking-[0.45em] uppercase text-white/30">
                    VEP · Loading
                </div>
            </div>

            {/* Top + bottom accent lines */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;
