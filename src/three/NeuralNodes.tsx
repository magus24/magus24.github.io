import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import type { NeuralSystem } from './system'
import { glowTexture } from './glow'
import { NEURAL_CONFIG } from '../config/neural'

/**
 * The field's neurons — small glowing nuclei, white/silver with a few blue
 * active cells, gently breathing on their own phase. The instanced mesh is a
 * 1 world-unit plane so `nodeSizeArr` IS the on-screen world size.
 */
export function NeuralNodes({ sys }: { sys: NeuralSystem }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const tmpObj = useMemo(() => new THREE.Object3D(), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])
  const tmpQuat = useMemo(() => new THREE.Quaternion(), [])
  const pulseAmp = NEURAL_CONFIG.nodePulse
  const pulseSpeed = NEURAL_CONFIG.drift * 1.6

  useFrame(({ camera, clock }) => {
    const m = mesh.current
    if (!m) return
    const t = clock.getElapsedTime()
    const n = sys.count
    const pos = sys.positions
    const size = sys.nodeSizeArr

    tmpQuat.copy(camera.quaternion)
    for (let i = 0; i < n; i++) {
      const s = size[i] * (1 + pulseAmp * Math.sin(t * pulseSpeed + sys.phase[i] * 4))
      tmpObj.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
      tmpObj.quaternion.copy(tmpQuat)
      tmpObj.scale.set(s, s, s)
      tmpObj.updateMatrix()
      m.setMatrixAt(i, tmpObj.matrix)
    }
    const col = sys.nodeColorArr
    for (let i = 0; i < n; i++) {
      tmpColor.setRGB(col[i * 3], col[i * 3 + 1], col[i * 3 + 2])
      m.setColorAt(i, tmpColor)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    if (mat.current) mat.current.opacity = 1
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, sys.count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={mat}
        map={glowTexture()}
        transparent
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  )
}