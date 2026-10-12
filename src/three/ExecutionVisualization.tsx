import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { clamp01 } from './math'

/**
 * EXECUTION — the machine's result taking shape. A spare blueprint of the
 * product being assembled out of the machine net: an interface contour
 * (window + content bars) and the system architecture beneath it (stacked
 * layers + data-flow arrows). It reveals input → processing → output as the
 * execution chapter takes over, then settles behind the project chapters.
 */
function edges(pairs: number[][]): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  for (const [x1, y1, x2, y2] of pairs) {
    pts.push(new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0))
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts)
  return g
}

const WINDOW_PAIRS = [
  [-1.15, 0.62, 1.15, 0.62],
  [1.15, 0.62, 1.15, -0.62],
  [1.15, -0.62, -1.15, -0.62],
  [-1.15, -0.62, -1.15, 0.62],
  [-1.15, 0.4, 1.15, 0.4],
  // title dots
  [-1.0, 0.51, -0.9, 0.51],
  // content bars
  [-0.95, 0.2, 0.0, 0.2],
  [-0.95, 0.02, 0.55, 0.02],
  [-0.95, -0.16, -0.2, -0.16],
  [-0.95, -0.34, 0.3, -0.34],
]

const ARCH_PAIRS = [
  // three stacked layers, right side
  [0.45, 0.42, 1.9, 0.42],
  [1.9, 0.42, 1.9, 0.2],
  [1.9, 0.2, 0.45, 0.2],
  [0.45, 0.2, 0.45, 0.42],
  [0.45, 0.06, 1.9, 0.06],
  [1.9, 0.06, 1.9, -0.16],
  [1.9, -0.16, 0.45, -0.16],
  [0.45, -0.16, 0.45, 0.06],
  [0.45, -0.3, 1.9, -0.3],
  [1.9, -0.3, 1.9, -0.52],
  [1.9, -0.52, 0.45, -0.52],
  [0.45, -0.52, 0.45, -0.3],
  // data-flow arrows between layers
  [1.17, 0.2, 1.17, 0.06],
  [1.13, 0.12, 1.17, 0.06],
  [1.21, 0.12, 1.17, 0.06],
  [1.17, -0.16, 1.17, -0.3],
  [1.13, -0.24, 1.17, -0.3],
  [1.21, -0.24, 1.17, -0.3],
]

export function ExecutionVisualization({
  active,
  reducedMotion,
}: {
  active: boolean
  reducedMotion: boolean
}) {
  const root = useRef<THREE.Group>(null)
  const winMat = useRef<THREE.LineBasicMaterial>(null)
  const archMat = useRef<THREE.LineBasicMaterial>(null)
  const env = useRef(0)
  const since = useRef(-1)

  const winGeo = useMemo(() => edges(WINDOW_PAIRS), [])
  const archGeo = useMemo(() => edges(ARCH_PAIRS), [])

  useEffect(() => {
    return () => {
      winGeo.dispose()
      archGeo.dispose()
    }
  }, [winGeo, archGeo])

  useFrame(({ clock }, dt) => {
    const g = root.current
    if (!g) return
    const target = active ? 1 : 0
    env.current += (target - env.current) * Math.min(1, dt * 2.2)
    const e = env.current
    g.visible = e > 0.01
    if (!g.visible) return
    g.scale.setScalar(0.82 + e * 0.18)
    g.position.y = -0.15 - (1 - e) * 0.25

    if (!reducedMotion) {
      if (target > 0.5 && since.current < 0) since.current = clock.getElapsedTime()
      if (target < 0.5) since.current = -1
    }
    const age = reducedMotion ? 10 : since.current < 0 ? 0 : clock.getElapsedTime() - since.current

    const winP = clamp01(age / 0.5)
    const archP = clamp01((age - 0.25) / 0.6)
    // left bar group grows in from the title outward
    if (winMat.current) winMat.current.opacity = e * winP * 0.85
    if (archMat.current) archMat.current.opacity = e * archP * 0.7
  })

  return (
    <group ref={root} position={[0, -0.15, 0.5]}>
      <lineSegments geometry={winGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={winMat}
          color={0xc6d8ff}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={archGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={archMat}
          color={0x8fb4ff}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  )
}
