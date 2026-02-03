import React from 'react';

const ShowreelPage: React.FC = () => {
  return (
    <>
      <style jsx>{`
        @keyframes marquee-slow {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-slow {
          animation: marquee-slow 20s linear infinite;
          display: inline-block;
          padding-right: 50%;
        }
      `}</style>
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-transparent">
        {/* Background Moving Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-gray-600 text-9xl font-extrabold whitespace-nowrap overflow-hidden">
          <div className="animate-marquee-slow">
            POST PRODUCTION VISUAL ALCHEMIST POST PRODUCTION VISUAL ALCHEMIST
          </div>
        </div>
        {/* Branding at the bottom */}
        <div className="absolute bottom-10 z-10 text-center">
          <h2 className="text-5xl font-bold text-white mb-2 mt-8">
            VISUAL<span className="text-blue-400">ALCHEMIST</span>
          </h2>
          <p className="text-white/60 text-sm tracking-widest">DESIGNING THE FUTURE OF NARRATIVE • EST. 2026</p>
        </div>
      </div>
    </>
  );
};

export default ShowreelPage;
