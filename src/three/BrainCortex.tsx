import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { generateMasterBrainData, type BrainModelData } from './brainGeometry'
import { glowTexture } from './glow'
import type { NeuralSystem } from './system'

interface BrainCortexProps {
  sys: NeuralSystem
  morph: number // 0 = human organic brain, 1 = machine compute net
  opacity: number
}

const CORTEX_VERTEX_SHADER = /* glsl */ `
  attribute float aGyri;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying float vGyri;

  void main() {
    vGyri = aGyri;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const CORTEX_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uOpacity;
  uniform vec3 uColorHumanBase;
  uniform vec3 uColorHumanRim;
  uniform vec3 uColorAiBase;
  uniform vec3 uColorAiRim;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying float vGyri;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Elegant Fresnel rim glow (only glows at glancing angles)
    float NdotV = abs(dot(normal, viewDir));
    float rim = pow(1.0 - NdotV, 3.2);

    // Subtle bio-electric pulse traveling anterior to posterior
    float pulse = sin(vWorldPosition.z * 4.0 - uTime * 2.5 + vGyri * 8.0);
    pulse = smoothstep(0.85, 1.0, pulse) * 0.3;

    // Gyral convolutions catch subtle light
    float ridge = smoothstep(-0.02, 0.08, vGyri) * 0.15;

    // Color transition
    vec3 rimCol = mix(uColorHumanRim, uColorAiRim, uMorph);
    vec3 baseCol = mix(uColorHumanBase, uColorAiBase, uMorph);

    vec3 finalColor = baseCol * 0.2 + rimCol * (rim * 1.2 + pulse + ridge);

    // Translucent glass alpha: low in middle, glowing on silhouette
    float alpha = (rim * 0.45 + pulse * 0.4 + ridge * 0.2 + 0.03) * uOpacity * (1.0 - uMorph * 0.95);

    if (alpha < 0.005) discard;

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export function BrainCortex({ sys, morph, opacity }: BrainCortexProps) {
  const brainData = useMemo<BrainModelData>(() => generateMasterBrainData(sys.maxR), [sys.maxR])
  
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const tractsRef = useRef<THREE.LineSegments>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uOpacity: { value: 1 },
      uColorHumanBase: { value: new THREE.Color(0.24, 0.2, 0.16) },
      uColorHumanRim: { value: new THREE.Color(1.0, 0.88, 0.68) },
      uColorAiBase: { value: new THREE.Color(0.08, 0.18, 0.32) },
      uColorAiRim: { value: new THREE.Color(0.35, 0.68, 1.0) },
    }),
    [],
  )

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(brainData.corticalPoints, 3))
    return geo
  }, [brainData])

  const tractsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(brainData.curvedTractPositions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(brainData.curvedTractColors, 3))
    return geo
  }, [brainData])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
      matRef.current.uniforms.uMorph.value = morph
      matRef.current.uniforms.uOpacity.value = Math.max(0.1, opacity * 0.9)
    }

    // Points breathing and fade
    if (pointsRef.current) {
      const pMat = pointsRef.current.material as THREE.PointsMaterial
      pMat.opacity = Math.max(0.1, (1.0 - morph * 0.9) * opacity * 0.75)
    }

    // Tracts fade
    if (tractsRef.current) {
      const tMat = tractsRef.current.material as THREE.LineBasicMaterial
      tMat.opacity = Math.max(0.15, (1.0 - morph * 0.85) * opacity * 0.65)
    }
  })

  return (
    <group>
      {/* 1. Holographic 3D Brain Cortex Mesh */}
      <mesh ref={meshRef} geometry={brainData.geometry} frustumCulled={false}>
        <shaderMaterial
          ref={matRef}
          vertexShader={CORTEX_VERTEX_SHADER}
          fragmentShader={CORTEX_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Subtle Wireframe Gyral Lattice Accent */}
      <mesh geometry={brainData.geometry} frustumCulled={false}>
        <meshBasicMaterial
          wireframe
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color={morph > 0.5 ? 0x38bdf8 : 0xfde68a}
          opacity={Math.max(0.03, (1.0 - morph * 0.85) * opacity * 0.14)}
        />
      </mesh>

      {/* 2. High-density Cortical Synaptic Particles */}
      <points ref={pointsRef} geometry={pointsGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.038}
          map={glowTexture()}
          transparent
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color={morph > 0.5 ? 0x7dd3fc : 0xfff1dc}
        />
      </points>

      {/* 3. Curved Anatomical Axon Tracts (Corpus Callosum & U-Fibers) */}
      <lineSegments ref={tractsRef} geometry={tractsGeo} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.65}
        />
      </lineSegments>
    </group>
  )
}
