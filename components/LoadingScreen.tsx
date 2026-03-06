import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useHaptics } from '../hooks/useHaptics';

// ─────────────────────────────────────────────────────────────────────────────
// LoadingScreen
// Stays visible until BOTH:
//   1. window 'load' has fired (all network resources resolved), AND
//   2. the 'app:ready' custom event fires (React Suspense chunks resolved)
// This prevents the flash of unstyled/partial content on mobile networks.
// ─────────────────────────────────────────────────────────────────────────────

const LoadingScreen: React.FC = () => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(true);
    const { trigger } = useHaptics();

    useEffect(() => {
        let windowLoaded = document.readyState === 'complete';
        let appReady = false;
        let hideScheduled = false;

        const tryHide = () => {
            // Only dismiss once BOTH gates are open
            if (!windowLoaded || !appReady || hideScheduled) return;
            hideScheduled = true;

            if (!overlayRef.current) return;

            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.inOut',
                delay: 0.2,
                onComplete: () => {
                    trigger('success');
                    setVisible(false);
                },
            });
        };

        const onWindowLoad = () => {
            windowLoaded = true;
            tryHide();
        };

        const onAppReady = () => {
            appReady = true;
            tryHide();
        };

        // Gate 1 — window load
        if (!windowLoaded) {
            window.addEventListener('load', onWindowLoad, { once: true });
        }

        // Gate 2 — React Suspense resolved (dispatched by AppReadySignal)
        window.addEventListener('app:ready', onAppReady, { once: true } as EventListenerOptions);

        // Failsafe: on very slow connections give up after 8s so the user
        // isn't stuck forever. Adjust as needed.
        const failsafe = setTimeout(() => {
            windowLoaded = true;
            appReady = true;
            tryHide();
        }, 8000);

        return () => {
            clearTimeout(failsafe);
            window.removeEventListener('load', onWindowLoad);
            window.removeEventListener('app:ready', onAppReady);
        };
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
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    src="/content/loader.webm"
                    className="w-32 h-32 object-contain"
                    onError={(e) => {
                        // Fallback: animated letter mark if no video present yet
                        (e.currentTarget as HTMLVideoElement).style.display = 'none';
                    }}
                />

                {/* Fallback spinner shown when no video */}
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
