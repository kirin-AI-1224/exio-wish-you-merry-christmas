import { Vector3, Euler, Color } from 'three';
import { ParticleData } from '../types';

export const generateParticles = (count: number, ornamentRatio: number = 0.05): ParticleData[] => {
  const particles: ParticleData[] = [];
  
  const treeHeight = 12;
  const treeRadius = 5;
  const scatterRadius = 15;

  const lightPink = new Color('#FFE8F0');
  const goldSparkle = new Color('#FBC96B');
  const warmPink = new Color('#FF6B90');
  const softPink = new Color('#FF9FB5');

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const rScatter = (Math.random() * 0.5 + 0.5) * scatterRadius;
    
    const scatterPos = new Vector3(
      rScatter * Math.sin(phi) * Math.cos(theta),
      rScatter * Math.sin(phi) * Math.sin(theta),
      rScatter * Math.cos(phi)
    );

    const y = Math.random() * treeHeight;
    const progressY = 1 - (y / treeHeight);
    const angle = Math.random() * Math.PI * 2;
    const currentMaxRadius = progressY * treeRadius;
    
    const radialFactor = Math.pow(Math.random(), 0.7); 
    const treePos = new Vector3(
      currentMaxRadius * radialFactor * Math.cos(angle),
      y - treeHeight / 2,
      currentMaxRadius * radialFactor * Math.sin(angle)
    );

    let particleColor = new Color();
    const rActual = Math.sqrt(treePos.x ** 2 + treePos.z ** 2);
    const isOuter = rActual > (currentMaxRadius * 0.75);
    
    const heightFactor = Math.max(0, Math.min(1, progressY + (Math.random() - 0.5) * 0.15));

    if (isOuter) {
      const rand = Math.random();
      const pLightPink = 0.25 * heightFactor;
      const pGold = 0.15 * heightFactor;

      if (rand < pLightPink) {
        particleColor.copy(lightPink);
      } else if (rand < pLightPink + pGold) {
        particleColor.copy(goldSparkle);
      } else {
        particleColor.copy(Math.random() > 0.5 ? warmPink : softPink);
      }
    } else {
      particleColor.copy(Math.random() > 0.5 ? warmPink : softPink);
    }

    const scatterRot = new Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    const treeRot = new Euler(
      Math.atan2(treePos.z, treePos.y) + Math.PI / 2,
      0,
      Math.atan2(treePos.x, treePos.z)
    );

    const type = Math.random() < ornamentRatio ? 'ornament' : 'needle';
    const scale = type === 'ornament' ? Math.random() * 0.4 + 0.2 : Math.random() * 0.3 + 0.1;

    particles.push({
      scatterPosition: scatterPos,
      treePosition: treePos,
      scatterRotation: scatterRot,
      treeRotation: treeRot,
      scale,
      type,
      color: particleColor
    });
  }

  return particles;
};
