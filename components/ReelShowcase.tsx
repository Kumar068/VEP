import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Reel {
  id: number;
  title: string;
  category: string;
  year: string;
  duration: string;
  thumbnail: string;
  video: string;
  color: string;
}

const REELS: Reel[] = [
  { id: 1, title: 'Ember & Ash', category: 'Commercial', year: '2025', duration: '02:30', thumbnail: '/content/reels/reel-01.mp4', video: '/content/reels/reel-01.mp4', color: '#1152d4' },
  { id: 2, title: 'Pulse', category: 'Music Video', year: '2025', duration: '04:12', thumbnail: '/content/reels/reel-02.mp4', video: '/content/reels/reel-02.mp4', color: '#f74a4a' },
  { id: 3, title: 'Meridian', category: 'Short Film', year: '2024', duration: '12:00', thumbnail: '/content/reels/reel-03.mp4', video: '/content/reels/reel-03.mp4', color: '#00c896' },
  { id: 4, title: 'Ghost Static', category: 'Documentary', year: '2024', duration: '18:40', thumbnail: '/content/reels/reel-04.mp4', video: '/content/reels/reel-04.mp4', color: '#9b59b6' },
  { id: 5, title: 'Solstice', category: 'Brand Film', year: '2024', duration: '03:15', thumbnail: '/content/reels/reel-05.mp4', video: '/content/reels/reel-05.mp4', color: '#f39c12' },
  { id: 6, title: 'Undercurrent', category: 'Art Film', year: '2023', duration: '07:44', thumbnail: '/content/reels/reel-06.mp4', video: '/content/reels/reel-06.mp4', color: '#1abc9c' },
  { id: 7, title: 'The Divide', category: 'Narrative', year: '2023', duration: '22:10', thumbnail: '/content/reels/reel-07.mp4', video: '/content/reels/reel-07.mp4', color: '#e74c3c' },
].reverse();

const ReelShowcase: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredReel, setHoveredReel] = useState<number | null>(null);
  const [loadedReels, setLoadedReels] = useState<Set<number>>(new Set());
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [visibleCount, setVisibleCount] = useState(12); // Start with 3 rows (approx 12 items)
  const [itemsPerRow, setItemsPerRow] = useState(4); // Will be calculated dynamically

  // Calculate items per row based on screen width
  useEffect(() => {
    const calculateItemsPerRow = () => {
      const width = window.innerWidth;
      if (width < 640) return 2; // Mobile: 2 items
      if (width < 1024) return 3; // Tablet: 3 items
      return 4; // Desktop: 4 items
    };
    setItemsPerRow(calculateItemsPerRow());
    
    const handleResize = () => setItemsPerRow(calculateItemsPerRow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initialVisibleCount = itemsPerRow * 3; // 3 rows
  const visibleReels = REELS.slice(0, visibleCount);
  const hasMore = visibleCount < REELS.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + itemsPerRow * 3, REELS.length)); // Load 3 more rows
  };

  useGSAP(() => {
    // Animate reel cards with sophisticated stagger
    gsap.from('.reel-card', {
      y: 120,
      opacity: 0,
      scale: 0.95,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: '.reels-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Animate newly loaded cards when visibleCount changes
    gsap.from('.reel-card-new', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    });

    // Animate header with cinematic reveal
    gsap.from('.showcase-header > *', {
      y: 80,
      opacity: 0,
      duration: 1.4,
      stagger: 0.15,
      ease: 'power3.out',
    });

    // Parallax effect on background elements
    gsap.to('.bg-orb-1', {
      y: -100,
      x: 50,
      duration: 2,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    gsap.to('.bg-orb-2', {
      y: 80,
      x: -80,
      duration: 2.5,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }, { scope: containerRef });

  const handleReelLoad = (id: number) => {
    setLoadedReels(prev => new Set(prev).add(id));
  };

  const handleReelClick = (reel: Reel) => {
    setSelectedReel(reel);
  };

  const handleCloseModal = () => {
    setSelectedReel(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Syne, sans-serif',
      }}
    >
      {/* Film grain overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 100,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(232,230,225,0.07) 2px, rgba(232,230,225,0.07) 3px)',
        }}
      />

      {/* Sophisticated background orbs */}
      <div
        className="bg-orb-1"
        style={{
          position: 'absolute',
          top: '20%',
          right: '-15%',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(17,82,212,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="bg-orb-2"
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,76,60,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(20px,4vw,52px)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Back to portfolio"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e8e6e1')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(232,230,225,0.45)')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'Syne,sans-serif',
            fontSize: 'clamp(10px,2vw,11px)',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(232,230,225,0.45)',
            transition: 'color 0.3s ease',
          }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="15" y1="6" x2="1" y2="6" />
            <polyline points="5,1 1,6 5,11" />
          </svg>
          Portfolio
        </button>

        <div
          style={{
            fontFamily: 'Syne,sans-serif',
            fontSize: 'clamp(10px,2vw,11px)',
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(232,230,225,0.15)',
          }}
        >
          Keerthan <span style={{ margin: '0 10px', color: 'rgba(232,230,225,0.06)' }}>/</span> Reels
        </div>

        <div
          style={{
            fontFamily: 'Syne,monospace',
            fontSize: 'clamp(9px,1.5vw,10px)',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(232,230,225,0.15)',
          }}
        >
          07 Reels
        </div>
      </nav>

      {/* Header */}
      <div
        className="showcase-header"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: 'clamp(100px,15vw,180px) clamp(20px,6vw,100px)',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(232,230,225,0.2)' }} />
          <span
            style={{
              fontFamily: 'Syne, monospace',
              fontSize: 'clamp(8px,1.5vw,10px)',
              fontWeight: 800,
              letterSpacing: '0.5em',
              color: '#e8e6e1',
              textTransform: 'uppercase',
            }}
          >
            Selected Works
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(232,230,225,0.06)' }} />
        </div>

        <h1
          style={{
            fontSize: 'clamp(3rem,8vw,8rem)',
            fontWeight: 800,
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            marginBottom: 'clamp(24px,4vw,48px)',
            color: '#e8e6e1',
          }}
        >
          Visual<br />
          <span
            style={{
              color: 'transparent',
              WebkitTextStroke: 'clamp(1px,0.2vw,2px) rgba(232,230,225,0.2)',
              backgroundImage: 'linear-gradient(135deg, #e8e6e1 0%, rgba(232,230,225,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Stories
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem,1.5vw,1.25rem)',
            lineHeight: 1.7,
            color: 'rgba(232,230,225,0.5)',
            fontWeight: 400,
            maxWidth: '700px',
            letterSpacing: '-0.01em',
          }}
        >
          Each reel is a crafted narrative — a journey through emotion, rhythm, and visual poetry. 
          From commercial campaigns to artistic expressions, explore the stories that resonate.
        </p>
      </div>

      {/* Reels Grid - EverWonder inspired layout */}
      <div
        className="reels-grid"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 clamp(20px,4vw,80px) clamp(80px,12vw,140px)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'clamp(16px,3vw,32px)',
          }}
        >
          {visibleReels.map((reel, index) => (
            <div
              key={reel.id}
              className={`reel-card ${index >= initialVisibleCount ? 'reel-card-new' : ''}`}
              onClick={() => handleReelClick(reel)}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '9 / 19.5',
                background: '#0a0a0a',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(232,230,225,0.06)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${reel.color}12`;
                e.currentTarget.style.borderColor = `${reel.color}30`;
                setHoveredReel(reel.id);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(232,230,225,0.06)';
                setHoveredReel(null);
              }}
            >
              {/* Video thumbnail */}
              <video
                ref={(el) => {
                  if (el && hoveredReel === reel.id) {
                    el.play().catch(() => {});
                  } else if (el && hoveredReel !== reel.id) {
                    el.pause();
                  }
                }}
                src={reel.thumbnail}
                muted
                loop
                playsInline
                preload="metadata"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: hoveredReel === reel.id ? 1 : 0.6,
                  transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: hoveredReel === reel.id ? 'scale(1.1)' : 'scale(1)',
                }}
              />

              {/* Cinematic gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)',
                  pointerEvents: 'none',
                  transition: 'opacity 0.5s ease',
                }}
              />

              {/* Accent line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${reel.color} 50%, transparent 100%)`,
                  opacity: hoveredReel === reel.id ? 1 : 0.5,
                  transition: 'opacity 0.3s ease',
                }}
              />

              {/* Number indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontFamily: 'Syne,monospace',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  color: 'rgba(232,230,225,0.25)',
                  textTransform: 'uppercase',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Syne,monospace',
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    color: reel.color,
                    textTransform: 'uppercase',
                    opacity: hoveredReel === reel.id ? 1 : 0.7,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {reel.category}
                </div>
                <h3
                  style={{
                    fontFamily: 'Syne,sans-serif',
                    fontWeight: 800,
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    color: '#e8e6e1',
                  }}
                >
                  {reel.title}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Syne,monospace',
                      fontSize: '8px',
                      color: 'rgba(232,230,225,0.35)',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {reel.year}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Syne,monospace',
                      fontSize: '8px',
                      color: 'rgba(232,230,225,0.35)',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {reel.duration}
                  </span>
                </div>
              </div>

              {/* Play icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(232,230,225,0.08)',
                  border: '1px solid rgba(232,230,225,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  opacity: hoveredReel === reel.id ? 1 : 0.5,
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  transform: hoveredReel === reel.id ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)',
                }}
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill="rgba(232,230,225,0.9)">
                  <path d="M0.5 0.5L11.5 6.5L0.5 12.5V0.5Z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(40px,6vw,80px)' }}>
            <button
              onClick={handleLoadMore}
              style={{
                padding: '16px 48px',
                background: 'transparent',
                border: '1px solid rgba(232,230,225,0.15)',
                borderRadius: '9999px',
                color: '#e8e6e1',
                fontFamily: 'Syne,sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,230,225,0.08)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,230,225,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,230,225,0.15)';
              }}
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: 'clamp(60px,8vw,100px) clamp(20px,6vw,100px)',
          borderTop: '1px solid rgba(232,230,225,0.06)',
          marginTop: 'clamp(80px,12vw,140px)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'Syne,monospace',
            fontSize: 'clamp(9px,1.2vw,10px)',
            color: 'rgba(232,230,225,0.3)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          © 2025 Keerthan · Crafted with precision
        </p>
      </div>

      {/* Video Modal */}
      {selectedReel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '20px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              background: '#0a0a0a',
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${selectedReel.color}30`,
              boxShadow: `0 0 60px ${selectedReel.color}20`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedReel.video}
              autoPlay
              controls
              style={{
                display: 'block',
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
              }}
            />
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(232,230,225,0.1)',
                border: '1px solid rgba(232,230,225,0.2)',
                color: '#e8e6e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,230,225,0.2)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,230,225,0.1)'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="1" y1="1" x2="15" y2="15" />
                <line x1="15" y1="1" x2="1" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelShowcase;
