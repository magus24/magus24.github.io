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
  /** the untouched human-network home coordinates generated at startup */
  basePos: Float32Array
  /** the machine-network home coordinates (structured compute layers) */
  aiPos: Float32Array
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
  /** per-frame dendrite tuft opacity (fades out as the net regularizes) */
  dendOp: number
  /** per-frame morph weight 0 = organic human net, 1 = machine net */
  morph: number
}

/* ------------------------------------------------------------------ *
 * Human-brain geometry: authentic dual-hemisphere anatomy with a       *
 * deep longitudinal fissure, procedurally folded cortical gyri &       *
 * sulci, prominent frontal/temporal/occipital lobes, bilateral         *
 * cerebellum lobes, and a descending brainstem conduit.                *
 * ------------------------------------------------------------------ */

const BRAIN_REGIONS: Array<[number, number, number]> = [
  [0.52, 0.28, 0.52],   // 0: Left Frontal Lobe
  [-0.52, 0.28, 0.52],  // 1: Right Frontal Lobe
  [0.74, -0.16, 0.08],  // 2: Left Temporal Lobe
  [-0.74, -0.16, 0.08], // 3: Right Temporal Lobe
  [0.54, 0.32, -0.54],  // 4: Left Parieto-Occipital Lobe
  [-0.54, 0.32, -0.54], // 5: Right Parieto-Occipital Lobe
  [0.0, -0.48, -0.72],  // 6: Cerebellum (bilateral lower posterior)
  [0.0, -0.68, -0.26],  // 7: Brainstem & Subcortical Nuclei
]

type BrainShape = NeuralConfig['brain']

/** Coherent gyri & sulci — folded cortical convolutions */
function corticalGyri(nx: number, ny: number, nz: number, hemi: number, b: BrainShape): number {
  const th = Math.atan2(nz, nx)
  const ph = Math.asin(THREE.MathUtils.clamp(ny, -1, 1))
  const freq = b.gyriFreq
  const w1 = Math.sin(freq * th + 1.2 * hemi) * Math.cos(freq * 0.85 * ph)
  const w2 = Math.sin(freq * 1.35 * ph + 0.7) * Math.cos(freq * 1.15 * th + 2.1)
  const w3 = Math.cos(freq * 1.7 * (th + ph * 0.6) + 0.4)
  return 1.0 + b.gyriAmp * (w1 * 0.52 + w2 * 0.34 + w3 * 0.14)
}

/** Sample a point on the folded dual-hemisphere cerebral cortex */
function brainSurface(rnd: () => number, out: THREE.Vector3, b: BrainShape) {
  const hemi = rnd() < 0.5 ? -1 : 1
  randUnit(rnd, out)

  const dirX = Math.abs(out.x)
  const dirY = out.y
  const dirZ = out.z

  const g = corticalGyri(hemi * dirX, dirY, dirZ, hemi, b)

  let x = dirX * b.ax * g
  let y = dirY * b.ay * g
  let z = dirZ * b.az * g

  // 1. Base flattening
  if (y < 0) y *= 0.84

  // 2. Temporal lobe downward & lateral swoop (sylvian fissure notch)
  const temporal = Math.max(0, -dirY * 1.25) * Math.max(0, 1 - Math.abs(dirZ - 0.05) * 1.75)
  x *= 1 + 0.22 * temporal
  if (temporal > 0.08) y -= 0.09 * temporal

  // 3. Frontal lobe doming vs occipital taper
  if (z > 0) {
    x *= 1.02 + 0.06 * Math.min(1, z)
    y *= 1.02 + 0.05 * Math.min(1, z)
  } else {
    x *= 1 - 0.12 * Math.min(1, Math.abs(z) * 1.1)
  }

  // 4. Longitudinal Fissure: clean bilateral separation between hemispheres
  const sagittalFactor = Math.max(0, (y + 0.2) / (b.ay + 0.2))
  const fissureOffset = b.fissureWidth * (0.65 + 0.55 * sagittalFactor)
  x = x + fissureOffset

  // Inward dip along the medial wall of the fissure
  const fissureDip = ((x - fissureOffset) / 0.16) ** 2
  const fissureDepth = b.fissureDepth * sagittalFactor * Math.exp(-fissureDip)
  y -= fissureDepth

  out.set(hemi * x, y, z)
  return out
}

/** Cerebellum: bilateral striated mini-hemispheres tucked under occipital poles */
function cerebellumPoint(rnd: () => number, out: THREE.Vector3, b: BrainShape) {
  const hemi = rnd() < 0.5 ? -1 : 1
  randUnit(rnd, out).multiplyScalar(0.48 + rnd() * 0.52)
  const striation = 1 + 0.04 * Math.sin(out.y * 16)
  const cx = hemi * (0.15 + Math.abs(out.x) * b.cerebellum.rx * 0.72) * striation
  const cy = b.cerebellum.y + out.y * b.cerebellum.ry * striation
  const cz = b.cerebellum.z + out.z * b.cerebellum.rz
  out.set(cx, cy, cz)
  return out
}

/** Brainstem: descending central neural conduit */
function brainstemPoint(rnd: () => number, out: THREE.Vector3, b: BrainShape) {
  const angle = rnd() * Math.PI * 2
  const r = Math.sqrt(rnd()) * b.stem.r
  const prog = rnd()
  const sx = Math.cos(angle) * r * (1 - prog * 0.2)
  const sy = b.stem.y - prog * b.stem.len
  const sz = b.stem.z + Math.sin(angle) * r * 0.8
  out.set(sx, sy, sz)
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
  const CB = 6 // cerebellum cluster index
  const CS = 7 // brainstem cluster index

  /* ---------- nodes sampled inside the brain volume ---------- */
  const raw = new Float32Array(n * 3)
  const cluster = new Int8Array(n)
  const accent = new Float32Array(n)
  const scale = new Float32Array(n)
  const phase = new Float32Array(n)
  const dir = new THREE.Vector3()

  for (let i = 0; i < n; i++) {
    let ci: number
    const dice = rnd()
    if (dice < B.stem.frac) {
      brainstemPoint(rnd, dir, B)
      ci = CS
    } else if (dice < B.stem.frac + B.cerebellum.frac) {
      cerebellumPoint(rnd, dir, B)
      ci = CB
    } else {
      brainSurface(rnd, dir, B)
      const band = rnd()
      const s =
        band < 0.72
          ? 0.86 + rnd() * 0.14 // cortical shell (outer layer with gyri)
          : band < 0.92
            ? 0.52 + rnd() * 0.32 // subcortical white matter
            : 0.16 + rnd() * 0.36 // deep thalamic core
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
  const k = maxR > 1e-4 ? (R * 0.84) / maxR : 1

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

  /* ------------------------------------------------------------------ *
   * Machine-network layout: structured stacked compute layers for      *
   * AI phase transition (maintains seamless morph).                     *
   * ------------------------------------------------------------------ */
  const aiPos = new Float32Array(n * 3)
  const members: number[][] = Array.from({ length: C }, () => [])
  for (let i = 0; i < n; i++) members[cluster[i]].push(i)
  const layerSpacing = 0.72
  for (let cIdx = 0; cIdx < C; cIdx++) {
    const arr = members[cIdx]
    const layerY = ((C - 1) / 2 - cIdx) * layerSpacing
    const ringScale = 0.78 + 0.45 * Math.sin((Math.PI * (cIdx + 0.5)) / C)
    for (let idx = 0; idx < arr.length; idx++) {
      const node = arr[idx]
      const ring = idx % 2 === 0 ? 0.45 : 0.84
      const ang = idx * 2.399963 + cIdx * 1.13
      const r = ring * ringScale
      aiPos[node * 3] = Math.cos(ang) * r + (rnd() - 0.5) * 0.05
      aiPos[node * 3 + 1] = layerY + (rnd() - 0.5) * 0.07
      aiPos[node * 3 + 2] = Math.sin(ang) * r + (rnd() - 0.5) * 0.05
    }
  }

  /* ------------------------------------------------------------------ *
   * Anatomical Connectome & Neural Tractography                        *
   * Kind 0: Cortical U-fibers & Longitudinal association tracts        *
   * Kind 1: Local intra-gyral synaptic connections                     *
   * Kind 2: Corpus Callosum (commissural bridges connecting L <-> R)   *
   * Kind 3: Projection fibers (cortex -> internal capsule & brainstem) *
   * ------------------------------------------------------------------ */
  const edges: FieldEdge[] = []
  const key = new Set<number>()
  const keyOf = (a: number, b: number) => (a < b ? a * 200000 + b : b * 200000 + a)
  const addEdge = (a: number, b: number, kind: EdgeKind) => {
    if (a === b) return
    const kCode = keyOf(a, b)
    if (key.has(kCode)) return
    key.add(kCode)
    const base =
      kind === 0 ? 0.44 : kind === 1 ? 0.22 : kind === 2 ? 0.48 : 0.58
    edges.push({ a, b, kind, intensity: base + rnd() * (kind === 3 ? 0.35 : 0.2) })
  }

  const outgoing = new Int32Array(n).fill(-1)

  // 1. Corpus Callosum (Commissural fibers: Left <-> Right hemisphere bridges)
  const leftNodes: number[] = []
  const rightNodes: number[] = []
  for (let i = 0; i < n; i++) {
    const x = positions[i * 3]
    const y = positions[i * 3 + 1]
    const z = positions[i * 3 + 2]
    // Near the callosal arch
    if (Math.abs(x) < 0.45 && y > -0.2 && y < 0.45 && Math.abs(z) < 0.65) {
      if (x < 0) leftNodes.push(i)
      else rightNodes.push(i)
    }
  }

  const callosumBridges = Math.min(24, Math.min(leftNodes.length, rightNodes.length))
  for (let c = 0; c < callosumBridges; c++) {
    const li = leftNodes[Math.floor(rnd() * leftNodes.length)]
    let bestR = -1
    let bestD = Infinity
    for (let rIdx = 0; rIdx < rightNodes.length; rIdx++) {
      const ri = rightNodes[rIdx]
      const dy = positions[li * 3 + 1] - positions[ri * 3 + 1]
      const dz = positions[li * 3 + 2] - positions[ri * 3 + 2]
      const d = dy * dy + dz * dz
      if (d < bestD) {
        bestD = d
        bestR = ri
      }
    }
    if (bestR >= 0) addEdge(li, bestR, 2)
  }

  // 2. Inward synaptic threads & longitudinal association fasciculi
  const threshold = 0.88
  for (let i = 0; i < n; i++) {
    const ri = radius[i]
    if (ri < threshold) continue
    let best = -1
    let bd = Infinity
    const isLong = rnd() < 0.12
    const xi = positions[i * 3]
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      const xj = positions[j * 3]
      // Keep association fibers mostly within the same hemisphere
      if (Math.sign(xi) !== Math.sign(xj) && Math.abs(xi) > 0.25) continue
      const rj = radius[j]
      if (rj >= ri * 0.84 || rj < config.innerCutoff) continue
      if (isLong && rj >= ri * 0.5) continue
      const dx = positions[i * 3] - positions[j * 3]
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
      const d = dx * dx + dy * dy + dz * dz
      if (d < bd) {
        bd = d
        best = j
      }
    }
    if (best >= 0 && bd < 8.0) {
      const at = edges.length
      addEdge(i, best, 0)
      if (edges.length > at) outgoing[i] = at
    }
  }

  // 3. Intra-gyral Cortical Weave (local cluster links)
  const weaveCount = Math.min(Math.ceil(n * 0.42), budget.edges)
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

  // 4. Cluster inter-connectivity bridges
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

  // 5. Projection fibers: deep nodes & brainstem wire into core sentinel
  const order: number[] = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => radius[a] - radius[b],
  )
  const feedMax = Math.min(14, order.length)
  for (let k = 0; k < feedMax; k++) {
    addEdge(order[k], sentinel, 3)
  }

  // 6. Connective short fibers up to budget
  let guard = 0
  while (edges.length < budget.edges && guard < n * 6) {
    guard++
    const a = Math.floor(rnd() * n)
    const b = Math.floor(rnd() * n)
    if (a === b) continue
    const dx = positions[a * 3] - positions[b * 3]
    const dy = positions[a * 3 + 1] - positions[b * 3 + 1]
    const dz = positions[a * 3 + 2] - positions[b * 3 + 2]
    const sq = dx * dx + dy * dy + dz * dz
    if (sq <= config.weaveDist * config.weaveDist * 1.35) addEdge(a, b, 1)
  }

  /* ---------- Multi-branching dendritic arbors at each neuron ---------- */
  const perStub = config.dendrites.perNode
  const dendDirs = new Float32Array(n * perStub * 3)
  const tA = new THREE.Vector3()
  const tB = new THREE.Vector3()
  const tmpT = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    if (rnd() >= config.dendrites.ratio) continue
    const d = dir.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]).normalize()
    const nStub = Math.min(perStub, 2 + Math.floor(rnd() * (perStub - 1)))
    for (let s = 0; s < nStub; s++) {
      randUnit(rnd, tmpT)
      tA.copy(d).cross(tmpT)
      if (tA.lengthSq() < 1e-4) tA.set(1, 0, 0).cross(d)
      tA.normalize()
      // Tri-radiant arbor angles
      const angleOffset = (s * Math.PI * 2) / nStub + (rnd() - 0.5) * 0.4
      tB.copy(tA).applyAxisAngle(d, angleOffset)
      tB.multiplyScalar(0.85).addScaledVector(d, 0.35 * (s % 2 === 0 ? 1 : -0.6)).normalize()
      const L = config.dendrites.length * (0.65 + rnd() * 0.7)
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
    if (ed.kind !== 0 && ed.kind !== 2 && ed.kind !== 3) continue
    const srcR = ed.a === sentinel ? 0 : radius[ed.a]
    if (srcR > 0.9 || ed.kind === 2 || ed.kind === 3) startEdges.push(e)
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
    aiPos,
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
    dendOp: 1,
    morph: 0,
  }
}