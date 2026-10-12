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
    return g
  }, [sys, perNode])

  useFrame(({ clock }) => {
    const el = segments.current
    if (!el) return
    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const pos = sys.positions
    const dirs = sys.dendDirs
    const breathe = 0.9 + 0.1 * Math.sin(clock.getElapsedTime() * 0.5)

    for (let i = 0; i < sys.count; i++) {
      const px = pos[i * 3]
      const py = pos[i * 3 + 1]
      const pz = pos[i * 3 + 2]
      const base = i * perNode * 3
      const o = i * perNode * 6
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
      }
    }
    attr.needsUpdate = true
    const m = mat.current
    if (m) m.opacity = 0.42 * sys.dendOp
  })

  return (
    <lineSegments ref={segments} geometry={geo} frustumCulled={false}>
      <lineBasicMaterial
        ref={mat}
        color={0xe8dcc4}
        transparent
        opacity={0.42}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}