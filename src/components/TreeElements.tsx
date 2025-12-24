import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleData, TreeMorphState, PALETTE } from '../types';
import { generateParticles } from '../utils/math';

interface TreeElementsProps {
  targetState: TreeMorphState;
}

const TreeElements: React.FC<TreeElementsProps> = ({ targetState }) => {
  const needleCount = 4500;
  const ornamentCount = 200;
  
  const particles = useMemo(() => 
    generateParticles(needleCount + ornamentCount, ornamentCount / (needleCount + ornamentCount)), 
    []
  );
  
  const needleRef = useRef<THREE.InstancedMesh>(null);
  const ornamentRef = useRef<THREE.InstancedMesh>(null);
  const morphRef = useRef(1); 
  
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);
  const tempRot = useMemo(() => new THREE.Euler(), []);

  useEffect(() => {
    if (!needleRef.current || !ornamentRef.current) return;

    if (!needleRef.current.instanceColor) {
      needleRef.current.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(needleCount * 3), 3
      );
    }
    if (!ornamentRef.current.instanceColor) {
      ornamentRef.current.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(ornamentCount * 3), 3
      );
    }

    let needleIdx = 0;
    let ornamentIdx = 0;

    particles.forEach((p) => {
      let c = p.type === 'needle' ? PALETTE.emerald.clone() : PALETTE.metalGold.clone();
      if (Math.random() > 0.7) c.lerp(PALETTE.brightGold, 0.6);

      if (p.type === 'needle') {
        needleRef.current?.setColorAt(needleIdx++, c);
      } else {
        ornamentRef.current?.setColorAt(ornamentIdx++, c);
      }
    });

    needleRef.current.instanceColor.needsUpdate = true;
    ornamentRef.current.instanceColor.needsUpdate = true;
  }, [particles, needleCount, ornamentCount]);

  useFrame((state, delta) => {
    const targetValue = targetState === TreeMorphState.TREE_SHAPE ? 1 : 0;
    morphRef.current += (targetValue - morphRef.current) * Math.min(1, delta * 3.5);

    const t = THREE.MathUtils.clamp(morphRef.current, 0, 1);
    const ease = t * t * (3 - 2 * t);

    let needleIdx = 0;
    let ornamentIdx = 0;
    const time = state.clock.getElapsedTime();

    particles.forEach((p) => {
      tempPos.lerpVectors(p.scatterPosition, p.treePosition, ease);
      
      const noise = (1 - ease) * 0.4;
      tempPos.x += Math.sin(time * 0.3 + p.scatterPosition.x) * noise;
      tempPos.y += Math.cos(time * 0.4 + p.scatterPosition.y) * noise;
      tempPos.z += Math.sin(time * 0.2 + p.scatterPosition.z) * noise;

      tempRot.set(
        p.scatterRotation.x + (p.treeRotation.x - p.scatterRotation.x) * ease,
        p.scatterRotation.y + (p.treeRotation.y - p.scatterRotation.y) * ease,
        p.scatterRotation.z + (p.treeRotation.z - p.scatterRotation.z) * ease
      );
      tempQuat.setFromEuler(tempRot);

      const scaleValue = p.scale * (0.95 + 0.05 * Math.sin(time * 3 + p.scatterPosition.x));
      tempScale.set(scaleValue, scaleValue, scaleValue);
      tempMatrix.compose(tempPos, tempQuat, tempScale);

      if (p.type === 'needle') {
        needleRef.current?.setMatrixAt(needleIdx++, tempMatrix);
      } else {
        ornamentRef.current?.setMatrixAt(ornamentIdx++, tempMatrix);
      }
    });

    if (needleRef.current) needleRef.current.instanceMatrix.needsUpdate = true;
    if (ornamentRef.current) ornamentRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={needleRef} args={[undefined, undefined, needleCount]}>
        <cylinderGeometry args={[0.01, 0.035, 0.45, 4]} />
        <meshStandardMaterial 
          roughness={0.15} 
          metalness={1.0} 
          emissive={PALETTE.emerald}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </instancedMesh>

      <instancedMesh ref={ornamentRef} args={[undefined, undefined, ornamentCount]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial 
          roughness={0.05} 
          metalness={1.0} 
          emissive={PALETTE.brightGold}
          emissiveIntensity={1.2}
        />
      </instancedMesh>
    </group>
  );
};

export default TreeElements;
