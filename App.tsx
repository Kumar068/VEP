import React, { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import InteractiveGridBackground from './components/InteractiveGridBackground';
import Header from './components/header';
import HeroSection from './components/HeroSection';
import LoadingScreen from './components/LoadingScreen';
import DevToolsOverlay from './components/DevToolsOverlay';
import Lenis from 'lenis';

// Lazy load below-the-fold components to slash main-thread TBT (Total Blocking Time)
import ShowreelPage from './components/ShowreelPage';
import HorizontalScrollSection from './components/HorizontalScrollSection';
import StopMotionSection from './components/StopMotionSection';
import Footer from './components/Footer';

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
    <div className="relative min-h-screen bg-[#000000] overflow-x-hidden w-full">
      <DevToolsOverlay />
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

export default App;
