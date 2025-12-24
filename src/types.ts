import { Vector3, Color, Euler } from 'three';

export interface ParticleData {
  scatterPosition: Vector3;
  treePosition: Vector3;
  scatterRotation: Euler;
  treeRotation: Euler;
  scale: number;
  type: 'needle' | 'ornament';
  color: Color;
}

export interface WishData {
  startTime: number;
  duration: number;
}

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export const PALETTE = {
  emerald: new Color('#022c22'),
  lightEmerald: new Color('#10b981'),
  brightGold: new Color('#ffcc33'),
  metalGold: new Color('#b45309'),
  whiteGlow: new Color('#ffffff'),
  pureGold: new Color('#ffd700'),
  warmPink: new Color('#ff4d88'),
  lightGold: new Color('#fef3c7')
} as const;
