import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection: React.FC = () => {
   const containerRef = useRef<HTMLDivElement>(null);
   const videoRef = useRef<HTMLDivElement>(null);
   const textRef = useRef<HTMLDivElement>(null);
   const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // We use useLayoutEffect to prevent a "flash" of unstyled content
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Target the text lines directly via class
      tl.fromTo(".hero-line",
        { y: "100%", opacity: 0, skewY: 7 }, // Start state
        { y: "0%", opacity: 1, skewY: 0, duration: 1.2, stagger: 0.15 } // End state
      )
      // 2. Subtext reveal
      .fromTo(".hero-subtext",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      )
      // 3. Video editing elements scroll animation
      .fromTo(".video-element",
        { y: 50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
        "-=0.4"
      )
      // 4. Stats grid scroll animation
      .fromTo(".stat-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05 },
        "-=0.3"
      )
      // 5. Timeline scroll animation
      .fromTo(".timeline-element",
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.2"
      )
      // 6. Video player reveal
      .fromTo(".hero-video",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.0 },
        "-=0.1"
      )
      // 7. Scroll indicator
      .fromTo(".scroll-indicator",
        { height: 0, opacity: 0 },
        { height: "4rem", opacity: 0.5, duration: 1 },
        "-=0.4"
      )
      // 8. Text reveal animations
      .fromTo(".text-reveal-line",
        { x: (index) => index % 2 === 0 ? -100 : 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      );
    }, containerRef); // Scope the selector to this ref

    // Scroll effect for video width increase and downward movement
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight; // One screen height
      const scrollProgress = Math.min(scrollY / maxScroll, 1);
      
      if (videoRef.current) {
        // Increase width from max-w-4xl to max-w-6xl as scroll progresses
        const maxWidth = 1024 + (1536 - 1024) * scrollProgress; // 4xl to 6xl
        videoRef.current.style.maxWidth = `${maxWidth}px`;
        
        // Slightly increase scale for dramatic effect
        const scale = 1 + (0.2 * scrollProgress);
        
        // Move video down as scroll progresses (parallax effect)
        const translateY = scrollY * 0.48; // Move down at 40% of scroll speed for more downward movement
        
        videoRef.current.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      }
      
      // Reveal text as video scrolls down
      if (textRef.current) {
        // Text starts revealing after 200px scroll and fully visible at 600px
        const textRevealProgress = Math.max(0, Math.min((scrollY - 200) / 400, 1));
        textRef.current.style.opacity = textRevealProgress.toString();
        
        // Slight upward movement for text as it reveals
        const textTranslateY = 20 * (1 - textRevealProgress);
        textRef.current.style.transform = `translateY(${textTranslateY}px)`;
      }
      
      // Autoplay video when scrolled
      if (videoPlayerRef.current) {
        // Start playing when user scrolls past 100px
        if (scrollY > 100 && videoPlayerRef.current.paused) {
          videoPlayerRef.current.play().catch(err => {
            console.log('Autoplay prevented:', err);
          });
        }
        // Pause when scrolled back to top
        else if (scrollY <= 100 && !videoPlayerRef.current.paused) {
          videoPlayerRef.current.pause();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
   <div 
        ref={containerRef}
        className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 bg-transparent pt-60"
      >
        <div className="text-center mb-12">
          {/* Dynamic video editing elements */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="video-element relative">
              <div className="w-16 h-16 border-2 border-white/30 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl animate-pulse">▶</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white/40"></div>
            </div>
            
            <div className="video-element flex flex-col gap-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-white/40 text-xs font-mono">REC</div>
            </div>

            <div className="video-element relative">
              <div className="w-16 h-16 border-2 border-white/30 rounded-lg flex items-center justify-center">
                <div className="text-white text-xl">◉</div>
              </div>
              <div className="absolute inset-0 border-2 border-white/20 rounded-lg animate-ping"></div>
            </div>
          </div>

          <h1 className="hero-line text-6xl md:text-8xl font-bold text-white mb-8">
            Narrative Through <span className="italic">Rhythm</span>
          </h1>

          {/* Dynamic video editing metrics */}
          <p className="hero-subtext text-white/70 text-lg text-center mb-8">
            Transforming raw footage into <span className="text-white">visceral emotional experiences</span> through cinematic storytelling and expert post-production
          </p>

          {/* Live editing stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">24fps</div>
              <div className="text-white/40 text-xs">Frame Rate</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">4K</div>
              <div className="text-white/40 text-xs">Resolution</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">60min</div>
              <div className="text-white/40 text-xs">Avg. Project</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-white text-2xl font-bold mb-1">∞</div>
              <div className="text-white/40 text-xs">Creativity</div>
            </div>
          </div>

          {/* Animated timeline element */}
          <div className="timeline-element mt-8 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-white/60 to-transparent"></div>
              <span className="font-mono">00:00:00:00</span>
            </div>
          </div>
        </div>

        {/* Video Player in Hero Section */}
        <div ref={videoRef} className="hero-video relative z-20 w-[80%] h-[60vh] bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-gray-700/50">
          {/* Video Frame Corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-blue-400 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-blue-400 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-blue-400 rounded-br-lg"></div>

          {/* Video Element */}
          <video
            ref={videoPlayerRef}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            muted
            loop
            playsInline
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23111827'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23ffffff' font-family='Arial' font-size='24'%3EVideo Content%3C/text%3E%3C/svg%3E"
          >
            <source src="/video/showreel.mp4" type="video/mp4" />
            <source src="/video/showreel.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Text content to be revealed behind video */} 
        <div ref={textRef} className="absolute z-10 text-center text-white/90 text-2xl md:text-6xl font-bold leading-tight opacity-0 pointer-events-none max-w-4xl mt-16">
          <p className="text-reveal-line mb-2">Crafting visual stories</p>
          <p className="text-reveal-line mb-2">that resonate deeply</p>
          <p className="text-reveal-line mb-2">and leave a lasting</p>
          <p className="text-reveal-line">emotional impact.</p>
        </div>
      </div>
  );
};

export default HeroSection;