import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import InteractiveGridBackground from './components/InteractiveGridBackground';
import Header from './components/header';
import HeroSection from './components/HeroSection';

function App() {

  return (
    <div className="relative w-full min-h-screen bg-black">
      <InteractiveGridBackground />
      <Header />

      <HeroSection />
    </div>
  );
}

export default App;
