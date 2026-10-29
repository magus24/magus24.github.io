import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { glowTexture } from './glow'

interface QuantumAICoreProps {
  morph: number // 0 = human brain, 1 = quantum AI core
  opacity: number
  velocity?: React.RefObject<number>
  reducedMotion?: boolean
}

const RING_DATA = [
  { radius: 1.35, tube: 0.014, axis: new THREE.Vector3(0.7, 1.0, 0.4).normalize(), speed: 0.85, color: '#00f0ff' },
  { radius: 1.02, tube: 0.012, axis: new THREE.Vector3(-0.8, 0.6, 0.9).normalize(), speed: -1.15, color: '#38bdf8' },
  { radius: 0.72, tube: 0.010, axis: new THREE.Vector3(0.5, -0.9, 0.6).normalize(), speed: 1.5, color: '#818cf8' },
]

export function QuantumAICore({
  morph,
  opacity,
  velocity,
  reducedMotion = false,
}: QuantumAICoreProps) {
  const rootRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const coreIcosaRef = useRef<THREE.Mesh>(null)
  const coreInnerRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const busLinesRef = useRef<THREE.LineSegments>(null)
  const busPhotonsRef = useRef<THREE.Points>(null)

  // Floating cyber particles (qubits)
  const particleGeo = useMemo(() => {
    const count = 160
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c1 = new THREE.Color('#38bdf8')
    const c2 = new THREE.Color('#a855f7')

    for (let i = 0; i < count; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 0.5 + Math.random() * 1.1

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      const mixVal = Math.random()
      const c = c1.clone().lerp(c2, mixVal)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return geo
  }, [])

  // Vertical cyber data bus lines
  const busGeo = useMemo(() => {
    const lineCount = 18
    const positions = new Float32Array(lineCount * 2 * 3)
    const colors = new Float32Array(lineCount * 2 * 3)
    const cCyan = new THREE.Color('#00f0ff')
    const cIndigo = new THREE.Color('#6366f1')

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2
      const rad = 0.22 + (i % 3) * 0.12
      const x = Math.cos(angle) * rad
      const z = Math.sin(angle) * rad
      const yLen = 1.6 + Math.random() * 0.8

      const idx = i * 6
      positions[idx] = x
      positions[idx + 1] = -yLen
      positions[idx + 2] = z

      positions[idx + 3] = x
      positions[idx + 4] = yLen
      positions[idx + 5] = z

      // Gradient color from bottom to top
      colors[idx] = cIndigo.r
      colors[idx + 1] = cIndigo.g
      colors[idx + 2] = cIndigo.b

      colors[idx + 3] = cCyan.r
      colors[idx + 4] = cCyan.g
      colors[idx + 5] = cCyan.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  // Photons traveling along the vertical bus
  const { busPhotonsGeo, busPhotonSpeeds } = useMemo(() => {
    const count = 36
    const pos = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const rad = 0.22 + (i % 3) * 0.12
      pos[i * 3] = Math.cos(angle) * rad
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.0
      pos[i * 3 + 2] = Math.sin(angle) * rad
      speeds[i] = 1.2 + Math.random() * 2.2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { busPhotonsGeo: geo, busPhotonSpeeds: speeds }
  }, [])

  useFrame(({ clock }) => {
    if (!rootRef.current) return

    // Core activation factor: only reveals when morphing towards AI
    // Starts subtly around morph = 0.15, fully dominant by morph = 0.75+
    const activation = Math.max(0, Math.min(1, (morph - 0.15) / 0.7))
    const effOpacity = activation * opacity

    if (activation < 0.01 || effOpacity < 0.01) {
      rootRef.current.visible = false
      return
    }
    rootRef.current.visible = true

    const t = clock.getElapsedTime()
    const speedBoost = 1 + (velocity?.current ?? 0) * 0.8
    const rotSpeed = reducedMotion ? 0.3 : 1.0

    // Scale spring on arrival
    const scale = THREE.MathUtils.lerp(0.35, 1.0, activation)
    rootRef.current.scale.setScalar(scale)

    // 1. Gyroscopic rings rotation around designated 3D orbital axes
    const q = new THREE.Quaternion()
    if (ring1Ref.current) {
      q.setFromAxisAngle(RING_DATA[0].axis, t * RING_DATA[0].speed * rotSpeed * speedBoost)
      ring1Ref.current.quaternion.copy(q)
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = effOpacity * 0.85
    }
    if (ring2Ref.current) {
      q.setFromAxisAngle(RING_DATA[1].axis, t * RING_DATA[1].speed * rotSpeed * speedBoost)
      ring2Ref.current.quaternion.copy(q)
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = effOpacity * 0.8
    }
    if (ring3Ref.current) {
      q.setFromAxisAngle(RING_DATA[2].axis, t * RING_DATA[2].speed * rotSpeed * speedBoost)
      ring3Ref.current.quaternion.copy(q)
      const mat = ring3Ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = effOpacity * 0.75
    }

    // 2. Central Photonic Core pulsation
    const pulse = 1.0 + Math.sin(t * 3.5) * 0.12
    if (coreIcosaRef.current) {
      coreIcosaRef.current.rotation.x = t * 0.6
      coreIcosaRef.current.rotation.y = t * 0.9
      coreIcosaRef.current.scale.setScalar(pulse)
      const mat = coreIcosaRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = effOpacity * 0.9
    }
    if (coreInnerRef.current) {
      coreInnerRef.current.scale.setScalar(pulse * 0.9)
      const mat = coreInnerRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = effOpacity * 0.95
    }

    // 3. Ambient cyber qubits rotation & breath
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.12 * rotSpeed
      particlesRef.current.rotation.z = Math.sin(t * 0.2) * 0.1
      const pMat = particlesRef.current.material as THREE.PointsMaterial
      pMat.opacity = effOpacity * 0.85
    }

    // 4. Vertical cyber bus streams
    if (busLinesRef.current) {
      const bMat = busLinesRef.current.material as THREE.LineBasicMaterial
      bMat.opacity = effOpacity * 0.45 * (0.8 + Math.sin(t * 5.0) * 0.2)
    }

    // 5. Traveling photons along vertical cyber bus
    if (busPhotonsRef.current && !reducedMotion) {
      const posAttr = busPhotonsGeo.getAttribute('position') as THREE.BufferAttribute
      const pArr = posAttr.array as Float32Array
      const count = pArr.length / 3

      for (let i = 0; i < count; i++) {
        let y = pArr[i * 3 + 1] + busPhotonSpeeds[i] * 0.016 * speedBoost
        if (y > 2.0) y = -2.0
        pArr[i * 3 + 1] = y
      }
      posAttr.needsUpdate = true

      const bpMat = busPhotonsRef.current.material as THREE.PointsMaterial
      bpMat.opacity = effOpacity * 0.95
    }
  })

  return (
    <group ref={rootRef} visible={false}>
      {/* Outer Gyro Ring */}
      <mesh ref={ring1Ref} frustumCulled={false}>
        <torusGeometry args={[RING_DATA[0].radius, RING_DATA[0].tube, 16, 80]} />
        <meshBasicMaterial
          color={RING_DATA[0].color}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
        <mesh position={[RING_DATA[0].radius, 0, 0]} frustumCulled={false}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent blending={THREE.AdditiveBlending} opacity={0.95} />
        </mesh>
        <mesh position={[-RING_DATA[0].radius, 0, 0]} frustumCulled={false}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#a5f3fc" transparent blending={THREE.AdditiveBlending} opacity={0.9} />
        </mesh>
      </mesh>

      {/* Mid Gyro Ring */}
      <mesh ref={ring2Ref} frustumCulled={false}>
        <torusGeometry args={[RING_DATA[1].radius, RING_DATA[1].tube, 16, 70]} />
        <meshBasicMaterial
          color={RING_DATA[1].color}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
        <mesh position={[0, RING_DATA[1].radius, 0]} frustumCulled={false}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent blending={THREE.AdditiveBlending} opacity={0.95} />
        </mesh>
      </mesh>

      {/* Inner Gyro Ring */}
      <mesh ref={ring3Ref} frustumCulled={false}>
        <torusGeometry args={[RING_DATA[2].radius, RING_DATA[2].tube, 16, 60]} />
        <meshBasicMaterial
          color={RING_DATA[2].color}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.75}
        />
        <mesh position={[RING_DATA[2].radius, 0, 0]} frustumCulled={false}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshBasicMaterial color="#c7d2fe" transparent blending={THREE.AdditiveBlending} opacity={0.95} />
        </mesh>
      </mesh>

      {/* Central Singularity Icosahedron Cage */}
      <mesh ref={coreIcosaRef} frustumCulled={false}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshBasicMaterial
          wireframe
          color="#60a5fa"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.85}
        />
      </mesh>

      {/* Singularity Glowing Nucleus */}
      <mesh ref={coreInnerRef} frustumCulled={false}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.9}
        />
      </mesh>

      {/* Ambient Cyber Particle Cloud */}
      <points ref={particlesRef} geometry={particleGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.045}
          map={glowTexture()}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </points>

      {/* Vertical Data Bus Lines */}
      <lineSegments ref={busLinesRef} geometry={busGeo} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.45}
        />
      </lineSegments>

      {/* Photons streaming through vertical cyber data bus */}
      <points ref={busPhotonsRef} geometry={busPhotonsGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.055}
          map={glowTexture()}
          color="#ffffff"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.9}
        />
      </points>
    </group>
  )
}
