import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import InteractiveGridBackground from './components/InteractiveGridBackground';
import Header from './components/header';
import HeroSection from './components/HeroSection';
import ShowreelPage from './components/ShowreelPage';

function App() {

  return (
    <div className="relative min-h-screen bg-black">
      <InteractiveGridBackground />
      <Header />
      <HeroSection />
      <ShowreelPage />
    </div>
  );
}

export default App;
