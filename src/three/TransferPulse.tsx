import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { glowTexture } from './glow'

/**
 * THE TRANSFER — a bright impulse that detaches from the organic net and
 * travels straight DOWN the field, carrying one idea out of the human mind
 * and into the machine. It rides the same local axis the morph uses, so the
 * regularisation of the network reads as something the signal causes.
 */
const TOP = 2.5
const BOTTOM = -2.5
const PERIOD = 2.6

export function TransferPulse({ active }: { active: boolean }) {
  const head = useRef<THREE.Mesh>(null)
  const trail = useRef<THREE.Mesh>(null)
  const headMat = useRef<THREE.MeshBasicMaterial>(null)
  const trailMat = useRef<THREE.MeshBasicMaterial>(null)
  const env = useRef(0)
  const offset = useMemo(() => Math.random() * PERIOD, [])

  useEffect(() => {
    return () => {
      headMat.current?.dispose()
      trailMat.current?.dispose()
    }
  }, [])

  useFrame(({ camera, clock }, dt) => {
    const target = active ? 1 : 0
    env.current += (target - env.current) * Math.min(1, dt * 2.5)
    const e = env.current
    const show = e > 0.01
    if (head.current) head.current.visible = show
    if (trail.current) trail.current.visible = show
    if (!show) return

    const phase = ((clock.getElapsedTime() + offset) % PERIOD) / PERIOD
    // ease: pause briefly at the two ends to read as "leaves / arrives"
    const y = TOP + (BOTTOM - TOP) * (phase * phase * (3 - 2 * phase))
    const fade = Math.sin(Math.PI * Math.min(1, phase * 1.15)) * e

    if (head.current) {
      head.current.position.set(0, y, 0)
      head.current.quaternion.copy(camera.quaternion)
    }
    if (trail.current) {
      const yT = y + 0.34
      trail.current.position.set(0, yT, 0)
      trail.current.quaternion.copy(camera.quaternion)
    }
    if (headMat.current) headMat.current.opacity = fade
    if (trailMat.current) trailMat.current.opacity = fade * 0.4
  })

  return (
    <group>
      <mesh ref={head} frustumCulled={false}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshBasicMaterial
          ref={headMat}
          color={0xdfe8ff}
          map={glowTexture()}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={trail} frustumCulled={false}>
        <planeGeometry args={[0.16, 0.5]} />
        <meshBasicMaterial
          ref={trailMat}
          color={0x8fb0ff}
          map={glowTexture()}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
