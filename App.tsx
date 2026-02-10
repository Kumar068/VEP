import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import InteractiveGridBackground from './components/InteractiveGridBackground';
import Header from './components/header';
import HeroSection from './components/HeroSection';
import ShowreelPage from './components/ShowreelPage';
import HorizontalScrollSection from './components/HorizontalScrollSection';
import StopMotionSection from './components/StopMotionSection';

function App() {

  return (
    <div className="relative min-h-screen bg-black">
      <InteractiveGridBackground />
      <Header />
      <HeroSection />
      <ShowreelPage />
      <HorizontalScrollSection />
      <StopMotionSection />
    </div>
  );
}

export default App;
