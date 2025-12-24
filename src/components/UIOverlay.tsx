import React, { useState } from 'react';
import { PALETTE } from '../types';

interface UIOverlayProps {
  onUnleash: (active: boolean) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ onUnleash }) => {
  const [isUnleashed, setIsUnleashed] = useState(false);

  const handleToggle = () => {
    const newState = !isUnleashed;
    setIsUnleashed(newState);
    onUnleash(newState);
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col p-8 md:p-16 z-10 font-mono">
      <header className="flex flex-col items-center md:items-start text-white">
        <h2 className="text-[10px] tracking-[0.6em] uppercase opacity-40 mb-3">
          EXCLUSIVE DIGITAL ASSET EXPERIENCE
        </h2>
        <h1 
          className="text-6xl md:text-8xl font-bold tracking-tight" 
          style={{ color: PALETTE.lightEmerald.getStyle() }}
        >
          EX.IO
        </h1>
        <div className="h-[2px] w-24 bg-emerald-500 mt-2 opacity-50"></div>
        <p className="mt-6 text-[11px] font-light tracking-[0.3em] opacity-60 max-w-xs text-center md:text-left leading-loose">
          WISH YOU A MERRY CHRISTMAS & A WEALTHY 2026.
        </p>
      </header>

      <div className="flex-grow"></div>

      <div className="flex flex-col items-center gap-6 mb-12 md:mb-20">
        <button 
          onClick={handleToggle}
          className="pointer-events-auto group relative px-12 py-4 border border-white/10 bg-white/5 backdrop-blur-3xl rounded-none transition-all hover:bg-white/10 flex flex-col items-center gap-2"
        >
          <span className="relative z-10 text-[10px] tracking-[0.5em] uppercase text-white/70 group-hover:text-emerald-400 transition-colors">
            {isUnleashed ? '[ COMPRESS ENERGY ]' : '[ RELEASE ENERGY ]'}
          </span>
          <span className="relative z-10 text-[7px] tracking-[0.35em] uppercase text-white/30 font-light group-hover:text-white/40 transition-colors">
            MAY THE GROWTH BE WITH YOU
          </span>
        </button>
      </div>

      <footer className="flex flex-col items-center gap-4">
        <div className="flex justify-center items-center tracking-[0.5em] uppercase w-full">
          <div className="text-white text-[16px]">BY TRADFI FOR TRADFI</div>
        </div>
          <div className="text-white/60 text-[10px] tracking-[0.3em]">CREATED BY KIRIN</div>
      </footer>
    </div>
  );
};

export default UIOverlay;
