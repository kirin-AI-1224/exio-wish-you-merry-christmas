import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from '../types';

const vertexShader = `
  uniform float uTime;
  uniform float uUnleash;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  attribute float aIsGold;
  varying vec3 vColor;
  varying float vOpacity;
  varying float vSparkle;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    float scale = 1.0 + uUnleash * 3.0;
    pos *= scale;
    float breathing = sin(uTime * 1.2 + aPhase) * 0.12;
    pos += normalize(pos) * breathing;
    float sparkle = pow(0.5 + 0.5 * sin(uTime * (6.0 + aPhase * 2.0) + aPhase), 10.0);
    vSparkle = sparkle;
    vOpacity = (0.7 + 0.3 * sin(uTime * 2.0 + aPhase * 3.0)) + sparkle * 0.5;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float sizeBoost = 1.0 + uUnleash * 0.5 + sparkle * 0.3;
    gl_PointSize = aSize * (450.0 / -mvPosition.z) * sizeBoost;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vSparkle;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float core = pow(1.0 - d * 2.0, 4.0);
    float bloom = pow(1.0 - d * 2.0, 1.5);
    vec3 finalColor = mix(vColor, vec3(1.0), vSparkle * 0.4);
    gl_FragColor = vec4(finalColor, (core * 0.8 + bloom * 0.2) * vOpacity);
  }
`;

export const PinkTreeParticles: React.FC<{ unleash: number; burst: number }> = ({ unleash }) => {
  const count = 18000;
  const meshRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes, phases, isGold } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const pha = new Float32Array(count);
    const gold = new Float32Array(count);
    const treeHeight = 11;
    const treeRadius = 4.5;

    for (let i = 0; i < count; i++) {
      const y = Math.random() * treeHeight - treeHeight / 2;
      const normalizedY = (y + treeHeight / 2) / treeHeight;
      const rLimit = (1.0 - normalizedY) * treeRadius;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.6) * rLimit;

      pos[i * 3] = r * Math.cos(angle);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(angle);

      const distRatio = r / (rLimit + 0.001);
      let targetColor = PALETTE.emerald.clone();
      
      if (distRatio > 0.65) {
        targetColor.lerp(PALETTE.brightGold, (distRatio - 0.65) * 2.8);
        gold[i] = 1.0;
        if (Math.random() > 0.9) targetColor.lerp(new THREE.Color('#ffffff'), 0.5);
      } else {
        targetColor.lerp(PALETTE.lightEmerald, (distRatio) * 1.5);
        gold[i] = 0.0;
      }

      col[i * 3] = targetColor.r;
      col[i * 3 + 1] = targetColor.g;
      col[i * 3 + 2] = targetColor.b;

      siz[i] = Math.random() * 0.4 + 0.08;
      pha[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, colors: col, sizes: siz, phases: pha, isGold: gold };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uUnleash: { value: 0 }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.getElapsedTime();
      mat.uniforms.uUnleash.value += (unleash - mat.uniforms.uUnleash.value) * 0.04;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={count} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aIsGold" count={count} array={isGold} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
