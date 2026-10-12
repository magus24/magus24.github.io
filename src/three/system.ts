import * as THREE from 'three'
import type { NeuralConfig, NeuralTier } from '../config/neural'
import { mulberry32, randUnit } from './math'

/**
 * The NEURAL SYSTEM is the pure data of the field: node coordinates,
 * synaptic filaments, signal particles and the scratch buffers the
 * renderers write to every frame. It is generated once (seeded) and
 * stays fixed — dynamics live in NeuralField.
 */

export type EdgeKind = 0 | 1 | 2 | 3 // thread (inward) | weave (local) | bridge (cluster) | feed (into core)

export interface FieldEdge {
  a: number
  b: number
  kind: EdgeKind
  intensity: number
}

export interface FieldSignal {
  /** index into `edges` the particle currently travels */
  edge: number
  /** normalized progress 0..1 along the edge */
  t: number
  /** speed in field units / second */
  speed: number
}

export interface NeuralSystem {
  count: number
  /** current local field coordinates (updated by drift / themes) */
  positions: Float32Array
  /** the untouched home coordinates generated at startup */
  basePos: Float32Array
  /** current distance from the core centre */
  radius: Float32Array
  /** start positions of per-node dendrite stubs (n * perNode * 3), zeroed where absent */
  dendDirs: Float32Array
  cluster: Int8Array
  /** 0 = passive white node, 1 = active-capable (blue) node */
  accent: Float32Array
  /** base relative size */
  scale: Float32Array
  /** random phase used by idle life / micro activation */
  phase: Float32Array
  /** spark energy, decays over time */
  glow: Float32Array
  /** per-frame camera-distance factor 0 (near) .. 1 (far) */
  depth: Float32Array
  /** per-frame instanced size + color */
  nodeSizeArr: Float32Array
  nodeColorArr: Float32Array
  edges: FieldEdge[]
  edgePositions: Float32Array
  edgeColor: Float32Array
  /** 0..1 — rises while a signal travels the edge (edge glows) */
  edgeActive: Float32Array
  signals: FieldSignal[]
  /** for each node: index of its inward thread edge (or -1) */
  outgoing: Int32Array
  /** thread edges whose start node is outer — respawn pool */
  startEdges: Int32Array
  /** cluster centre directions */
  clusters: THREE.Vector3[]
  /** virtual node at the core origin used by feed filaments */
  sentinel: number
  maxR: number
  /** mutable per-frame chapter brightness multipliers */
  op: number
  edgeOp: number
}

/* ------------------------------------------------------------------ *
 * Human-brain geometry: nodes are sampled inside a two-hemisphere      *
 * brain volume — a longitudinal fissure along the top midline, a       *
 * folded cortical surface (gyri/sulci), a temporal-lobe swell, a       *
 * flattened base and a separate cerebellum. Everything is built in     *
 * "design units" and then rescaled so the longest axis meets the       *
 * configured field envelope.                                           *
 * ------------------------------------------------------------------ */

const BRAIN_REGIONS: Array<[number, number, number]> = [
  [0.62, 0.34, 0.62], // left frontal
  [-0.62, 0.34, 0.62], // right frontal
  [0.78, -0.12, 0.04], // left temporal
  [-0.78, -0.12, 0.04], // right temporal
  [0.58, 0.36, -0.62], // left parieto-occipital
  [-0.58, 0.36, -0.62], // right parieto-occipital
  [0.0, -0.46, -0.7], // cerebellum
]

type BrainShape = NeuralConfig['brain']

/** coherent gyri/sulci — a wrinkled cortical surface for a given direction */
function brainFold(nx: number, ny: number, nz: number) {
  const th = Math.atan2(nz, nx)
  const ph = Math.asin(THREE.MathUtils.clamp(ny, -1, 1))
  return (
    1 +
    0.06 * Math.sin(6 * th + 1.3) * Math.cos(5 * ph) +
    0.045 * Math.sin(9 * th + 2.1) * Math.sin(4 * ph + 0.6) +
    0.03 * Math.cos(14 * th + 0.4) * Math.cos(7 * ph)
  )
}

/** a point on the folded cerebral surface for a random direction */
function brainSurface(rnd: () => number, out: THREE.Vector3, b: BrainShape) {
  randUnit(rnd, out)
  const f = brainFold(out.x, out.y, out.z)
  let x = out.x * b.ax * f
  let y = out.y * b.ay * f
  let z = out.z * b.az * f
  if (y < 0) y *= 0.86 // the base is flatter than the domed top
  const temporal = Math.max(0, -out.y) * Math.max(0, 1 - Math.abs(out.z) * 1.15)
  x *= 1 + 0.1 * temporal // temporal-lobe swell on the lower sides
  x *= 1 - (0.14 * Math.max(0, Math.abs(out.z) - 0.72)) / 0.28 // front/back taper
  if (y > 0) {
    // longitudinal fissure: a groove along the top midline
    const g = Math.exp(-((x / 0.34) ** 2))
    y -= 0.2 * g * Math.min(1, out.y * 1.7)
  }
  out.set(x, y, z)
  return out
}

function cerebellumPoint(rnd: () => number, out: THREE.Vector3, b: BrainShape) {
  randUnit(rnd, out).multiplyScalar(0.55 + rnd() * 0.45)
  out.set(
    out.x * b.cerebellum.rx,
    b.cerebellum.y + out.y * b.cerebellum.ry,
    b.cerebellum.z + out.z * b.cerebellum.rz,
  )
  return out
}

export function nearestCluster(clusters: THREE.Vector3[], p: THREE.Vector3): number {
  let best = 0
  let bd = Infinity
  for (let k = 0; k < clusters.length; k++) {
    const dx = p.x - clusters[k].x
    const dy = p.y - clusters[k].y
    const dz = p.z - clusters[k].z
    const d = dx * dx + dy * dy + dz * dz
    if (d < bd) {
      bd = d
      best = k
    }
  }
  return best
}

export function createNeuralSystem(config: NeuralConfig, tier: NeuralTier): NeuralSystem {
  const budget = config.tiers[tier]
  const n = budget.nodes
  const rnd = mulberry32(0x5eed)
  const R = config.outerR
  const B = config.brain
  const sentinel = n

  /* ---------- brain regions (cluster centres, design units) ---------- */
  const regionDirs = BRAIN_REGIONS.map((d) => new THREE.Vector3(d[0], d[1], d[2]))
  const C = regionDirs.length
  const CB = C - 1 // cerebellum cluster index

  /* ---------- nodes sampled inside the brain volume ---------- */
  const raw = new Float32Array(n * 3)
  const cluster = new Int8Array(n)
  const accent = new Float32Array(n)
  const scale = new Float32Array(n)
  const phase = new Float32Array(n)
  const dir = new THREE.Vector3()

  for (let i = 0; i < n; i++) {
    let ci: number
    if (rnd() < B.cerebellum.frac) {
      cerebellumPoint(rnd, dir, B)
      ci = CB
    } else {
      brainSurface(rnd, dir, B)
      const band = rnd()
      const s =
        band < 0.68
          ? 0.84 + rnd() * 0.16 // cortical shell
          : band < 0.9
            ? 0.5 + rnd() * 0.34 // inner cortex
            : 0.12 + rnd() * 0.4 // deep (thalamic) nodes
      dir.multiplyScalar(s)
      ci = nearestCluster(regionDirs, dir)
    }
    raw[i * 3] = dir.x
    raw[i * 3 + 1] = dir.y
    raw[i * 3 + 2] = dir.z
    cluster[i] = ci
    accent[i] = rnd() < config.accentRatio ? 1 : 0
    scale[i] = 0.7 + rnd() * 0.6
    phase[i] = rnd() * Math.PI * 2
  }

  /* ---------- normalise so the longest axis reaches the envelope ---------- */
  let maxR = 0
  for (let i = 0; i < n; i++) {
    const r = Math.hypot(raw[i * 3], raw[i * 3 + 1], raw[i * 3 + 2])
    if (r > maxR) maxR = r
  }
  const k = maxR > 1e-4 ? (R * 0.82) / maxR : 1

  const positions = new Float32Array(n * 3)
  const basePos = new Float32Array(n * 3)
  const radius = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = raw[i * 3] * k
    const y = raw[i * 3 + 1] * k
    const z = raw[i * 3 + 2] * k
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    basePos[i * 3] = x
    basePos[i * 3 + 1] = y
    basePos[i * 3 + 2] = z
    radius[i] = Math.hypot(x, y, z)
  }

  const clusters = regionDirs.map((d) => d.clone().multiplyScalar(k))

  /* ---------- filaments ---------- */
  const edges: FieldEdge[] = []
  const key = new Set<number>()
  const keyOf = (a: number, b: number) => (a < b ? a * 200000 + b : b * 200000 + a)
  const addEdge = (a: number, b: number, kind: EdgeKind) => {
    if (a === b) return
    const k = keyOf(a, b)
    if (key.has(k)) return
    key.add(k)
    const base =
      kind === 0 ? 0.42 : kind === 1 ? 0.16 : kind === 2 ? 0.34 : 0.55
    edges.push({ a, b, kind, intensity: base + rnd() * (kind === 3 ? 0.35 : 0.2) })
  }

  const outgoing = new Int32Array(n).fill(-1)

  const threshold = 0.95
  // inward synaptic threads: the outer band reaches toward a closer node
  for (let i = 0; i < n; i++) {
    const ri = radius[i]
    if (ri < threshold) continue
    let best = -1
    let bd = Infinity
    let long = rnd() < 0.07
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      const rj = radius[j]
      if (rj >= ri * 0.82 || rj < config.innerCutoff) continue
      if (long && rj >= ri * 0.5) continue
      const dx = positions[i * 3] - positions[j * 3]
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
      const d = dx * dx + dy * dy + dz * dz
      if (d < bd) {
        bd = d
        best = j
      }
    }
    if (best >= 0 && bd < 8.5) {
      const at = edges.length
      addEdge(i, best, 0)
      if (edges.length > at) outgoing[i] = at
    }
  }

  // weave: local cluster links (the short organic connections)
  const weaveCount = Math.min(Math.ceil(n * 0.34), budget.edges)
  let added = 0
  for (let i = 0; i < n && added < weaveCount; i++) {
    const ci = cluster[i]
    let got = 0
    for (let j = 0; j < n && got < config.weave; j++) {
      if (i === j || cluster[j] !== ci) continue
      const dx = positions[i * 3] - positions[j * 3]
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
      const d = dx * dx + dy * dy + dz * dz
      if (d > config.weaveDist * config.weaveDist) continue
      const at = edges.length
      addEdge(i, j, 1)
      if (edges.length > at) got++
    }
    added += got
  }

  // bridge clusters: connect the innermost node of each cluster to neighbours
  for (let k = 0; k < C; k++) {
    let hub = -1
    let hr = Infinity
    for (let i = 0; i < n; i++) {
      if (cluster[i] === k && radius[i] < hr) {
        hr = radius[i]
        hub = i
      }
    }
    if (hub === -1) continue
    const j = (k + 1) % C
    for (let i = 0; i < n; i++) {
      if (cluster[i] !== j) continue
      addEdge(hub, i, 2)
      break
    }
  }

  // feed filaments: the deepest nodes wire straight into the core
  const order: number[] = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => radius[a] - radius[b],
  )
  const feedMax = Math.min(9, order.length)
  for (let k = 0; k < feedMax; k++) {
    addEdge(order[k], sentinel, 3)
  }

  // reserve a small fraction of the budget for a few connective short links
  let guard = 0
  while (edges.length < budget.edges * 0.85 && guard < n * 5) {
    guard++
    const a = Math.floor(rnd() * n)
    const b = Math.floor(rnd() * n)
    if (a === b) continue
    const dx = positions[a * 3] - positions[b * 3]
    const dy = positions[a * 3 + 1] - positions[b * 3 + 1]
    const dz = positions[a * 3 + 2] - positions[b * 3 + 2]
    const sq = dx * dx + dy * dy + dz * dz
    if (sq <= config.weaveDist * config.weaveDist * 1.25) addEdge(a, b, 1)
  }

  /* ---------- dendrite stubs (neurite tufts at each node) ---------- */
  const perStub = config.dendrites.perNode
  const dendDirs = new Float32Array(n * perStub * 3)
  const tA = new THREE.Vector3()
  const tB = new THREE.Vector3()
  const tmpT = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    if (rnd() >= config.dendrites.ratio) continue
    const d = dir.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]).normalize()
    const nStub = 1 + Math.floor(rnd() * perStub)
    for (let s = 0; s < nStub; s++) {
      randUnit(rnd, tmpT)
      tA.copy(d).cross(tmpT)
      if (tA.lengthSq() < 1e-4) tA.set(1, 0, 0).cross(d)
      tA.normalize()
      // alternate: tangential tuft with a slight outward lean for organic shape
      tB.copy(tA).multiplyScalar(0.85).addScaledVector(d, 0.32 * (s % 2 === 0 ? 1 : -1)).normalize()
      const L = config.dendrites.length * (0.6 + rnd() * 0.8)
      const o = (i * perStub + s) * 3
      dendDirs[o] = tB.x * L
      dendDirs[o + 1] = tB.y * L
      dendDirs[o + 2] = tB.z * L
    }
  }

  /* ---------- signal pool ---------- */
  const startEdges: number[] = []
  for (let e = 0; e < edges.length; e++) {
    const ed = edges[e]
    if (ed.kind !== 0 && ed.kind !== 3) continue
    const srcR = ed.a === sentinel ? 0 : radius[ed.a]
    if (srcR > 1.0 || ed.kind === 3) startEdges.push(e)
  }

  const signals: FieldSignal[] = []
  for (let s = 0; s < budget.signals; s++) {
    const ei = startEdges[Math.floor(rnd() * startEdges.length)] ?? 0
    signals.push({
      edge: ei,
      t: rnd(),
      speed: config.signalSpeed[0] + rnd() * (config.signalSpeed[1] - config.signalSpeed[0]),
    })
  }

  const edgeCount = edges.length
  return {
    count: n,
    positions,
    basePos,
    radius,
    dendDirs,
    cluster,
    accent,
    scale,
    phase,
    glow: new Float32Array(n),
    depth: new Float32Array(n),
    nodeSizeArr: new Float32Array(n),
    nodeColorArr: new Float32Array(n * 3),
    edges,
    edgePositions: new Float32Array(edgeCount * 6),
    edgeColor: new Float32Array(edgeCount * 6),
    edgeActive: new Float32Array(edgeCount),
    signals,
    outgoing,
    startEdges: Int32Array.from(startEdges),
    clusters,
    sentinel,
    maxR: R,
    op: 0.5,
    edgeOp: 0.34,
  }
}