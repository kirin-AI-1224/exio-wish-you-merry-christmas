import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from '../types';

interface StreamerData {
  points: THREE.Vector3[];
  lineRef: React.RefObject<THREE.Line>;
  phaseOffset: number;
  radiusOffset: number;
  speedScale: number;
  burstDirection: THREE.Vector3;
  pathNoise: number;
  speedGroup: 'fast' | 'medium' | 'slow';
}

const vertexShader = `
  attribute float aIndex;
  uniform float uTrailLength;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vHeadGlow;

  void main() {
    float visibility = smoothstep(1.0 - uTrailLength - 0.1, 1.0 - uTrailLength + 0.1, aIndex);
    float trailFade = pow(aIndex, 2.0);
    vAlpha = visibility * trailFade * uOpacity;
    vHeadGlow = smoothstep(0.95, 1.0, aIndex);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vHeadGlow;

  void main() {
    if (vAlpha < 0.01) discard;
    vec3 color = mix(uColor, vec3(1.0, 1.0, 1.0), vHeadGlow * 0.8);
    gl_FragColor = vec4(color, vAlpha);
  }
`;

export const GoldenStreamers: React.FC<{ unleash: boolean }> = ({ unleash }) => {
  const count = 10; 
  const pointsPerLine = 80;
  const treeHeight = 11;
  const treeRadius = 5.5;

  const stateRef = useRef({
    transitionTime: 0,
    trailLength: 1.0,
  });

  const streamers = useMemo(() => {
    const list: StreamerData[] = [];
    const speedGroups: ('fast' | 'medium' | 'slow')[] = ['fast', 'medium', 'slow'];
    
    for (let i = 0; i < count; i++) {
      const points = [];
      for (let j = 0; j < pointsPerLine; j++) {
        points.push(new THREE.Vector3());
      }
      
      const group = speedGroups[i % 3];
      let speedScale = 1.0;
      if (group === 'fast') speedScale = 1.8 + Math.random() * 0.4;
      if (group === 'medium') speedScale = 1.1 + Math.random() * 0.3;
      if (group === 'slow') speedScale = 0.6 + Math.random() * 0.2;

      list.push({
        points,
        lineRef: React.createRef<THREE.Line>(),
        phaseOffset: (i / count) * Math.PI * 2,
        radiusOffset: 0.7 + Math.random() * 0.6,
        speedScale,
        speedGroup: group,
        burstDirection: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize(),
        pathNoise: Math.random() * Math.PI * 2
      });
    }
    return list;
  }, [count]);

  const indexArray = useMemo(() => {
    const arr = new Float32Array(pointsPerLine);
    for (let i = 0; i < pointsPerLine; i++) {
      arr[i] = i / (pointsPerLine - 1);
    }
    return arr;
  }, [pointsPerLine]);

  useEffect(() => {
    stateRef.current.transitionTime = 0;
  }, [unleash]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    stateRef.current.transitionTime += delta;
    
    if (unleash) {
      const burstProgress = Math.min(1, stateRef.current.transitionTime * 0.8);
      stateRef.current.trailLength = THREE.MathUtils.lerp(0.05, 1.0, Math.pow(burstProgress, 1.5));
    } else {
      stateRef.current.trailLength = 1.0;
    }

    const burstProgress = THREE.MathUtils.clamp(stateRef.current.transitionTime * 1.2, 0, 1);
    const easeBurst = burstProgress * burstProgress * (3 - 2 * burstProgress);

    streamers.forEach((s, sIdx) => {
      const line = s.lineRef.current;
      if (!line) return;

      const geo = line.geometry as THREE.BufferGeometry;
      const positions = geo.attributes.position.array as Float32Array;
      const mat = line.material as THREE.ShaderMaterial;
      
      mat.uniforms.uTrailLength.value = stateRef.current.trailLength;
      mat.uniforms.uOpacity.value = unleash ? 0.8 : 0.6;

      for (let j = 0; j < pointsPerLine; j++) {
        const tIdx = j / (pointsPerLine - 1);
        const localTime = time * s.speedScale - (1.0 - tIdx) * 0.15;
        
        let x = 0, y = 0, z = 0;

        const hFreq = 0.7 + sIdx * 0.04;
        const treeHeightProgress = (Math.sin(localTime * hFreq + s.phaseOffset) * 0.5 + 0.5);
        const treeY = treeHeightProgress * treeHeight - treeHeight / 2;
        const rTree = (1 - treeHeightProgress) * treeRadius * s.radiusOffset;
        const thetaTree = localTime * 2.0 + s.phaseOffset;
        const treeX = Math.cos(thetaTree) * rTree;
        const treeZ = Math.sin(thetaTree) * rTree;

        const orbitSpeed = s.speedScale * 0.8;
        const scatterRadius = 14 + Math.sin(localTime * 0.4 + s.pathNoise) * 6;
        const scatterTheta = localTime * orbitSpeed + s.phaseOffset;
        const scatterYBase = Math.sin(localTime * 0.5 + s.phaseOffset) * 8;
        
        const scatterX = Math.cos(scatterTheta) * scatterRadius;
        const scatterZ = Math.sin(scatterTheta) * scatterRadius;
        const scatterY = scatterYBase + Math.cos(localTime * 0.3 + s.pathNoise) * 4;

        if (!unleash) {
          const tFactor = 1 - easeBurst;
          x = THREE.MathUtils.lerp(treeX, scatterX, tFactor);
          y = THREE.MathUtils.lerp(treeY, scatterY, tFactor);
          z = THREE.MathUtils.lerp(treeZ, scatterZ, tFactor);
        } else {
          x = THREE.MathUtils.lerp(treeX, scatterX, easeBurst);
          y = THREE.MathUtils.lerp(treeY, scatterY, easeBurst);
          z = THREE.MathUtils.lerp(treeZ, scatterZ, easeBurst);
          
          const kick = Math.sin(easeBurst * Math.PI) * 1.5;
          x += s.burstDirection.x * kick;
          y += s.burstDirection.y * kick;
          z += s.burstDirection.z * kick;
        }

        positions[j * 3] = x;
        positions[j * 3 + 1] = y;
        positions[j * 3 + 2] = z;
      }
      geo.attributes.position.needsUpdate = true;
    });
  });

  return (
    <group>
      {streamers.map((s, i) => (
        <line key={i} ref={s.lineRef as React.RefObject<THREE.Line>}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pointsPerLine}
              array={new Float32Array(pointsPerLine * 3)}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-aIndex"
              count={pointsPerLine}
              array={indexArray}
              itemSize={1}
            />
          </bufferGeometry>
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            uniforms={{
              uColor: { value: PALETTE.brightGold },
              uTrailLength: { value: 1.0 },
              uOpacity: { value: 0.6 }
            }}
          />
        </line>
      ))}
    </group>
  );
};
