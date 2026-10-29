/**
 * Shared placement of the 3D story field per chapter. `x/yk/z` are the
 * on-screen anchor (fractions of the viewport half-height), `scale` grows
 * the field, and `phase` (also carried by FIELD_STATES) is spent by the
 * neural morph. Human chapters sit the field to one side; the transfer
 * and machine chapters pull it toward the centre.
 */
export interface SceneTarget {
  x: number
  yk: number
  z: number
  scale: number
}

export const SCENE_TARGETS: Record<string, SceneTarget> = {
  mind: { x: 0.44, yk: 0.08, z: -0.22, scale: 0.86 },
  idea: { x: 0.40, yk: -0.02, z: -0.22, scale: 0.88 },
  transfer: { x: 0.36, yk: 0.02, z: -0.20, scale: 0.86 },
  ai: { x: 0.36, yk: -0.02, z: -0.20, scale: 0.84 },
  execution: { x: 0.38, yk: 0.04, z: -0.20, scale: 0.84 },
  work: { x: 0.42, yk: 0.0, z: -0.22, scale: 0.86 },
  experiments: { x: 0.0, yk: 0.0, z: -0.20, scale: 0.84 },
  about: { x: -0.34, yk: 0.0, z: -0.20, scale: 0.86 },
  contact: { x: 0.0, yk: 0.0, z: -0.20, scale: 0.88 },
}

export const DEFAULT_SCENE_TARGET: SceneTarget = SCENE_TARGETS.mind
