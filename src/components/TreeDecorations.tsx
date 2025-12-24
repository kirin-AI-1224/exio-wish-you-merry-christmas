import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from '../types';

export const BaseRings: React.FC = () => {
  const ringRef = useRef<THREE.Group>(null);
  const ringCount = 3;
  const particlesPerRing = 400;

  const { points } = useMemo(() => {
    const data = [];
    for (let r = 0; r < ringCount; r++) {
      const pos = new Float32Array(particlesPerRing * 3);
      const radius = 6 + r * 1.5;
      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i / particlesPerRing) * Math.PI * 2;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = -5;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
      }
      data.push(pos);
    }
    return { points: data };
  }, []);

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.children.forEach((child, i) => {
        child.rotation.y += 0.005 * (i + 1);
      });
    }
  });

  return (
    <group ref={ringRef}>
      {points.map((pos, i) => (
        <points key={i}>
          <bufferGeometry>
            <bufferAttribute 
              attach="attributes-position" 
              count={particlesPerRing} 
              array={pos} 
              itemSize={3} 
            />
          </bufferGeometry>
          <pointsMaterial 
            color={PALETTE.lightGold} 
            size={0.05} 
            transparent 
            opacity={0.6} 
            blending={THREE.AdditiveBlending} 
          />
        </points>
      ))}
    </group>
  );
};

export const StarApex: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.85;
    const innerRadius = 0.22;
    const points = 5;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.025;
      const s = 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.12;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 7.5, 0]}>
      <extrudeGeometry args={[starShape, { depth: 0.1, bevelEnabled: false }]} />
      <meshStandardMaterial 
        color={PALETTE.lightEmerald} 
        emissive={PALETTE.lightEmerald} 
        emissiveIntensity={10} 
        roughness={0}
        metalness={1.0}
      />
    </mesh>
  );
};
