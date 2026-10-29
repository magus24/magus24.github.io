import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import type { NeuralSystem } from './system'
import { NEURAL_CONFIG } from '../config/neural'

/**
 * Dendrite tufts — short neurite stubs radiating from each node. They make
 * every point read unmistakably as a neuron (NEURON → SYNAPSE → NEURON) at a
 * glance, without adding a single long random line to the net.
 */
export function NeuralDendrites({ sys }: { sys: NeuralSystem }) {
  const segments = useRef<THREE.LineSegments>(null)
  const mat = useRef<THREE.LineBasicMaterial>(null)
  const perNode = NEURAL_CONFIG.dendrites.perNode

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sys.count * perNode * 6), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(sys.count * perNode * 6), 3))
    return g
  }, [sys, perNode])

  useFrame(({ clock }) => {
    const el = segments.current
    if (!el) return
    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const colAttr = geo.getAttribute('color') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const colArr = colAttr.array as Float32Array
    const pos = sys.positions
    const dirs = sys.dendDirs
    const m = sys.morph
    const breathe = 0.92 + 0.08 * Math.sin(clock.getElapsedTime() * 0.6)

    // Palette: warm amber-silver (human) -> cool blue-white (machine)
    const baseR = 0.95 + (0.55 - 0.95) * m
    const baseG = 0.88 + (0.75 - 0.88) * m
    const baseB = 0.74 + (1.0 - 0.74) * m

    for (let i = 0; i < sys.count; i++) {
      const px = pos[i * 3]
      const py = pos[i * 3 + 1]
      const pz = pos[i * 3 + 2]
      const base = i * perNode * 3
      const o = i * perNode * 6

      // soma connection glow
      const g = sys.glow[i]
      const rRoot = (baseR + g * 0.3) * 0.85
      const gRoot = (baseG + g * 0.2) * 0.85
      const bRoot = (baseB + g * 0.4) * 0.85
      const rTip = rRoot * 0.32
      const gTip = gRoot * 0.32
      const bTip = bRoot * 0.32

      for (let s = 0; s < perNode; s++) {
        const b = base + s * 3
        const dx = dirs[b]
        const dy = dirs[b + 1]
        const dz = dirs[b + 2]
        const v = o + s * 6
        arr[v] = px
        arr[v + 1] = py
        arr[v + 2] = pz
        arr[v + 3] = px + dx * breathe
        arr[v + 4] = py + dy * breathe
        arr[v + 5] = pz + dz * breathe

        colArr[v] = rRoot
        colArr[v + 1] = gRoot
        colArr[v + 2] = bRoot
        colArr[v + 3] = rTip
        colArr[v + 4] = gTip
        colArr[v + 5] = bTip
      }
    }
    attr.needsUpdate = true
    colAttr.needsUpdate = true
    const matEl = mat.current
    if (matEl) matEl.opacity = Math.max(0.25, 0.48 * sys.dendOp)
  })

  return (
    <lineSegments ref={segments} geometry={geo} frustumCulled={false}>
      <lineBasicMaterial
        ref={mat}
        vertexColors
        transparent
        opacity={0.48}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}