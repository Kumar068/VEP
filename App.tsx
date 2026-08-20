import React, { useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── Main portfolio page components ──────────────────────────────────────────
import InteractiveGridBackground from './components/InteractiveGridBackground';
import Header from './components/header';
import HeroSection from './components/HeroSection';
import LoadingScreen from './components/LoadingScreen';
import DevToolsOverlay from './components/DevToolsOverlay';

// Lazy load below-the-fold sections
import ShowreelPage from './components/ShowreelPage';
import HorizontalScrollSection from './components/HorizontalScrollSection';
import StopMotionSection from './components/StopMotionSection';
import Footer from './components/Footer';

// ── Standalone pages ─────────────────────────────────────────────────────────
// import ProjectsGalaxy from './components/ProjectsGalaxy'; // Temporarily hidden
import ReelShowcase from './components/ReelShowcase';
import AdminPage from './components/AdminPage';

// ─────────────────────────────────────────────────────────────────────────────
// Home page — the existing portfolio with Lenis smooth scroll
// ─────────────────────────────────────────────────────────────────────────────

function HomePage() {
  useLayoutEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Synchronize ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#000000] overflow-x-hidden w-full">
      {/* DevToolsOverlay temporarily disabled */}
      <LoadingScreen />
      <InteractiveGridBackground />
      <Header />
      <HeroSection />
      <ShowreelPage />
      <HorizontalScrollSection />
      <StopMotionSection />
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root with Router
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ReelShowcase />} />
        {/* <Route path="/projects" element={<ProjectsGalaxy />} /> Temporarily hidden */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
