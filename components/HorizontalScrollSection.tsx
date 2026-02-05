import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HorizontalScrollSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Simple text animation from left to right without horizontal scrolling
      gsap.fromTo(".moving-text",
        {
          x: "-100vw",
          opacity: 0
        },
        {
          x: "0",
          opacity: 1,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          }
        }
      );

    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="moving-text text-center px-8 max-w-7xl">
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-relaxed">
          The Art of Visual Storytelling where Precision Meets Creativity to Transform Vision Into Reality
          <span className="block text-blue-400 mt-6 text-2xl md:text-4xl lg:text-6xl">Every Frame Tells a Story</span>
        </h2>
      </div>
    </div>
  );
};

export default HorizontalScrollSection;
