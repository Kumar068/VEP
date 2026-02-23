import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ShowreelPage: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Create marquee animation with GSAP
    const marqueeElement = sectionRef.current?.querySelector('.animate-marquee-slow');
    if (marqueeElement) {
      gsap.to(marqueeElement, {
        x: '-50%',
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    }

    // Make this section fixed when it comes into view
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom top",
      pin: true,
      pinSpacing: false, // Remove extra spacing
      scrub: true,
    });
  }, { scope: sectionRef });

  return (
    <div id="showreel" ref={sectionRef} className="relative w-full flex items-center justify-center bg-transparent" style={{ minHeight: '200px' }}>
      {/* Background Moving Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 text-gray-600 text-9xl font-extrabold whitespace-nowrap -translate-y-48">
        <div className="animate-marquee-slow">
          POST PRODUCTION VISUAL ALCHEMIST POST PRODUCTION VISUAL ALCHEMIST
        </div>
      </div>
      {/* Branding at the bottom */}
      <div className="relative z-10 text-center">
        <h2 className="text-5xl font-bold text-white mb-2 font-display">
          The Edit is the<span className="font-serif italic text-blue-400"> Final ReWrite</span>
        </h2>
        <p className="text-white/60 text-xs tracking-[0.5em] font-display uppercase">DESIGNING THE FUTURE OF NARRATIVE • EST. 2026</p>
      </div>
    </div>
  );
};

export default ShowreelPage;
