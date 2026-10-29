import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import type { NeuralSystem } from './system'

const ORIGIN = new THREE.Vector3(0, 0, 0)

/**
 * The synaptic connections. Deliberately few, meaningfully routed fibres:
 * threads (outer→inner) are the bright main highways, cluster weaves are the
 * faint local web, cluster bridges sit mid-tone and feed filaments run hot
 * into the core. Lines are brightest in the foreground, cool toward the far
 * side for depth, and an active edge flashes near-white → electric blue while
 * a signal travels it.
 */
export function NeuralConnections({ sys }: { sys: NeuralSystem }) {
  const segments = useRef<THREE.LineSegments>(null)
  const mat = useRef<THREE.LineBasicMaterial>(null)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(sys.edgePositions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(sys.edgeColor, 3))
    return g
  }, [sys])

  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])

  useFrame(function updateEdges({ clock }) {
    const pos = sys.positions
    const edgePos = sys.edgePositions
    const edgeCol = sys.edgeColor
    const active = sys.edgeActive
    const depth = sys.depth
    const throb = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 0.22)
    const m = sys.morph

    // chapter factor: quiet at the hero, wakes deeper in the page
    const chapter = Math.min(1, 0.55 + sys.edgeOp * 0.75)

    // palette: warm amber-silver (human) → cool blue-white (machine)
    const bR = 1.0 + (0.62 - 1.0) * m
    const bG = 0.9 + (0.78 - 0.9) * m
    const bB = 0.72 + (1.0 - 0.72) * m

    for (let e = 0; e < sys.edges.length; e++) {
      const { a: ai, b: bi, kind, intensity } = sys.edges[e]
      if (ai === sys.sentinel) a.copy(ORIGIN)
      else a.set(pos[ai * 3], pos[ai * 3 + 1], pos[ai * 3 + 2])
      if (bi === sys.sentinel) b.copy(ORIGIN)
      else b.set(pos[bi * 3], pos[bi * 3 + 1], pos[bi * 3 + 2])

      const o = e * 6
      edgePos[o] = a.x
      edgePos[o + 1] = a.y
      edgePos[o + 2] = a.z
      edgePos[o + 3] = b.x
      edgePos[o + 4] = b.y
      edgePos[o + 5] = b.z

      // far edges dim toward the background — gives the field depth
      const da = ai === sys.sentinel ? 0 : depth[ai]
      const db = bi === sys.sentinel ? 0 : depth[bi]
      const depthFac = 1 - (da + db) * 0.28

      const hot = active[e]
      // active edges flash electric in machine regime, golden-white in human regime
      const blu = Math.min(hot * 1.4, 1) * m
      const isCallosum = kind === 2
      const callosumBoost = isCallosum ? 1.25 : 1.0
      const heat = intensity * (1.15 + hot * 1.6) * (0.9 + throb * 0.1) * chapter * depthFac * callosumBoost
      const r = heat * (bR - blu * 0.15 + (isCallosum ? 0.06 : 0))
      const g = heat * (bG - blu * 0.1 + (isCallosum ? 0.04 : 0))
      const bC = heat * (bB + blu * 0.5 + (isCallosum ? 0.12 : 0))
      // receiving (inner) end is brighter — edges visibly route toward the core
      const toward = kind === 0 || kind === 3
      const grad = toward ? 0.68 : 0.85
      edgeCol[o] = r * grad
      edgeCol[o + 1] = g * grad
      edgeCol[o + 2] = bC * grad
      edgeCol[o + 3] = r
      edgeCol[o + 4] = g
      edgeCol[o + 5] = bC
    }

    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
    const colAttr = geo.getAttribute('color') as THREE.BufferAttribute
    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
    if (mat.current) mat.current.opacity = Math.max(0.36, Math.min(0.95, sys.edgeOp * 0.95))
  })

  return (
    <lineSegments ref={segments} geometry={geo} frustumCulled={false}>
      <lineBasicMaterial
        ref={mat}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}