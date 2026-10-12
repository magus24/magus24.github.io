import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import type { NeuralSystem } from './system'
import { glowTexture } from './glow'

/**
 * Signal flow — the information moving through the net. Each impulse follows
 * its filament (outer → cluster → core): a bright head sprite with a short
 * dim trail directly behind it, so motion reads along the connection path.
 */
export function SignalFlow({
  sys,
  size,
}: {
  sys: NeuralSystem
  size: number
}) {
  const head = useRef<THREE.InstancedMesh>(null)
  const trail = useRef<THREE.InstancedMesh>(null)
  const headMat = useRef<THREE.MeshBasicMaterial>(null)
  const trailMat = useRef<THREE.MeshBasicMaterial>(null)
  const tmpObj = useMemo(() => new THREE.Object3D(), [])
  const tmpQuat = useMemo(() => new THREE.Quaternion(), [])
  const tmpPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera }) => {
    const h = head.current
    const tl = trail.current
    if (!h) return
    const op = Math.max(0.15, sys.op * 0.9)
    if (headMat.current) headMat.current.opacity = Math.min(1, op + 0.15)
    if (trailMat.current) trailMat.current.opacity = op * 0.32

    const signals = sys.signals
    const pos = sys.positions
    const edges = sys.edges
    const sentinel = sys.sentinel
    const sLen = signals.length

    tmpQuat.copy(camera.quaternion)
    for (let si = 0; si < sLen; si++) {
      const sig = signals[si]
      const e = edges[sig.edge]

      const ax = e.a === sentinel ? 0 : pos[e.a * 3]
      const ay = e.a === sentinel ? 0 : pos[e.a * 3 + 1]
      const az = e.a === sentinel ? 0 : pos[e.a * 3 + 2]
      const bx = e.b === sentinel ? 0 : pos[e.b * 3]
      const by = e.b === sentinel ? 0 : pos[e.b * 3 + 1]
      const bz = e.b === sentinel ? 0 : pos[e.b * 3 + 2]
      const dx = bx - ax
      const dy = by - ay
      const dz = bz - az

      tmpObj.position.set(ax + dx * sig.t, ay + dy * sig.t, az + dz * sig.t)
      tmpObj.quaternion.copy(tmpQuat)
      const sigSize = size * (1 + (1 - Math.abs(sig.t - 0.5) * 2) * 0.35)
      tmpObj.scale.set(sigSize, sigSize, sigSize)
      tmpObj.updateMatrix()
      h.setMatrixAt(si, tmpObj.matrix)

      const tBack = Math.max(0, sig.t - 0.045)
      tmpPos.set(ax + dx * tBack, ay + dy * tBack, az + dz * tBack)
      tmpObj.position.copy(tmpPos)
      tmpObj.scale.setScalar(sigSize * 0.78)
      tmpObj.updateMatrix()
      tl?.setMatrixAt(si, tmpObj.matrix)
    }
    h.instanceMatrix.needsUpdate = true
    if (tl) tl.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={head}
        args={[undefined, undefined, sys.signals.length]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={headMat}
          color={0xa9c4ff}
          map={glowTexture()}
          transparent
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={trail}
        args={[undefined, undefined, sys.signals.length]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={trailMat}
          color={0x9db2ff}
          map={glowTexture()}
          transparent
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}