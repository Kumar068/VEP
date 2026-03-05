import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useHaptics } from '../hooks/useHaptics';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const FRAME_URL = (index: number) =>
    `/content/images/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const StopMotionSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [framesLoaded, setFramesLoaded] = useState(0);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const { trigger } = useHaptics();
    const lastHapticFrame = useRef(0);

    // ── Detect mobile (<768px) ──────────────────────────────────────────
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    // ── Preload frames ──────────────────────────────────────────────────
    useEffect(() => {
        // On mobile, only load 1 frame for the static background
        const framesToLoad = isMobile ? 1 : FRAME_COUNT;
        const loadedImages: HTMLImageElement[] = [];
        let count = 0;
        let isCancelled = false;

        const onDone = () => {
            setImages(loadedImages);
            setTimeout(() => ScrollTrigger.refresh(), 100);
        };

        const handleLoad = (img: HTMLImageElement) => {
            if (isCancelled) return;
            count++;
            setFramesLoaded(count);
            if (count === framesToLoad) onDone();
        };

        const handleError = () => {
            if (isCancelled) return;
            count++;
            setFramesLoaded(count);
            if (count === framesToLoad) onDone();
        };

        for (let i = 1; i <= framesToLoad; i++) {
            const img = new Image();
            img.onload = () => handleLoad(img);
            img.onerror = handleError;
            img.src = FRAME_URL(i);
            loadedImages.push(img);
        }

        return () => { isCancelled = true; };
    }, [isMobile]);

    // ── Render a single frame to canvas ─────────────────────────────────
    const renderFrame = (index: number) => {
        if (images.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = images[index];

        if (canvas && ctx && img) {
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    };

    // ── GSAP animations — DESKTOP ONLY ──────────────────────────────────
    useGSAP(() => {
        if (images.length === 0) return;

        // Always render first frame + handle resize
        renderFrame(0);
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(0);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        // Mobile: static canvas, no GSAP scroll/pin
        if (isMobile) {
            return () => window.removeEventListener('resize', handleResize);
        }

        // Desktop: full scroll-driven animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=1000%",
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                onRefresh: () => {
                    if (images.length < FRAME_COUNT) return;
                    const currentProgress = tl.scrollTrigger?.progress || 0;
                    const totalFrames = (FRAME_COUNT - 1) * 2;
                    const frameIdx = Math.round(currentProgress * totalFrames);
                    const mappedIdx = frameIdx <= (FRAME_COUNT - 1)
                        ? frameIdx
                        : (totalFrames - frameIdx);
                    renderFrame(mappedIdx);
                }
            }
        });

        const maxFrameIndex = FRAME_COUNT - 1;
        const totalFrames = maxFrameIndex * 2;

        tl.to({ frame: 0 }, {
            frame: totalFrames,
            snap: "frame",
            ease: "none",
            duration: 30,
            onUpdate: function () {
                if (images.length === 0) return;
                const currentProgress = Math.round(this.targets()[0].frame);
                const frameIndex = currentProgress <= maxFrameIndex
                    ? currentProgress
                    : (maxFrameIndex * 2) - currentProgress;

                // Haptic pulse every ~10 frames for tactile filmstrip feel
                if (Math.abs(frameIndex - lastHapticFrame.current) >= 10) {
                    lastHapticFrame.current = frameIndex;
                    trigger(20);
                }

                renderFrame(frameIndex);
            }
        }, 0);

        // Kinetic text reveal — desktop only
        const words = containerRef.current?.querySelectorAll<HTMLElement>('.text-word');
        if (words && words.length > 0) {
            tl.fromTo(words,
                { opacity: 0, y: 50, filter: "blur(10px)", scale: 0.8 },
                {
                    opacity: 1, y: 0, filter: "blur(0px)", scale: 1,
                    stagger: { amount: 28 }, duration: 2, ease: "power3.out",
                },
                0
            );
        }

        tl.to(canvasRef.current, {
            scale: 0.9, filter: "brightness(0.5)", ease: "power1.inOut"
        }, ">-0.5");

        return () => window.removeEventListener('resize', handleResize);
    }, { dependencies: [images, isMobile], scope: containerRef });

    const bioText = "I'm Keerthan, a Senior Video Editor currently working at a digital marketing agency, specializing in high-retention content. With experience across 30+ industries and a 1st place win in Karnataka's competitive editing challenge.";

    const loadTarget = isMobile ? 1 : FRAME_COUNT;

    return (
        <div id="about" ref={containerRef} className="relative w-full min-h-screen md:h-screen bg-[#0a0a0a] overflow-hidden font-sans" style={{ scrollMarginTop: '80px' }}>
            {/* Progress Loader */}
            {framesLoaded < loadTarget && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
                    <div className="text-white text-3xl md:text-5xl font-black italic tracking-tighter">
                        {Math.round((framesLoaded / loadTarget) * 100)}%
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="block w-full h-full object-cover will-change-transform"
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-6 md:justify-end md:pr-24 pointer-events-none">
                <div className="max-w-xs sm:max-w-sm md:max-w-2xl mix-blend-difference text-white text-center md:text-left">
                    <h2 className="text-3xl sm:text-5xl md:text-9xl font-black uppercase leading-[0.85] mb-4 sm:mb-6 md:mb-8 tracking-tighter font-display">
                        ABOUT<br /><span className="text-transparent font-serif italic" style={{ WebkitTextStroke: '1px white' }}>ME.</span>
                    </h2>

                    <p className="text-sm sm:text-base md:text-2xl font-medium leading-relaxed sm:leading-snug md:leading-tight flex flex-wrap justify-center md:justify-start gap-x-1.5 sm:gap-x-2 overflow-hidden font-display opacity-80">
                        {bioText.split(" ").map((word, i) => (
                            <span
                                key={i}
                                className={`${isMobile ? '' : 'text-word'} inline-block origin-left`}
                                style={isMobile ? {} : { opacity: 0 }}
                            >
                                {word}&nbsp;
                            </span>
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StopMotionSection;