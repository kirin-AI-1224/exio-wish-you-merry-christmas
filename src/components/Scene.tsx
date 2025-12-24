import React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { PinkTreeParticles } from './PinkTreeParticles';
import { BaseRings, StarApex } from './TreeDecorations';
import { GoldenStreamers } from './GoldenStreamers';
import TreeElements from './TreeElements';
import { PALETTE, TreeMorphState } from '../types';

const SnowParticles = () => {
  const count = 1200;
  const meshRef = React.useRef<THREE.Points>(null);
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = Math.random() * 50 - 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, []);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      const posAttr = meshRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) - delta * 1.5;
        if (y < -25) y = 25;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        color="#ffffff" 
        size={0.06} 
        transparent 
        opacity={0.4} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

interface SceneProps {
  unleash: boolean;
}

const Scene: React.FC<SceneProps> = ({ unleash }) => {
  return (
    <Canvas 
      shadows 
      gl={{ antialias: false, stencil: false, depth: true }} 
      dpr={[1, 2]}
    >
      <color attach="background" args={['#010f0c']} />
      
      <PerspectiveCamera makeDefault position={[0, 4, 24]} fov={38} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={45} 
        autoRotate={!unleash}
        autoRotateSpeed={0.3} 
      />

      <ambientLight intensity={0.2} />
      <pointLight position={[15, 15, 15]} intensity={5} color={PALETTE.brightGold} />
      <pointLight position={[-15, 5, -15]} intensity={2} color={PALETTE.lightEmerald} />
      <pointLight position={[0, -5, 0]} intensity={3} color={PALETTE.emerald} />
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.4} />
      <SnowParticles />

      <group position={[0, -2, 0]}>
        <TreeElements targetState={unleash ? TreeMorphState.SCATTERED : TreeMorphState.TREE_SHAPE} />
        <PinkTreeParticles unleash={unleash ? 1 : 0} burst={0} />
        <GoldenStreamers unleash={unleash} />
        <BaseRings />
        <StarApex />
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.15} 
          mipmapBlur 
          intensity={4.5} 
          radius={0.8} 
        />
        <Noise opacity={0.06} />
        <Vignette eskil={false} offset={0.05} darkness={1.3} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;
