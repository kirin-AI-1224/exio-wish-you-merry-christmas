import React, { useState } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [unleash, setUnleash] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#011611]">
      <div className="absolute inset-0 z-0">
        <Scene unleash={unleash} />
      </div>
      <UIOverlay onUnleash={setUnleash} />
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_150px_rgba(16,185,129,0.1)]"></div>
    </div>
  );
};

export default App;
