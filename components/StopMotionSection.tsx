import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const FRAME_URL = (index: number) =>
    `/content/images/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const StopMotionSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [framesLoaded, setFramesLoaded] = useState(0);
    const [images, setImages] = useState<HTMLImageElement[]>([]);

    // Optimized Preloading
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let count = 0;
        let isCancelled = false;

        const handleImageLoad = (img: HTMLImageElement) => {
            if (isCancelled) return;
            count++;
            setFramesLoaded(count);
            if (count === FRAME_COUNT) {
                setImages(loadedImages);
                // Force refresh once everything is in place
                setTimeout(() => ScrollTrigger.refresh(), 100);
            }
        };

        const handleImageError = () => {
            if (isCancelled) return;
            count++; // Still increment to avoid getting stuck
            setFramesLoaded(count);
            if (count === FRAME_COUNT) {
                setImages(loadedImages);
                setTimeout(() => ScrollTrigger.refresh(), 100);
            }
        };

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.onload = () => handleImageLoad(img);
            img.onerror = () => handleImageError();
            img.src = FRAME_URL(i);
            loadedImages.push(img);
        }

        return () => { isCancelled = true; };
    }, []);

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

    useGSAP((context) => {
        if (images.length === 0) return;

        // 1. Initial Frame Render
        renderFrame(0);

        // 2. Timeline for Master Orchestration
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=1000%", // Doubled scroll distance for slower speed
                pin: true,
                scrub: 1, // Smooth catch-up effect
                anticipatePin: 1, // Fix jumping
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

        // 3. Animate Canvas Frames with Yoyo Loop
        const maxFrameIndex = FRAME_COUNT - 1;
        const totalFrames = maxFrameIndex * 2;

        tl.to({ frame: 0 }, {
            frame: totalFrames,
            snap: "frame",
            ease: "none",
            duration: 30, // Extends frame animation (doubled from previous 5 for halved speed)
            onUpdate: function () {
                if (images.length === 0) return;
                const currentProgress = Math.round(this.targets()[0].frame);
                const frameIndex = currentProgress <= maxFrameIndex
                    ? currentProgress
                    : (maxFrameIndex * 2) - currentProgress;

                renderFrame(frameIndex);
            }
        }, 0);

        // 4. Kinetic Text Reveal
        const words = context.selector?.('.text-word') as HTMLElement[];
        if (words && words.length > 0) {
            tl.fromTo(words,
                {
                    opacity: 0,
                    y: 50,
                    filter: "blur(10px)",
                    scale: 0.8
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    scale: 1,
                    stagger: { amount: 28 }, // Distribute text reveal across 28s
                    duration: 2, // Each word takes 2s (Total 28 + 2 = 30s)
                    ease: "power3.out",
                },
                0 // Start exactly with canvas frames
            );
        }

        // 5. Scale down the background slightly as we finish
        tl.to(canvasRef.current, {
            scale: 0.9,
            filter: "brightness(0.5)",
            ease: "power1.inOut"
        }, ">-0.5");

        // Resize Handler
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(0);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, { dependencies: [images], scope: containerRef });

    const bioText = "I’m Keerthan, a Senior Video Editor currently working at a digital marketing agency, specializing in high-retention content. With experience across 30+ industries and a 1st place win in Karnataka’s competitive editing challenge.";

    return (
        <div id="about" ref={containerRef} className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden font-sans">
            {/* Minimalist Progress Loader */}
            {framesLoaded < FRAME_COUNT && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
                    <div className="text-white text-5xl font-black italic tracking-tighter">
                        {Math.round((framesLoaded / FRAME_COUNT) * 100)}%
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="block w-full h-full object-cover will-change-transform"
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center md:justify-end md:pr-24 pointer-events-none">
                <div className="max-w-2xl mix-blend-difference text-white">
                    <h2 className="text-7xl md:text-9xl font-black uppercase leading-[0.8] mb-8 tracking-tighter font-display">
                        ABOUT<br /><span className="text-transparent font-serif italic" style={{ WebkitTextStroke: '1px white' }}>ME.</span>
                    </h2>

                    <p className="text-xl md:text-2xl font-medium leading-tight flex flex-wrap gap-x-2 overflow-hidden font-display opacity-80">
                        {bioText.split(" ").map((word, i) => (
                            <span key={i} className="text-word inline-block origin-left">
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