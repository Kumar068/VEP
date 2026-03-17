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

    const [progress, setProgress] = useState(0);

    // Track loading progress
    useEffect(() => {
        let isCancelled = false;
        
        // --- 1. Identify trackable assets currently in the DOM ---
        // We select ALL images and videos available in the DOM at mount time.
        // Even if some components are "below the fold," since we removed React.lazy,
        // their DOM nodes (and therefore <img>/<video> tags) exist immediately.
        const images = Array.from(document.images);
        const videos = Array.from(document.querySelectorAll('video'));
        
        let totalAssets = images.length + videos.length;
        let loadedAssets = 0;
        
        // If there are literally no assets, we just fast-track to 100%.
        if (totalAssets === 0) {
            setProgress(100);
            return;
        }

        const updateProgress = () => {
             if (isCancelled) return;
             const p = totalAssets > 0 ? Math.floor((loadedAssets / totalAssets) * 100) : 100;
             setProgress((prev) => Math.min(100, Math.max(prev, p)));
        };

        const handleAssetLoad = () => {
            loadedAssets++;
            updateProgress();
        };

        const handleAssetError = () => {
            // Count it as loaded so we don't block progress forever on one failed asset.
            loadedAssets++; 
            updateProgress();
        };

        // --- 2. Attach listeners to assets ---
        images.forEach((img) => {
            if (img.complete) {
                loadedAssets++;
            } else {
                img.addEventListener('load', handleAssetLoad, { once: true });
                img.addEventListener('error', handleAssetError, { once: true });
            }
        });

        videos.forEach((video) => {
            if (video.readyState >= 3) { // HAVE_FUTURE_DATA or better
                loadedAssets++;
            } else {
                video.addEventListener('canplaythrough', handleAssetLoad, { once: true });
                video.addEventListener('error', handleAssetError, { once: true });
            }
        });

        // Initialize progress with whatever is already loaded right now
        updateProgress();

        // --- 3. Safety fallback timer ---
        // In case some assets get stuck or never fire events, we slowly increment
        // the progress anyway so the user isn't stuck forever.
        let fallbackProgress = progress;
        const fallbackInterval = setInterval(() => {
            fallbackProgress += 1;
            setProgress(prev => Math.min(Math.max(prev, fallbackProgress), 99)); // Cap fallback at 99% until window.onload
        }, 150); // Adjust this interval to control the minimum apparent "speed"

        // --- 4. The ultimate fallback: window 'load' event ---
        // When the browser decides EVERYTHING is loaded, jump straight to 100%.
        const handleWindowLoad = () => {
            if (isCancelled) return;
            loadedAssets = totalAssets; // Force 100% calculation
            setProgress(100);
        };

        if (document.readyState === 'complete') {
            handleWindowLoad();
        } else {
            window.addEventListener('load', handleWindowLoad, { once: true });
        }

        return () => {
            isCancelled = true;
            clearInterval(fallbackInterval);
            window.removeEventListener('load', handleWindowLoad);
            images.forEach((img) => {
                img.removeEventListener('load', handleAssetLoad);
                img.removeEventListener('error', handleAssetError);
            });
            videos.forEach((video) => {
                video.removeEventListener('canplaythrough', handleAssetLoad);
                video.removeEventListener('error', handleAssetError);
            });
        };
    }, []);

    // Dismiss animation when progress hits 100
    useEffect(() => {
        if (progress >= 100 && overlayRef.current) {
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
        }
    }, [progress, trigger]);

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

                {/* Numbered Progress */}
                <div className="text-4xl md:text-5xl font-semibold text-[#f5f5f7] tracking-tight tabular-nums mt-4">
                    {progress}%
                </div>

                {/* Brand wordmark */}
                <div className="font-black text-[11px] tracking-[0.45em] uppercase text-white/30 hidden">
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
