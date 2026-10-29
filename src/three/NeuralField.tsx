import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type { Spec } from '../hooks/useScrollStory'
import { FIELD_STATES, NEURAL_CONFIG } from '../config/neural'
import { DEFAULT_SCENE_TARGET, SCENE_TARGETS } from '../components/sceneStates'
import { dampValue } from './math'
import { createNeuralSystem, type NeuralSystem } from './system'
import { TransferPulse } from './TransferPulse'
import { BrainCortex } from './BrainCortex'
import { NeuralCyberEffects } from './NeuralCyberEffects'

/** Shared event channel: NeuralField raises pulses, the scene reacts to them. */
export interface CoreEvent {
  target: number
}

export interface NeuralFieldProps {
  spec: Spec
  section: string
  projectId: RefObject<string | null>
  velocity: RefObject<number>
  reducedMotion: boolean
  corePulse: RefObject<CoreEvent>
  drag?: { sx: number; sy: number }
}

interface FieldState {
  r: number
  op: number
  edgeOp: number
  phase: number
  themeT: number
  hover: number
}

export function createFieldSystem(spec: Spec): NeuralSystem {
  const tier = spec.particles <= 42 ? 1 : spec.particles <= 72 ? 2 : 3
  return createNeuralSystem(NEURAL_CONFIG, tier)
}

export function NeuralField({
  spec,
  section,
  projectId,
  velocity,
  reducedMotion,
  corePulse,
  drag,
}: NeuralFieldProps) {
  const group = useRef<THREE.Group>(null)
  const sys = useMemo(() => createFieldSystem(spec), [spec])
  const pointer = useMemo(() => ({ x: 0, y: 0 }), [])
  const lastT = useRef(0)
  const pulseTimer = useRef(0)

  const s = useRef<FieldState>({
    r: FIELD_STATES.mind.r,
    op: FIELD_STATES.mind.op,
    edgeOp: FIELD_STATES.mind.edgeOp,
    phase: FIELD_STATES.mind.phase,
    themeT: 0,
    hover: 0,
  })

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [pointer])

  useFrame(({ clock, camera, size }) => {
    const t = clock.getElapsedTime()
    const dt = lastT.current === 0 ? 0.016 : Math.min(t - lastT.current, 0.05)
    lastT.current = t

    const st = s.current
    const chapter = FIELD_STATES[section] ?? FIELD_STATES.mind
    const scene = SCENE_TARGETS[section] ?? DEFAULT_SCENE_TARGET
    const cfg = NEURAL_CONFIG

    const damp = (key: 'r' | 'op' | 'edgeOp' | 'phase' | 'themeT' | 'hover', target: number) =>
      (st[key] = dampValue(st[key], target, 3, dt))

    damp('r', chapter.r)
    damp('op', chapter.op)
    damp('edgeOp', chapter.edgeOp)
    damp('phase', chapter.phase)
    const pid = projectId.current
    const theme = pid === 'yotoqhonam' || pid === 'antifake' || pid === 'shieldx' ? pid : null
    damp('themeT', theme ? 1 : 0)
    damp('hover', Math.abs(pointer.x) < 0.22 && Math.abs(pointer.y) < 0.22 ? 1 : 0)

    const ph = st.phase
    const breath =
      reducedMotion || spec.particles <= 0
        ? 1
        : 1 + cfg.breathing.amp * Math.sin((t / cfg.breathing.period) * Math.PI * 2) * (1 - ph * 0.7)

    /* field group transform — a slow camera-like travel down the story */
    const groupObj = group.current
    if (groupObj) {
      const aspect = size.width / Math.max(size.height, 1)
      const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 34
      const halfH = Math.tan((fov * Math.PI) / 360) * 4.6

      groupObj.position.x = dampValue(groupObj.position.x, scene.x * halfH * aspect, 3, dt)
      groupObj.position.y = dampValue(groupObj.position.y, scene.yk * halfH, 3, dt)
      groupObj.position.z = dampValue(groupObj.position.z, scene.z, 3, dt)
      groupObj.scale.setScalar(scene.scale * st.r * breath)

      if (reducedMotion) {
        groupObj.rotation.set(0.32, 0.42, 0)
      } else {
        // Human brain has elegant isometric anatomical pitch & yaw; AI core stabilizes upright
        const life = 1 - ph * 0.85
        const basePitch = 0.32 * life
        const baseYaw = 0.42 * life
        const dx = drag ? drag.sx : 0
        const dy = drag ? drag.sy : 0

        groupObj.rotation.y =
          baseYaw - t * 0.03 * life + dx + pointer.x * cfg.interactionTilt * 0.6 * (0.35 + st.hover)
        groupObj.rotation.x =
          basePitch +
          Math.sin(t * 0.05) * 0.022 * life +
          dy * 0.7 +
          pointer.y * cfg.interactionTilt * 0.5 * (0.35 + st.hover)
        groupObj.rotation.z = -pointer.x * cfg.interactionTilt * 0.4 * life
      }
      groupObj.updateMatrixWorld(true)
    }

    // Occasional subtle core pulse for scene reactivity
    pulseTimer.current += dt
    if (pulseTimer.current > 3.0) {
      pulseTimer.current = 0
      if (corePulse.current) {
        corePulse.current.target = Math.min(1.4, corePulse.current.target + 0.25)
      }
    }
  })

  const transferring = section === 'transfer' || section === 'ai'

  return (
    <group ref={group}>
      <BrainCortex sys={sys} morph={s.current.phase} opacity={s.current.op} />
      <NeuralCyberEffects
        morph={s.current.phase}
        opacity={s.current.op}
        velocity={velocity}
        reducedMotion={reducedMotion}
      />
      {!reducedMotion && <TransferPulse active={transferring} />}
    </group>
  )
}
