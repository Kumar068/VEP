import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Text Animation Types
type TextAnimationType = 'fade-up' | 'glitch' | 'cinema-mask' | 'focus' | 'condense' | 'outline-fill';

type ScrollItem =
  | { type: 'text'; content: string; animation: TextAnimationType }
  | { type: 'sticker'; variant: 'rec' | 'waveform' | 'timeline' | 'cut' };

const items: ScrollItem[] = [
  { type: 'text', content: "THE ART OF", animation: 'fade-up' },
  { type: 'sticker', variant: 'rec' },
  { type: 'text', content: "VISUAL", animation: 'glitch' },
  { type: 'sticker', variant: 'timeline' },
  { type: 'text', content: "STORYTELLING", animation: 'cinema-mask' },
  { type: 'sticker', variant: 'waveform' },
  { type: 'text', content: "PRECISION", animation: 'focus' },
  { type: 'sticker', variant: 'cut' },
  { type: 'text', content: "MEETS", animation: 'condense' },
  { type: 'text', content: "CREATIVITY", animation: 'outline-fill' }
];

// Interactive Wrapper for Stickers
const StickerWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg rotation
    const rotateY = ((x - centerX) / centerX) * 15;

    gsap.to(ref.current, {
      duration: 0.5,
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.1,
      ease: "power2.out",
      transformPerspective: 1000,
      transformOrigin: "center"
    });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      duration: 0.8,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer transition-transform will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

// Text Animator Component
const TextAnimator: React.FC<{ content: string; animation: TextAnimationType; fontSizeClass: string; containerTween: gsap.core.Tween | null }> = ({ content, animation, fontSizeClass, containerTween }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !containerTween) return;

    const ctx = gsap.context(() => {
      // Target the specific element for animation
      const target = el.querySelector('.anim-target');
      if (!target) return;

      switch (animation) {
        case 'fade-up':
          gsap.fromTo(target,
            { y: 100, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 1, ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                containerAnimation: containerTween,
                start: "left 80%",
                toggleActions: "play reverse play reverse",
              }
            }
          );
          break;

        case 'cinema-mask':
          // Animate clip-path to reveal
          gsap.fromTo(target,
            { clipPath: "inset(0 50% 0 50%)" },
            {
              clipPath: "inset(0 0% 0 0%)", duration: 1, ease: 'power4.inOut',
              scrollTrigger: {
                trigger: el,
                containerAnimation: containerTween,
                start: "left 70%",
                toggleActions: "play reverse play reverse"
              }
            }
          );
          break;

        case 'focus':
          gsap.fromTo(target,
            { filter: "blur(20px)", opacity: 0 },
            {
              filter: "blur(0px)", opacity: 1, duration: 1,
              scrollTrigger: {
                trigger: el, containerAnimation: containerTween,
                start: "left 70%", end: "center center", scrub: 1
              }
            }
          );
          break;

        case 'condense':
          gsap.fromTo(target,
            { letterSpacing: "1em", opacity: 0 },
            {
              letterSpacing: "normal", opacity: 1, duration: 1,
              scrollTrigger: {
                trigger: el, containerAnimation: containerTween,
                start: "left 80%", end: "center center", scrub: 1
              }
            }
          );
          break;

        case 'outline-fill':
          gsap.to(el.querySelector('.fill-layer'), {
            clipPath: "inset(0 0% 0 0)",
            scrollTrigger: {
              trigger: el, containerAnimation: containerTween,
              start: "left 60%", end: "right 60%", scrub: 1
            }
          });
          break;

        case 'glitch':
          // Continuous glitch effect triggered when in view
          ScrollTrigger.create({
            trigger: el,
            containerAnimation: containerTween,
            start: "left 90%",
            onEnter: () => {
              gsap.to(el.querySelectorAll('.glitch-layer'), {
                keyframes: [
                  { x: 0, opacity: 1 },
                  { x: -5, opacity: 0.8, skewX: 20, duration: 0.1 },
                  { x: 5, opacity: 0.8, skewX: -20, duration: 0.1 },
                  { x: 0, opacity: 1, skewX: 0, duration: 0.1 },
                  { duration: 2 } // delay
                ],
                repeat: -1
              });
            },
            onLeave: () => gsap.killTweensOf(el.querySelectorAll('.glitch-layer')),
            onEnterBack: () => {
              gsap.to(el.querySelectorAll('.glitch-layer'), {
                keyframes: [
                  { x: 0, opacity: 1 },
                  { x: -5, opacity: 0.8, skewX: 20, duration: 0.1 },
                  { x: 5, opacity: 0.8, skewX: -20, duration: 0.1 },
                  { x: 0, opacity: 1, skewX: 0, duration: 0.1 },
                  { duration: 2 }
                ],
                repeat: -1
              });
            },
            onLeaveBack: () => gsap.killTweensOf(el.querySelectorAll('.glitch-layer'))
          });
          break;
      }

    }, ref);

    return () => ctx.revert();
  }, [animation, containerTween]);

  // Render content based on animation type
  const renderContent = () => {
    const commonClasses = `${fontSizeClass} font-black tracking-tighter leading-none whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none anim-target`;

    switch (animation) {
      case 'outline-fill':
        return (
          <h2 className={`${fontSizeClass} font-black tracking-tighter leading-none whitespace-nowrap relative select-none anim-target`}>
            <span className="fill-layer absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40" style={{ clipPath: 'inset(0 100% 0 0)' }}>
              {content}
            </span>
            <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>
              {content}
            </span>
          </h2>
        );
      case 'glitch':
        return (
          <div className="relative anim-target">
            <h2 className={`${fontSizeClass} font-black tracking-tighter leading-none whitespace-nowrap text-white mix-blend-difference relative z-10`}>{content}</h2>
            <h2 className={`glitch-layer ${fontSizeClass} font-black tracking-tighter leading-none whitespace-nowrap text-red-500 absolute top-0 left-0 opacity-50`}
              style={{ transform: 'translate(-2px, 2px)' }}>{content}</h2>
            <h2 className={`glitch-layer ${fontSizeClass} font-black tracking-tighter leading-none whitespace-nowrap text-blue-500 absolute top-0 left-0 opacity-50`}
              style={{ transform: 'translate(2px, -2px)' }}>{content}</h2>
          </div>
        );
      case 'condense':
        // override commonClasses to allow letterSpacing anim
        return <h2 className={`${fontSizeClass} font-black tracking-tighter leading-none whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none anim-target`} style={{ letterSpacing: '1em' }}>{content}</h2>;
      default:
        return (
          <h2 className={commonClasses}>
            {content}
          </h2>
        );
    }
  };

  return (
    <div ref={ref} className="will-change-transform scroll-parallax-target">
      {renderContent()}
    </div>
  );
};

const HorizontalScrollSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [horizTween, setHorizTween] = React.useState<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".scroll-section");

      const tween = gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          // Shortened duration for faster scroll speed
          end: () => "+=" + (triggerRef.current?.offsetWidth || 0) * 0.5,
        }
      });
      setHorizTween(tween);

    }, sectionRef);

    // Global Cursor Parallax Effect - Applied to Inner Content
    const cursor = { x: 0, y: 0 };
    const moveCursor = (e: MouseEvent) => {
      cursor.x = (e.clientX / window.innerWidth - 0.5);
      cursor.y = (e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", moveCursor);

    gsap.ticker.add(() => {
      // Animate inner content for parallax, NOT the wrapper which ScrollTrigger pins
      gsap.to(".scroll-parallax-target", {
        x: cursor.x * 50,  // Move heavily based on cursor
        y: cursor.y * 30,
        duration: 1,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    return () => ctx.revert();
  }, []);

  // Helper to render stickers (re-integrated here to share scope/types if needed, but easier inline above or kept as is)
  const renderSticker = (variant: string) => {
    const content = (() => {
      switch (variant) {
        case 'rec':
          return (
            <div className="w-[40vw] h-[40vw] md:w-[20vw] md:h-[20vw] border-4 border-red-500 rounded-3xl flex items-center justify-center relative bg-black/50 backdrop-blur-sm shadow-[0_20px_50px_rgba(239,68,68,0.3)]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 md:w-16 md:h-16 bg-red-500 rounded-full animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)]"></div>
                <span className="text-3xl md:text-5xl font-mono font-bold text-white tracking-widest">REC</span>
              </div>
              <div className="absolute top-4 left-4 w-6 h-6 border-l-4 border-t-4 border-white/50"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-r-4 border-t-4 border-white/50"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-4 border-b-4 border-white/50"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-4 border-b-4 border-white/50"></div>
            </div>
          );
        case 'timeline':
          return (
            <div className="w-[60vw] h-[30vw] md:w-[40vw] md:h-[15vw] flex flex-col justify-center gap-2 relative bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 text-blue-500 font-mono text-xl font-bold tracking-widest">00:01:24:12</div>
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-blue-500 z-10 shadow-[0_0_15px_#3b82f6]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rotate-45"></div>
              </div>
              <div className="h-12 w-full bg-gray-800/80 rounded flex overflow-hidden opacity-90 border border-white/5">
                <div className="w-1/3 bg-blue-600/60 h-full border-r-2 border-black/50"></div>
                <div className="w-1/4 bg-blue-400/60 h-full border-r-2 border-black/50"></div>
                <div className="w-1/2 bg-blue-500/60 h-full"></div>
              </div>
              <div className="h-12 w-full bg-gray-800/80 rounded flex overflow-hidden opacity-70 border border-white/5">
                <div className="w-1/2 bg-purple-600/60 h-full border-r-2 border-black/50"></div>
                <div className="w-1/2 bg-purple-400/60 h-full"></div>
              </div>
            </div>
          );
        case 'waveform':
          return (
            <div className="flex items-center gap-2 md:gap-3 h-[30vh] px-8 py-4 bg-black/20 rounded-2xl border border-white/5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 md:w-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0.9
                  }}
                ></div>
              ))}
            </div>
          );
        case 'cut':
          return (
            <div className="relative text-white w-[30vh] h-[30vh] flex items-center justify-center">
              <div className="text-[12vw] font-black opacity-10 select-none absolute">CUT</div>
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="w-1 h-full bg-red-600 rotate-12 relative shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-red-500 border-2 border-red-500 px-4 py-1 font-mono font-bold text-xl -rotate-12 hover:bg-red-600 hover:text-white transition-colors duration-300">
                    SPLIT
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    })();

    return <StickerWrapper>{content}</StickerWrapper>;
  };

  return (
    <div ref={sectionRef} className="relative text-white overflow-hidden">
      {/* Trigger Wrapper - Width depends on number of items */}
      <div
        ref={triggerRef}
        className="h-screen flex flex-row flex-nowrap"
        style={{ width: `${items.length * 100}vw` }}
      >

        {/* Render Items */}
        {items.map((item, index) => {
          if (item.type === 'sticker') {
            return (
              <div
                key={index}
                className="scroll-section w-screen h-screen flex justify-center items-center shrink-0 relative overflow-hidden"
              >
                <div className="scroll-parallax-target">
                  {renderSticker(item.variant)}
                </div>
              </div>
            );
          }

          // Text Type
          // Dynamic font size based on text length to prevent severe overflow
          const text = item.content;
          const isLong = text.length > 9;
          const fontSizeClass = isLong ? "text-[12vw] md:text-[14vw]" : "text-[15vw] md:text-[20vw]";

          return (
            <div
              key={index}
              className="scroll-section w-screen h-screen flex justify-center items-center shrink-0 relative overflow-hidden"
            >
              {/* Massive Text with Animation */}
              {horizTween && (
                <TextAnimator
                  content={text}
                  animation={item.animation}
                  fontSizeClass={fontSizeClass}
                  containerTween={horizTween}
                />
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default HorizontalScrollSection;
