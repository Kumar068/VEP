import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const phrases = [
  "THE ART OF",
  "VISUAL",
  "STORYTELLING",
  "PRECISION",
  "MEETS",
  "CREATIVITY"
];

const HorizontalScrollSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".scroll-section");

      gsap.to(sections, {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative text-white overflow-hidden">
      {/* Trigger Wrapper - Width depends on number of items */}
      <div
        ref={triggerRef}
        className="h-screen flex flex-row flex-nowrap"
        style={{ width: `${phrases.length * 100}vw` }}
      >

        {/* Text Sections */}
        {phrases.map((text, index) => {
          // Dynamic font size based on text length to prevent severe overflow
          const isLong = text.length > 9;
          const fontSizeClass = isLong ? "text-[12vw] md:text-[14vw]" : "text-[15vw] md:text-[20vw]";

          return (
            <div
              key={index}
              className="scroll-section w-screen h-screen flex justify-center items-center shrink-0 relative overflow-hidden"
            >
              {/* Massive Text */}
              <h2 className={`${fontSizeClass} font-black tracking-tighter leading-none whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none`}>
                {text}
              </h2>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default HorizontalScrollSection;
