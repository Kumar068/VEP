/**
 * ProjectsGalaxy.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * 3-D "reel globe" — 9:16 video planes distributed on a Fibonacci sphere.
 * Reels are fetched dynamically from GET /api/reels (Express backend).
 *
 * Tech: React Three Fiber · @react-three/drei · GSAP · Three.js
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { ReelData } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Fibonacci Sphere — evenly distributes N points on a sphere of given radius
// ─────────────────────────────────────────────────────────────────────────────

function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const phi   = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    positions.push(new THREE.Vector3(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi),
    ));
  }
  return positions;
}

const SPHERE_RADIUS   = 3.2;  // tuned so 40 cards create a dense, full-looking globe
const MAX_REELS       = 40;   // cap — always show the 40 most recent
const PROXIMITY_COUNT = 4;
const DEFAULT_CAM_Z   = 8;
const ZOOM_DISTANCE   = 1.6;

// ─────────────────────────────────────────────────────────────────────────────
// useFetchReels — fetches live data from the Express API
// ─────────────────────────────────────────────────────────────────────────────

function useFetchReels() {
  const [reels, setReels]     = useState<ReelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reels');
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: ReelData[] = await res.json();
      setReels(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { reels, loading, error, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Reel Plane
// ─────────────────────────────────────────────────────────────────────────────

interface ReelMeshProps {
  data: ReelData;
  position: THREE.Vector3;
  isActive: boolean;
  onClick: () => void;
  closeReel: () => void;
  registerProximity: (mesh: THREE.Mesh | null) => void;
}

function ReelMesh({ data, position, isActive, onClick, closeReel, registerProximity }: ReelMeshProps) {
  const meshRef    = useRef<THREE.Mesh>(null!);
  const glowRef    = useRef<THREE.Mesh>(null!);
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const matRef     = useRef<THREE.MeshBasicMaterial>(null!);
  const isPlaying  = useRef(false);

  const originalPos = useRef(position.clone());
  const originalRot = useRef(new THREE.Euler());
  const isSwaying   = useRef(false);
  const swayTime    = useRef(0);

  // Outward normal (pointing away from sphere center)
  const outward = React.useMemo(() => position.clone().normalize(), [position]);

  // Create video element + texture once
  useEffect(() => {
    const video       = document.createElement('video');
    video.src         = data.videoSrc;
    video.loop        = true;
    video.muted       = true;
    video.playsInline = true;
    video.preload     = 'metadata';
    videoRef.current  = video;

    const tex = new THREE.VideoTexture(video);
    tex.minFilter  = THREE.LinearFilter;
    tex.magFilter  = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;

    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.needsUpdate = true;
    }

    return () => {
      video.pause();
      video.src = '';
      tex.dispose();
    };
  }, [data.videoSrc]);

  // Orient outward and register refs with Scene
  useEffect(() => {
    if (meshRef.current && glowRef.current) {
      const lookTarget = position.clone().add(outward);
      meshRef.current.lookAt(lookTarget);
      glowRef.current.lookAt(lookTarget);
      
      // Save this exact rotation so we can return to it later
      originalRot.current.copy(meshRef.current.rotation);
      
      registerProximity(meshRef.current);
    }
    return () => {
      registerProximity(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const play  = useCallback(() => {
    if (!isPlaying.current && videoRef.current) {
      videoRef.current.play().catch(() => {});
      isPlaying.current = true;
    }
  }, []);

  const pause = useCallback(() => {
    if (isPlaying.current && videoRef.current) {
      videoRef.current.pause();
      isPlaying.current = false;
    }
  }, []);

  useEffect(() => {
    (meshRef as any)._playVideo  = play;
    (meshRef as any)._pauseVideo = pause;
  }, [play, pause]);

  // Animate card pulling to camera
  useEffect(() => {
    if (isActive) {
      isSwaying.current = false;

      const tl = gsap.timeline({
        onComplete: () => {
          isSwaying.current = true;
          swayTime.current = 0;
        }
      });

      // 1. Pull the card OUT of the globe and directly in front of the camera
      tl.to(meshRef.current.position, {
        x: 0,
        y: 0,
        z: 4.8, // Adjust to move it closer/further from screen (camera is at 8)
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      // 2. Flatten rotation so it sits perfectly straight 2D on the screen
      tl.to(meshRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      // 3. Scale up video mesh slightly for dramatic effect
      tl.to(meshRef.current.scale, {
        x: 1.6,
        y: 1.6,
        z: 1.6,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      // 4. Move and scale up glow mesh
      tl.to(glowRef.current.position, {
        x: 0,
        y: 0,
        z: 4.75, // slightly behind card
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      tl.to(glowRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      tl.to(glowRef.current.scale, {
        x: 2.2,
        y: 2.2,
        z: 2.2,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      tl.to(glowMat, {
        opacity: 0.6,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

    } else {
      isSwaying.current = false;

      const tl = gsap.timeline();

      // Send the card BACK to its exact spot on the globe
      tl.to(meshRef.current.position, {
        x: originalPos.current.x,
        y: originalPos.current.y,
        z: originalPos.current.z,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      tl.to(meshRef.current.rotation, {
        x: originalRot.current.x,
        y: originalRot.current.y,
        z: originalRot.current.z,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      tl.to(meshRef.current.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      // Send glow BACK
      tl.to(glowRef.current.position, {
        x: originalPos.current.x,
        y: originalPos.current.y,
        z: originalPos.current.z,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      tl.to(glowRef.current.rotation, {
        x: originalRot.current.x,
        y: originalRot.current.y,
        z: originalRot.current.z,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      tl.to(glowRef.current.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      tl.to(glowMat, {
        opacity: 0.07,
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);
    }
  }, [isActive]);

  useFrame((_, delta) => {
    if (isSwaying.current && meshRef.current && glowRef.current) {
      swayTime.current += delta;
      const t = swayTime.current;
      const rx = Math.sin(t * 0.6) * 0.03;
      const ry = Math.sin(t * 0.4) * 0.04;
      meshRef.current.rotation.x = rx;
      meshRef.current.rotation.y = ry;
      glowRef.current.rotation.x = rx;
      glowRef.current.rotation.y = ry;
    }
  });

  return (
    <group>
      {/* Glow halo — animated separately for the pull effect */}
      <mesh ref={glowRef} position={position}>
        <planeGeometry args={[0.65, 1.15]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={isActive ? 0.35 : 0.07}
          depthWrite={false}
        />
      </mesh>

      {/* Main video plane (9:16) */}
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          isActive ? closeReel() : onClick();
        }}
      >
        <planeGeometry args={[0.55, 0.98]} />
        <meshBasicMaterial
          ref={matRef}
          color={isActive ? '#ffffff' : '#cccccc'}
          toneMapped={false}
        />
      </mesh>

      {/* Billboarded label */}
      <Html
        position={[
          position.x,
          position.y - 0.9,
          position.z,
        ]}
        center
        distanceFactor={6}
        occlude
        style={{
          pointerEvents: 'none',
          opacity: isActive ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '6px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: isActive ? data.color : 'rgba(255,255,255,0.45)',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            lineHeight: 1.5,
            textShadow: `0 0 10px ${data.color}`,
          }}
        >
          <div style={{ color: data.color, marginBottom: 2 }}>{data.tag}</div>
          <div>{data.title}</div>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active Reel Overlay (DOM layer)
// ─────────────────────────────────────────────────────────────────────────────

function ActiveOverlay({ reel }: { reel: ReelData | null }) {
  if (!reel) return null;
  return (
    <div
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '2.5rem 3rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}
    >
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: reel.color, marginBottom: '0.5rem' }}>
          {reel.tag} · {reel.year}
        </p>
        <h2 style={{ fontFamily: '"Arial Black", sans-serif', fontSize: 'clamp(1.8rem,4vw,3.5rem)',
          fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em',
          lineHeight: 1, margin: 0 }}>
          {reel.title}
        </h2>
        <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem', textTransform: 'uppercase' }}>
          {reel.category}
        </p>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.25em',
        color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', pointerEvents: 'none' }}>
        Click anywhere to close
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene — R3F root
// ─────────────────────────────────────────────────────────────────────────────

interface SceneProps {
  reels: ReelData[];
  onActiveChange: (reel: ReelData | null) => void;
}

function Scene({ reels, onActiveChange }: SceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Per-reel mesh registration (for proximity playback)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const animating  = useRef(false);

  // Recalculate sphere positions whenever reel count changes
  const positions = React.useMemo(
    () => fibonacciSphere(reels.length, SPHERE_RADIUS),
    [reels.length],
  );

  // Initialise meshRefs array size
  useEffect(() => {
    meshRefs.current = new Array(reels.length).fill(null);
  }, [reels.length]);

  // ── Proximity-based playback ──────────────────────────────────
  useFrame(() => {
    if (activeIdx !== null) {
      meshRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        if (i === activeIdx) {
          (mesh as any)._playVideo?.();
        } else {
          (mesh as any)._pauseVideo?.();
        }
      });
      return;
    }

    const camPos    = camera.position;
    const distances = positions.map((pos, i) => ({ i, d: camPos.distanceTo(pos) }));
    distances.sort((a, b) => a.d - b.d);
    distances.forEach(({ i }, rank) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      rank < PROXIMITY_COUNT
        ? (mesh as any)._playVideo?.()
        : (mesh as any)._pauseVideo?.();
    });
  });

  // ── Open: dramatic card-pull ──────────────────────────────────────────────
  const handleReelClick = useCallback(
    (idx: number) => {
      if (animating.current || activeIdx !== null) return;
      setActiveIdx(idx);
      onActiveChange(reels[idx]);
      animating.current = true;

      if (controlsRef.current) {
        controlsRef.current.enabled    = false;
        controlsRef.current.autoRotate = false;
      }

      // Smoothly reset camera to the default front-facing position
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: DEFAULT_CAM_Z,
        duration: 1.2,
        ease: 'power3.inOut',
      });

      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.2,
          ease: 'power3.inOut',
          onComplete: () => {
            animating.current = false;
          },
        });
      } else {
        setTimeout(() => {
          animating.current = false;
        }, 1200);
      }
    },
    [activeIdx, camera, onActiveChange, reels],
  );

  // ── Close: reverse everything ─────────────────────────────────────────────
  const closeReel = useCallback(() => {
    if (activeIdx === null || animating.current) return;
    animating.current = true;

    // Reset camera position and target
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: DEFAULT_CAM_Z,
      duration: 1.2,
      ease: 'power3.inOut',
    });

    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          if (controlsRef.current) {
            controlsRef.current.enabled    = true;
            controlsRef.current.autoRotate = true;
          }
          animating.current  = false;
          setActiveIdx(null);
          onActiveChange(null);
        },
      });
    } else {
      setTimeout(() => {
        animating.current  = false;
        setActiveIdx(null);
        onActiveChange(null);
      }, 1200);
    }
  }, [activeIdx, camera, onActiveChange]);

  return (
    <>
      {/* Invisible back-sphere catches "close" clicks */}
      <mesh scale={[40, 40, 40]} onClick={closeReel} visible={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        autoRotate
        autoRotateSpeed={0.55}
        minDistance={1.5}
        maxDistance={14}
      />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#1152d4" distance={20} decay={2} />

      {reels.map((reel, i) => (
        <ReelMesh
          key={reel.id}
          data={reel}
          position={positions[i]}
          isActive={activeIdx === i}
          registerProximity={(m) => { meshRefs.current[i] = m; }}
          onClick={() => handleReelClick(i)}
          closeReel={closeReel}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Starfield Canvas
// ─────────────────────────────────────────────────────────────────────────────

function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const stars = Array.from({ length: 320 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.2 + 0.2, speed: Math.random() * 0.003 + 0.001,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        const a = 0.2 + 0.8 * Math.abs(Math.sin(Date.now() * s.speed));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0 }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header / Back Nav
// ─────────────────────────────────────────────────────────────────────────────

function GalaxyHeader({ reelCount }: { reelCount: number }) {
  const navigate = useNavigate();
  const btnStyle: React.CSSProperties = {
    pointerEvents: 'all',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
    fontSize: '10px',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    padding: '0.55rem 1.1rem',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.25s',
  };
  return (
    <header style={{ position: 'absolute', top: 0, left: 0, right: 0,
      padding: '1.5rem 2rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', zIndex: 20, pointerEvents: 'none' }}>
      <button id="back-btn" onClick={() => navigate('/')} style={btnStyle}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
        ← Back
      </button>
      <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          Projects Galaxy · {reelCount} Reel{reelCount !== 1 ? 's' : ''}
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: '8px', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.12)', margin: '0.2rem 0 0' }}>
          Drag to explore · Click to view
        </p>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading / Error / Empty states
// ─────────────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 30 }}>
      <div style={{ width: 48, height: 48, border: '2px solid rgba(17,82,212,0.2)',
        borderTop: '2px solid #1152d4', borderRadius: '50%', animation: 'pg-spin 1s linear infinite' }} />
      <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
        Loading Galaxy…
      </p>
      <style>{`@keyframes pg-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.5rem', zIndex: 30 }}>
      <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em',
        textTransform: 'uppercase', color: '#f74a4a', margin: 0 }}>
        ⚠ {message}
      </p>
      <p style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.3)',
        margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Make sure the API server is running: <code style={{ color: '#60a5fa' }}>npm run server</code>
      </p>
      <button onClick={onRetry}
        style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.25em',
          textTransform: 'uppercase', padding: '0.5rem 1.2rem', cursor: 'pointer',
          background: 'rgba(17,82,212,0.15)', border: '1px solid rgba(17,82,212,0.4)',
          color: '#60a5fa' }}>
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 30 }}>
      <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.25em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
        No reels uploaded yet
      </p>
      <button onClick={() => navigate('/admin')}
        style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.25em',
          textTransform: 'uppercase', padding: '0.55rem 1.3rem', cursor: 'pointer',
          background: 'rgba(17,82,212,0.15)', border: '1px solid rgba(17,82,212,0.4)',
          color: '#60a5fa' }}>
        Go to Admin → Upload Reels
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectsGalaxy() {
  const { reels: allReels, loading, error, refetch } = useFetchReels();
  const [activeReel, setActiveReel] = useState<ReelData | null>(null);

  // Always show the newest MAX_REELS; older ones drop off automatically
  const reels = allReels.slice(0, MAX_REELS);

  return (
    <div id="projects-galaxy"
      style={{ position: 'relative', width: '100vw', height: '100vh',
        background: '#000008', overflow: 'hidden' }}>

      <StarfieldCanvas />
      <GalaxyHeader reelCount={reels.length} />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && reels.length === 0 && <EmptyState />}

      {!loading && !error && reels.length > 0 && (
        <Canvas
          camera={{ position: [0, 0, DEFAULT_CAM_Z], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        >
          <Suspense fallback={null}>
            <Scene reels={reels} onActiveChange={setActiveReel} />
          </Suspense>
        </Canvas>
      )}

      <ActiveOverlay reel={activeReel} />
    </div>
  );
}
