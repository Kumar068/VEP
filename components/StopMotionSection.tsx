import React, { useRef, useState, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 240;
const FRAME_URL = (index: number) =>
    `/content/images/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const StopMotionSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const [framesLoaded, setFramesLoaded] = useState(0);
    const [images, setImages] = useState<HTMLImageElement[]>([]);

    // Optimized Preloading
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let count = 0;

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = FRAME_URL(i);
            img.onload = () => {
                count++;
                setFramesLoaded(count);
                if (count === FRAME_COUNT) setImages(loadedImages);
            };
            loadedImages.push(img);
        }
    }, []);

    const renderFrame = (index: number) => {
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

    useGSAP(() => {
        if (images.length < FRAME_COUNT) return;

        // 1. Initial Frame Render
        renderFrame(0);

        // 2. Timeline for Master Orchestration
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=1000%", // Doubled scroll distance for 1/2 speed
                pin: true,
                scrub: 1, // Smooth catch-up effect
            }
        });

        // 3. Animate Canvas Frames with Yoyo Loop
        // Sequence: 0 -> 239 -> 0
        const maxFrameIndex = FRAME_COUNT - 1;
        const totalFrames = maxFrameIndex * 2; // e.g. 0 to 478

        tl.to({ frame: 0 }, {
            frame: totalFrames,
            snap: "frame",
            ease: "none",
            duration: 5, // Extends frame animation
            onUpdate: function () {
                const currentProgress = Math.round(this.targets()[0].frame);
                // Map progress to frame index: 0->239 then 239->0
                const frameIndex = currentProgress <= maxFrameIndex
                    ? currentProgress
                    : (maxFrameIndex * 2) - currentProgress;

                renderFrame(frameIndex);
            }
        }, 0);

        // 4. Kinetic Text Reveal
        const words = gsap.utils.toArray<HTMLElement>('.text-word');
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
                stagger: 0.1,
                duration: 1, // Per word fade
                ease: "power3.out",
            },
            0 // Start together with frames
        );

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

    const bioText = "I am a creative developer passionate about building immersive digital experiences. With a keen eye for design and a strong technical background, I bridge the gap between visual aesthetics and functional performance.";

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden font-sans">
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
                <div ref={textRef} className="max-w-2xl mix-blend-difference text-white">
                    <h2 className="text-7xl md:text-9xl font-black uppercase leading-[0.8] mb-8 tracking-tighter">
                        ABOUT<br /><span className="text-outline-white">ME.</span>
                    </h2>

                    <p className="text-xl md:text-2xl font-medium leading-tight flex flex-wrap gap-x-2 overflow-hidden">
                        {bioText.split(" ").map((word, i) => (
                            <span key={i} className="text-word inline-block origin-left">
                                {word}
                            </span>
                        ))}
                    </p>
                </div>
            </div>

            {/* Floating Footer Element */}
            <div className="absolute bottom-10 left-10 z-30 mix-blend-difference text-white opacity-40 uppercase text-xs tracking-[0.5em]">
                Scroll to explore sequence
            </div>

            <style jsx>{`
                .text-outline-white {
                    color: transparent;
                    -webkit-text-stroke: 1px white;
                }
            `}</style>
        </div>
    );
};

export default StopMotionSection;