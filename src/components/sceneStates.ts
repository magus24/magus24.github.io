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
  mind: { x: 0.62, yk: 0.1, z: 0, scale: 0.9 },
  idea: { x: 0.56, yk: -0.02, z: 0.05, scale: 0.98 },
  transfer: { x: 0.16, yk: 0.04, z: 0.2, scale: 1.0 },
  ai: { x: 0, yk: -0.02, z: 0.35, scale: 0.94 },
  execution: { x: 0.02, yk: 0.08, z: 0.3, scale: 0.94 },
  work: { x: 0.3, yk: 0.0, z: 0.12, scale: 1.0 },
  experiments: { x: 0.0, yk: 0.0, z: 0.0, scale: 0.98 },
  about: { x: -0.34, yk: 0.0, z: 0.0, scale: 1.0 },
  contact: { x: 0.0, yk: 0.0, z: 0.0, scale: 1.02 },
}

export const DEFAULT_SCENE_TARGET: SceneTarget = SCENE_TARGETS.mind
