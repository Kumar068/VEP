import React, { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import InteractiveGridBackground from './components/InteractiveGridBackground';
import Header from './components/header';
import HeroSection from './components/HeroSection';
import LoadingScreen from './components/LoadingScreen';
import Lenis from 'lenis';

// Lazy load below-the-fold components to slash main-thread TBT (Total Blocking Time)
const ShowreelPage = React.lazy(() => import('./components/ShowreelPage'));
const HorizontalScrollSection = React.lazy(() => import('./components/HorizontalScrollSection'));
const StopMotionSection = React.lazy(() => import('./components/StopMotionSection'));
const Footer = React.lazy(() => import('./components/Footer'));

// ─────────────────────────────────────────────────────────────────────────────
// AppReadySignal — mounts inside Suspense so it only runs after ALL lazy
// chunks have successfully resolved. Dispatches 'app:ready' so LoadingScreen
// knows it is safe to fade out without flashing partial content.
// ─────────────────────────────────────────────────────────────────────────────
function AppReadySignal() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('app:ready'));
  }, []);
  return null;
}

function App() {
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
    <div className="relative min-h-screen bg-[#000000]">
      <LoadingScreen />
      <InteractiveGridBackground />
      <Header />
      <HeroSection />

      {/* Defer loading/executing heavy GSAP components until Hero is painted */}
      <React.Suspense fallback={<div className="min-h-screen bg-black" />}>
        <ShowreelPage />
        <HorizontalScrollSection />
        <StopMotionSection />
        <Footer />
        {/* Fires 'app:ready' only after all lazy chunks above have mounted */}
        <AppReadySignal />
      </React.Suspense>
    </div>
  );
}

export default App;
