import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type { Spec } from '../hooks/useScrollStory'
import { FIELD_STATES, NEURAL_CONFIG } from '../config/neural'
import { DEFAULT_SCENE_TARGET, SCENE_TARGETS } from '../components/sceneStates'
import { clamp01, dampValue } from './math'
import { createNeuralSystem, type NeuralSystem } from './system'
import { NeuralNodes } from './NeuralNodes'
import { NeuralConnections } from './NeuralConnections'
import { SignalFlow } from './SignalFlow'
import { NeuralDendrites } from './NeuralDendrites'
import { TransferPulse } from './TransferPulse'

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
  nextBurst: number
  ripple: number
}

const rippleDuration = 1.5
const IDENTITY = new THREE.Matrix4()
const tmp = new THREE.Vector3()
const tmp2 = new THREE.Vector3()
const clusterOsc = new Float32Array(8)
const MAX_GLOW = 1.6

/** human network — warm white / silver / soft amber */
const HUMAN_BASE = [1.0, 0.94, 0.82]
const HUMAN_ACC = [1.0, 0.76, 0.42]
/** machine network — cool white / electric blue */
const AI_BASE = [0.7, 0.8, 1.0]
const AI_ACC = [0.32, 0.52, 1.0]

function projectThemePosition(theme: string, x: number, y: number, z: number, out: THREE.Vector3) {
  if (theme === 'yotoqhonam') {
    const g = 0.24
    out.set(Math.round(x / g) * g, y * 1.12, Math.round(z / g) * g)
    return
  }
  if (theme === 'antifake') {
    const r = Math.sqrt(x * x + y * y + z * z)
    const rr = r * (1 + 0.14 * Math.sin(r * 3.2))
    const inv = r > 0.0001 ? rr / r : 0
    out.set(x * inv, y * inv, z * inv)
    return
  }
  // shieldx — directional / security
  out.set(x * 1.06, y * 0.8, z)
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
  const swQ = useMemo(() => sys.clusters.map(() => new THREE.Quaternion()), [sys.clusters])
  const swAxis = useMemo(
    () => sys.clusters.map((c) => c.clone().normalize()),
    [sys.clusters],
  )
  const pointer = useMemo(() => ({ x: 0, y: 0 }), [])
  const lastT = useRef(0)
  const s = useRef<FieldState>({
    r: FIELD_STATES.mind.r,
    op: FIELD_STATES.mind.op,
    edgeOp: FIELD_STATES.mind.edgeOp,
    phase: FIELD_STATES.mind.phase,
    themeT: 0,
    hover: 0,
    nextBurst: 7 + Math.random() * 4,
    ripple: -1,
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
        groupObj.rotation.set(0, 0, 0)
      } else {
        // the machine net stands still; the human net drifts and follows the cursor
        const life = 1 - ph * 0.85
        const dx = drag ? drag.sx : 0
        const dy = drag ? drag.sy : 0
        groupObj.rotation.y =
          -t * 0.03 * life + dx + pointer.x * cfg.interactionTilt * 0.6 * (0.35 + st.hover)
        groupObj.rotation.x =
          Math.sin(t * 0.05) * 0.022 * life +
          dy * 0.7 +
          pointer.y * cfg.interactionTilt * 0.5 * (0.35 + st.hover)
        groupObj.rotation.z = -pointer.x * cfg.interactionTilt * 0.4 * life
      }
      groupObj.updateMatrixWorld(true)
    }
    const mw = groupObj ? groupObj.matrixWorld : IDENTITY

    /* node positions: organic human home + sway + theme, morphed toward the
       structured machine layout by `phase` */
    const positions = sys.positions
    const base = sys.basePos
    const aiP = sys.aiPos
    const sway = reducedMotion ? 0 : (chapter.sway ?? 1)
    const oscAmp = 0.035 * sway
    const driftPhase = reducedMotion ? 0 : t * 0.09
    for (let k = 0; k < Math.min(sys.clusters.length, clusterOsc.length); k++) {
      clusterOsc[k] = 1 + oscAmp * Math.sin(driftPhase + k * 2.1)
      if (!reducedMotion && sway > 0.001) {
        swQ[k].setFromAxisAngle(swAxis[k], 0.03 * sway * Math.sin(t * 0.07 + k * 1.7))
      } else {
        swQ[k].identity()
      }
    }
    const themeBlend = st.themeT > 0.001 && theme ? st.themeT * 0.55 : 0
    const inv = 1 - ph
    for (let i = 0; i < sys.count; i++) {
      const c = sys.cluster[i]
      const o = clusterOsc[c]
      tmp2.set(base[i * 3] * o, base[i * 3 + 1] * o, base[i * 3 + 2] * o).applyQuaternion(swQ[c])
      if (themeBlend > 0 && theme) {
        projectThemePosition(theme, base[i * 3], base[i * 3 + 1], base[i * 3 + 2], tmp)
        tmp2.x += (tmp.x - tmp2.x) * themeBlend
        tmp2.y += (tmp.y - tmp2.y) * themeBlend
        tmp2.z += (tmp.z - tmp2.z) * themeBlend
      }
      positions[i * 3] = tmp2.x * inv + aiP[i * 3] * ph
      positions[i * 3 + 1] = tmp2.y * inv + aiP[i * 3 + 1] * ph
      positions[i * 3 + 2] = tmp2.z * inv + aiP[i * 3 + 2] * ph
      const px = positions[i * 3]
      const py = positions[i * 3 + 1]
      const pz = positions[i * 3 + 2]
      sys.radius[i] = Math.sqrt(px * px + py * py + pz * pz)
    }

    /* node colours + sizes (depth-cued, warm → cool with the morph) */
    sys.op = st.op
    sys.edgeOp = st.edgeOp
    sys.dendOp = clamp01(1 - ph * 1.35)
    sys.morph = ph
    const glow = sys.glow
    const nodeSizeArr = sys.nodeSizeArr
    const nodeCol = sys.nodeColorArr
    const hover = st.hover
    const op = st.op

    for (let i = 0; i < sys.count; i++) {
      tmp.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      tmp.applyMatrix4(mw)
      const dist = tmp.distanceTo(camera.position)
      const d = clamp01((dist - 3.4) / 2.4)
      sys.depth[i] = d

      const g = glow[i]
      const accT = sys.accent[i] * (0.35 + g * 0.65 + hover * 0.35)
      const bright =
        Math.max(0.14, (1 - d * 0.45) * 1.05 + g * 0.6 + hover * 0.04) * (0.52 + op * 0.7)

      nodeSizeArr[i] =
        cfg.nodeSize *
        sys.scale[i] *
        (1.35 - d * 0.55) *
        (1 + g * 0.3) *
        (1 + ph * 0.25) *
        (1 + (sys.accent[i] ? cfg.nodeActiveSize - 1 : 0) * 0.4)

      // base tone: warm silver (human) → cool white (machine)
      const baseR = (HUMAN_BASE[0] + (AI_BASE[0] - HUMAN_BASE[0]) * ph) * (1 - d * 0.38) * bright
      const baseG = (HUMAN_BASE[1] + (AI_BASE[1] - HUMAN_BASE[1]) * ph) * (1 - d * 0.38) * bright
      const baseB = (HUMAN_BASE[2] + (AI_BASE[2] - HUMAN_BASE[2]) * ph) * (1 - d * 0.34) * bright
      const accR = HUMAN_ACC[0] + (AI_ACC[0] - HUMAN_ACC[0]) * ph
      const accG = HUMAN_ACC[1] + (AI_ACC[1] - HUMAN_ACC[1]) * ph
      const accB = HUMAN_ACC[2] + (AI_ACC[2] - HUMAN_ACC[2]) * ph
      const accTb = Math.min(accT, 1)
      nodeCol[i * 3] = baseR + (accR * bright - baseR) * accTb
      nodeCol[i * 3 + 1] = baseG + (accG * bright - baseG) * accTb
      nodeCol[i * 3 + 2] = baseB + (accB * bright - baseB) * accTb
    }

    /* signals, bursts, ripples, idle life */
    if (!reducedMotion) {
      const speedBoost = 1 + (velocity.current ?? 0) * 0.7
      const signals = sys.signals
      const edges = sys.edges
      const activeArr = sys.edgeActive

      for (let i = 0; i < sys.count; i++) {
        glow[i] += (0.5 + 0.5 * Math.sin(t * 0.8 + sys.phase[i] * 3)) * 0.05 * sys.accent[i]
        if (glow[i] > MAX_GLOW) glow[i] = MAX_GLOW
      }

      const respawn = (sig: (typeof signals)[number], high: boolean) => {
        const pool = sys.startEdges
        const ei = pool[Math.floor(Math.random() * pool.length)] ?? 0
        sig.edge = ei
        sig.t = 0
        sig.speed =
          cfg.signalSpeed[0] +
          Math.random() * (cfg.signalSpeed[1] - cfg.signalSpeed[0]) * (high ? 1.6 : 1)
      }

      const advanceOne = (sIdx: number, high: boolean) => {
        const sig = signals[sIdx]
        const e = edges[sig.edge]
        const ax = e.a === sys.sentinel ? 0 : positions[e.a * 3]
        const ay = e.a === sys.sentinel ? 0 : positions[e.a * 3 + 1]
        const az = e.a === sys.sentinel ? 0 : positions[e.a * 3 + 2]
        const bx = e.b === sys.sentinel ? 0 : positions[e.b * 3]
        const by = e.b === sys.sentinel ? 0 : positions[e.b * 3 + 1]
        const bz = e.b === sys.sentinel ? 0 : positions[e.b * 3 + 2]
        const len = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2 + (bz - az) ** 2) || 0.001
        sig.t += ((sig.speed * speedBoost * (high ? 1.5 : 1)) * dt) / len
        activeArr[sig.edge] = Math.min(activeArr[sig.edge] + dt * 4, 2)
        if (sig.t >= 1) {
          sig.t = 0
          const node = e.b
          if (node === sys.sentinel || sys.radius[node] < cfg.coreRadius) {
            if (corePulse.current) corePulse.current.target = Math.min(1.6, corePulse.current.target + 0.3)
            st.ripple = 0
            respawn(sig, high)
          } else {
            glow[node] = Math.min(glow[node] + 0.9, MAX_GLOW)
            const next = sys.outgoing[node]
            if (next !== -1) sig.edge = next
            else respawn(sig, high)
          }
        }
      }

      for (let si = 0; si < signals.length; si++) advanceOne(si, false)

      /* ripple wave — outward from the core */
      if (st.ripple >= 0) {
        st.ripple += dt
        if (st.ripple > rippleDuration) st.ripple = -1
        else {
          const p = st.ripple / rippleDuration
          for (let i = 0; i < sys.count; i++) {
            const w = Math.sin(Math.PI * clamp01(p * 1.25 - sys.radius[i] / sys.maxR))
            if (w > 0) glow[i] = Math.min(glow[i] + w * w * 0.7, MAX_GLOW)
          }
        }
      }

      /* rare synchronisation event: an outer cluster wakes, rows stream inward */
      st.nextBurst -= dt
      if (st.nextBurst <= 0) {
        st.nextBurst =
          cfg.syncInterval[0] + Math.random() * (cfg.syncInterval[1] - cfg.syncInterval[0])
        const k = Math.floor(Math.random() * sys.clusters.length)
        let taken = 0
        for (let ei = 0; ei < sys.startEdges.length && taken <= signals.length; ei++) {
          const start = sys.startEdges[ei]
          const a = edges[start].a
          if (a === sys.sentinel || sys.cluster[a] !== k) continue
          const sig = signals[taken % signals.length]
          sig.edge = start
          sig.t = 0
          sig.speed = (cfg.signalSpeed[0] + cfg.signalSpeed[1]) * 0.75
          taken++
        }
        if (taken > 1) {
          st.ripple = 0.18
        }
      }

      /* decay */
      const decay = Math.exp(-dt * cfg.sparkDecay)
      for (let i = 0; i < sys.count; i++) glow[i] *= decay
      for (let i = 0; i < activeArr.length; i++) activeArr[i] *= Math.exp(-dt * 1.2)
    }
  })

  const transferring = section === 'transfer' || section === 'ai'

  return (
    <group ref={group}>
      <NeuralDendrites sys={sys} />
      <NeuralNodes sys={sys} />
      <NeuralConnections sys={sys} />
      <SignalFlow sys={sys} size={NEURAL_CONFIG.signalSize} />
      {!reducedMotion && <TransferPulse active={transferring} />}
    </group>
  )
}
