import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { glowTexture } from './glow'

interface NeuralCyberEffectsProps {
  morph: number // 0 = organic human mind, 1 = cybernetic AI
  opacity: number
  velocity?: React.RefObject<number>
  reducedMotion?: boolean
  pointer?: { x: number; y: number }
  mouseSpeed?: number
  clickPulse?: number
}

const WAVE_COUNT = 3
const WAVE_PERIOD = 3.2

const LOBE_DEFS = [
  {
    anchor: [0.42, 0.32, 0.65] as const,
    offset: [0.72, 0.48, 0.85] as const,
    title: 'FRONTAL LOBE',
    sub: 'EXECUTIVE AI // AGENTS',
    color: '#38bdf8',
  },
  {
    anchor: [0.35, 0.62, 0.12] as const,
    offset: [0.65, 0.88, 0.22] as const,
    title: 'PARIETAL LOBE',
    sub: '3D SPATIAL // WEBGL',
    color: '#00f0ff',
  },
  {
    anchor: [0.32, 0.18, -0.68] as const,
    offset: [0.62, 0.32, -0.88] as const,
    title: 'OCCIPITAL LOBE',
    sub: 'COMPUTER VISION // YOLO',
    color: '#fde68a',
  },
  {
    anchor: [0.75, -0.15, 0.12] as const,
    offset: [1.08, -0.22, 0.22] as const,
    title: 'TEMPORAL LOBE',
    sub: 'SPEECH AI // OSINT',
    color: '#f43f5e',
  },
]

export function NeuralCyberEffects({
  morph,
  opacity,
  velocity,
  reducedMotion = false,
  pointer,
  mouseSpeed = 0,
  clickPulse = 0,
}: NeuralCyberEffectsProps) {
  const rootRef = useRef<THREE.Group>(null)
  const coreInnerRef = useRef<THREE.Mesh>(null)
  const coreWireRef = useRef<THREE.Mesh>(null)
  const stardustRef = useRef<THREE.Points>(null)
  const beamLinesRef = useRef<THREE.LineSegments>(null)
  const beamPhotonsRef = useRef<THREE.Points>(null)
  const waveMeshes = useRef<(THREE.Mesh | null)[]>([])
  const lobeLinesRef = useRef<THREE.LineSegments>(null)
  const lobeSpritesRef = useRef<(THREE.Sprite | null)[]>([])

  // 1. Synaptic Stardust (ambient thought particles drifting around the brain)
  const stardustGeo = useMemo(() => {
    const count = 220
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const gold = new THREE.Color('#fde68a')
    const cyan = new THREE.Color('#38bdf8')

    for (let i = 0; i < count; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 0.7 + Math.random() * 1.1

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 0.95
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.8
      pos[i * 3 + 2] = r * Math.cos(phi) * 1.1

      const c = Math.random() > 0.5 ? gold : cyan
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return geo
  }, [])

  // 2. Vertical Synaptic Data Conduit (subtle vertical laser filaments)
  const beamGeo = useMemo(() => {
    const count = 12
    const pos = new Float32Array(count * 2 * 3)
    const col = new Float32Array(count * 2 * 3)
    const cCyan = new THREE.Color('#00f0ff')
    const cBlue = new THREE.Color('#4338ca')

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const rad = 0.15 + (i % 3) * 0.08
      const x = Math.cos(angle) * rad
      const z = Math.sin(angle) * rad
      const yLen = 1.8 + (i % 2) * 0.6

      const idx = i * 6
      pos[idx] = x
      pos[idx + 1] = -yLen
      pos[idx + 2] = z

      pos[idx + 3] = x
      pos[idx + 4] = yLen
      pos[idx + 5] = z

      col[idx] = cBlue.r
      col[idx + 1] = cBlue.g
      col[idx + 2] = cBlue.b

      col[idx + 3] = cCyan.r
      col[idx + 4] = cCyan.g
      col[idx + 5] = cCyan.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return geo
  }, [])

  // 3. Data pulses flowing down the conduit
  const { photonGeo, photonSpeeds } = useMemo(() => {
    const count = 20
    const pos = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const rad = 0.15 + (i % 3) * 0.08
      pos[i * 3] = Math.cos(angle) * rad
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.2
      pos[i * 3 + 2] = Math.sin(angle) * rad
      speeds[i] = 1.4 + Math.random() * 2.0
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { photonGeo: geo, photonSpeeds: speeds }
  }, [])

  // 4. Lobe connector lines
  const lobeLinesGeo = useMemo(() => {
    const pos = new Float32Array(LOBE_DEFS.length * 2 * 3)
    LOBE_DEFS.forEach((l, i) => {
      const idx = i * 6
      pos[idx] = l.anchor[0]
      pos[idx + 1] = l.anchor[1]
      pos[idx + 2] = l.anchor[2]

      pos[idx + 3] = l.offset[0]
      pos[idx + 4] = l.offset[1]
      pos[idx + 5] = l.offset[2]
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [])

  // 5. Billboard sprite textures for each lobe
  const lobeTextures = useMemo(() => {
    if (typeof document === 'undefined') return []
    return LOBE_DEFS.map((l) => {
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 80
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 320, 80)
        ctx.fillStyle = 'rgba(8, 10, 16, 0.88)'
        ctx.strokeStyle = l.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(4, 4, 312, 72, 8)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = l.color
        ctx.beginPath()
        ctx.arc(24, 40, 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 18px monospace'
        ctx.fillText(l.title, 42, 34)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '13px monospace'
        ctx.fillText(l.sub, 42, 58)
      }
      const tex = new THREE.CanvasTexture(canvas)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      return tex
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const speedBoost = 1 + (velocity?.current ?? 0) * 0.8
    const rotSpeed = reducedMotion ? 0.3 : 1.0

    // Color transition with morph
    const warmGold = new THREE.Color('#fde68a')
    const cyberCyan = new THREE.Color('#00f0ff')
    const activeColor = warmGold.clone().lerp(cyberCyan, morph)

    // 1. Thalamic Photonic Core pulsation inside the brain
    const corePulse = (1.0 + Math.sin(t * (2.4 + morph * 2.0)) * 0.08) * (1.0 + clickPulse * 0.45)
    const coreAlpha = (0.18 + morph * 0.22 + mouseSpeed * 0.15 + clickPulse * 0.4) * opacity

    if (coreInnerRef.current) {
      coreInnerRef.current.scale.setScalar(corePulse)
      const mat = coreInnerRef.current.material as THREE.MeshBasicMaterial
      mat.color.copy(activeColor)
      mat.opacity = coreAlpha
    }

    if (coreWireRef.current) {
      coreWireRef.current.rotation.x = t * 0.3 * rotSpeed
      coreWireRef.current.rotation.y = t * 0.45 * rotSpeed
      coreWireRef.current.scale.setScalar(corePulse * 1.22)
      const mat = coreWireRef.current.material as THREE.MeshBasicMaterial
      mat.color.copy(activeColor)
      mat.opacity = (0.10 + morph * 0.18 + clickPulse * 0.3) * opacity
    }

    // 2. Brainwave EEG Hologram Waves (expanding outward from the brain center)
    for (let i = 0; i < WAVE_COUNT; i++) {
      const mesh = waveMeshes.current[i]
      if (!mesh) continue

      const wavePhase = ((t * 0.6 + (i * WAVE_PERIOD) / WAVE_COUNT) % WAVE_PERIOD) / WAVE_PERIOD
      const r = (0.45 + wavePhase * 1.4) * (1.0 + clickPulse * 0.35)
      mesh.scale.set(r, r, r)

      // Fade in smoothly then fade out near edge
      const waveAlpha = Math.sin(Math.PI * wavePhase) * (0.08 + morph * 0.15 + clickPulse * 0.3) * opacity
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.color.copy(activeColor)
      mat.opacity = Math.max(0, waveAlpha)
    }

    // 3. Synaptic Stardust drift (swirls with cursor in 3D)
    if (stardustRef.current) {
      const px = pointer ? pointer.x : 0
      const py = pointer ? pointer.y : 0
      stardustRef.current.rotation.y = t * 0.04 * rotSpeed + px * 0.25
      stardustRef.current.rotation.x = -py * 0.20
      const pMat = stardustRef.current.material as THREE.PointsMaterial
      pMat.opacity = (0.22 + morph * 0.22 + mouseSpeed * 0.3 + clickPulse * 0.35) * opacity
    }

    // 4. Vertical Conduit & Photons
    const beamActive = Math.max(0, (morph - 0.1) / 0.8)
    if (beamLinesRef.current) {
      const bMat = beamLinesRef.current.material as THREE.LineBasicMaterial
      bMat.opacity = beamActive * opacity * 0.22
    }

    if (beamPhotonsRef.current && !reducedMotion) {
      const posAttr = photonGeo.getAttribute('position') as THREE.BufferAttribute
      const pArr = posAttr.array as Float32Array
      const count = pArr.length / 3

      for (let i = 0; i < count; i++) {
        let y = pArr[i * 3 + 1] - photonSpeeds[i] * 0.016 * speedBoost
        if (y < -1.8) y = 1.8
        pArr[i * 3 + 1] = y
      }
      posAttr.needsUpdate = true

      const bpMat = beamPhotonsRef.current.material as THREE.PointsMaterial
      bpMat.opacity = beamActive * opacity * 0.5
    }

    // 5. Lobe holographic callout labels
    const lobeAlpha = Math.max(0, 1.0 - morph * 1.8) * (0.35 + mouseSpeed * 0.35 + clickPulse * 0.25) * opacity
    if (lobeLinesRef.current) {
      const mat = lobeLinesRef.current.material as THREE.LineBasicMaterial
      mat.opacity = lobeAlpha * 0.4
    }
    lobeSpritesRef.current.forEach((sp) => {
      if (sp) {
        const mat = sp.material as THREE.SpriteMaterial
        mat.opacity = lobeAlpha * 0.85
      }
    })
  })

  return (
    <group ref={rootRef}>
      {/* 1. Thalamic Photonic Core (Internal Glowing Brain Singularity) */}
      <mesh ref={coreInnerRef} position={[0, -0.05, 0.05]} frustumCulled={false}>
        <sphereGeometry args={[0.24, 20, 20]} />
        <meshBasicMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </mesh>

      {/* Core crystalline lattice */}
      <mesh ref={coreWireRef} position={[0, -0.05, 0.05]} frustumCulled={false}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshBasicMaterial
          wireframe
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.3}
        />
      </mesh>

      {/* 2. Brainwave EEG Hologram Waves (Expanding Concentric Wave Rings) */}
      {Array.from({ length: WAVE_COUNT }).map((_, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            waveMeshes.current[idx] = el
          }}
          rotation={[-Math.PI / 2.3, 0.2, 0]}
          position={[0, -0.05, 0.05]}
          frustumCulled={false}
        >
          <ringGeometry args={[0.98, 1.0, 64]} />
          <meshBasicMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            opacity={0}
          />
        </mesh>
      ))}

      {/* 3. Synaptic Stardust Nebula around the brain */}
      <points ref={stardustRef} geometry={stardustGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.038}
          map={glowTexture()}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.5}
        />
      </points>

      {/* 4. Vertical Data Conduit Beams */}
      <lineSegments ref={beamLinesRef} geometry={beamGeo} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.2}
        />
      </lineSegments>

      {/* Traveling Data Photons */}
      <points ref={beamPhotonsRef} geometry={photonGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.05}
          map={glowTexture()}
          color="#ffffff"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </points>

      {/* 5. Holographic Lobe Callouts */}
      <lineSegments ref={lobeLinesRef} geometry={lobeLinesGeo} frustumCulled={false}>
        <lineBasicMaterial
          color="#00f0ff"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.25}
        />
      </lineSegments>

      {LOBE_DEFS.map((l, i) => (
        <group key={l.title}>
          <mesh position={l.anchor}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshBasicMaterial color={l.color} />
          </mesh>

          {lobeTextures[i] && (
            <sprite
              ref={(el) => {
                lobeSpritesRef.current[i] = el
              }}
              position={l.offset}
              scale={[0.42, 0.105, 1]}
            >
              <spriteMaterial
                map={lobeTextures[i]}
                transparent
                depthWrite={false}
                opacity={0.6}
              />
            </sprite>
          )}
        </group>
      ))}
    </group>
  )
}
