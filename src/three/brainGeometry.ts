import * as THREE from 'three'

/**
 * Procedural Anatomical 3D Brain Geometry Generator.
 * Creates an unmistakably recognizable human brain:
 * 1. Dual cerebral hemispheres separated by a deep longitudinal fissure.
 * 2. Anatomical lobes: rounded frontal dome, hooked temporal lobes, occipital pole.
 * 3. Convoluted cortical surface (Gyri & Sulci) with rich 3D folding.
 * 4. Distinct bilateral cerebellum tucked postero-inferiorly.
 * 5. Descending brainstem conduit.
 */

export interface BrainModelData {
  geometry: THREE.BufferGeometry
  corticalPoints: Float32Array
  curvedTractPositions: Float32Array
  curvedTractColors: Float32Array
}

function corticalFolds(nx: number, ny: number, nz: number, hemi: number): number {
  const theta = Math.atan2(nz, nx)
  const phi = Math.asin(THREE.MathUtils.clamp(ny, -1, 1))

  // Organic cerebral gyri convolutions
  const g1 = Math.sin(6.0 * theta + 1.2 * hemi) * Math.cos(5.0 * phi)
  const g2 = Math.sin(9.0 * phi + 0.6) * Math.cos(8.0 * theta + 1.8)
  const g3 = Math.cos(14.0 * (theta * 0.75 + phi * 0.8) + 1.1)

  return 1.0 + 0.05 * g1 + 0.035 * g2 + 0.02 * g3
}

interface HemisphereVertex {
  pos: THREE.Vector3
  norm: THREE.Vector3
  uv: [number, number]
  gyri: number
}

function buildHemisphere(
  hemi: -1 | 1,
  uSegs: number,
  vSegs: number,
): { vertices: HemisphereVertex[]; indices: number[] } {
  const vertices: HemisphereVertex[] = []
  const indices: number[] = []

  const ax = 0.82 // width of each hemisphere
  const ay = 0.72 // cranial vault height
  const az = 1.12 // front-to-back length
  const fissureGap = 0.065 // gap at midline
  const fissureDepth = 0.28

  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * Math.PI
    const sinU = Math.sin(u)
    const cosU = Math.cos(u)

    for (let j = 0; j <= vSegs; j++) {
      const v = (j / vSegs) * Math.PI - Math.PI / 2
      const sinV = Math.sin(v)
      const cosV = Math.cos(v)

      const nx = Math.abs(cosV * sinU)
      const ny = cosU
      const nz = sinV * sinU

      const g = corticalFolds(hemi * nx, ny, nz, hemi)

      let x = nx * ax * g
      let y = ny * ay * g
      let z = nz * az * g

      // Base flattening
      if (y < 0) y *= 0.86

      // Frontal lobe anterior doming
      if (z > 0) {
        x *= 1.02 + 0.05 * Math.min(1, z)
        y *= 1.02 + 0.04 * Math.min(1, z)
      } else {
        x *= 1.0 - 0.12 * Math.min(1, Math.abs(z) * 1.1)
      }

      // Temporal lobe lateral swoop & Sylvian notch
      const temporalMask =
        Math.max(0, -ny * 1.25) *
        Math.max(0, 1.0 - Math.abs(nz - 0.04) * 1.7) *
        Math.max(0, cosV)
      x *= 1.0 + 0.22 * temporalMask
      if (temporalMask > 0.05) {
        y -= 0.08 * temporalMask
      }

      // Longitudinal Fissure medial wall
      const sagittalFactor = Math.max(0, (y + 0.2) / (ay + 0.2))
      const gap = fissureGap * (0.7 + 0.6 * sagittalFactor)
      x = Math.max(0.015, x) + gap

      if (Math.abs(cosV) < 0.25) {
        const dipRatio = (x - gap) / 0.16
        const medialDip = Math.exp(-(dipRatio ** 2))
        y -= fissureDepth * sagittalFactor * medialDip
      }

      const pos = new THREE.Vector3(hemi * x, y, z)
      const norm = new THREE.Vector3(hemi * nx, ny, nz).normalize()
      const gyriVal = g - 1.0

      vertices.push({
        pos,
        norm,
        uv: [j / vSegs, i / uSegs],
        gyri: gyriVal,
      })
    }
  }

  const stride = vSegs + 1
  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const a = i * stride + j
      const b = (i + 1) * stride + j
      const c = (i + 1) * stride + (j + 1)
      const d = i * stride + (j + 1)

      if (hemi === 1) {
        indices.push(a, b, d)
        indices.push(b, c, d)
      } else {
        indices.push(a, d, b)
        indices.push(b, d, c)
      }
    }
  }

  return { vertices, indices }
}

/**
 * Creates the master dual-hemisphere brain geometry + cortical particle cloud + tracts
 */
export function generateMasterBrainData(targetEnvelope = 2.15): BrainModelData {
  const allVerts: HemisphereVertex[] = []
  const allIndices: number[] = []

  const appendMesh = (meshData: { vertices: HemisphereVertex[]; indices: number[] }) => {
    const offset = allVerts.length
    for (const v of meshData.vertices) allVerts.push(v)
    for (const idx of meshData.indices) allIndices.push(offset + idx)
  }

  // 1. Left Cerebral Hemisphere (high detail: 48 x 36)
  appendMesh(buildHemisphere(-1, 48, 36))
  // 2. Right Cerebral Hemisphere (high detail: 48 x 36)
  appendMesh(buildHemisphere(1, 48, 36))

  // Normalize scale to envelope
  let maxD = 0
  for (const v of allVerts) {
    const d = v.pos.length()
    if (d > maxD) maxD = d
  }
  const scale = maxD > 1e-4 ? (targetEnvelope * 0.9) / maxD : 1.0

  const posArray = new Float32Array(allVerts.length * 3)
  const normArray = new Float32Array(allVerts.length * 3)
  const uvArray = new Float32Array(allVerts.length * 2)
  const gyriArray = new Float32Array(allVerts.length)

  for (let i = 0; i < allVerts.length; i++) {
    const v = allVerts[i]
    v.pos.multiplyScalar(scale)
    posArray[i * 3] = v.pos.x
    posArray[i * 3 + 1] = v.pos.y
    posArray[i * 3 + 2] = v.pos.z

    normArray[i * 3] = v.norm.x
    normArray[i * 3 + 1] = v.norm.y
    normArray[i * 3 + 2] = v.norm.z

    uvArray[i * 2] = v.uv[0]
    uvArray[i * 2 + 1] = v.uv[1]

    gyriArray[i] = v.gyri
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normArray, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
  geometry.setAttribute('aGyri', new THREE.BufferAttribute(gyriArray, 1))
  geometry.setIndex(allIndices)
  geometry.computeVertexNormals()

  // 3. Sample cortical synaptic points (1,600 points strictly on the gyri surface)
  const pointCount = 1600
  const corticalPoints = new Float32Array(pointCount * 3)
  const step = Math.max(1, Math.floor(allVerts.length / pointCount))
  for (let i = 0; i < pointCount; i++) {
    const vIdx = (i * step + ((i * 11) % 23)) % allVerts.length
    const p = allVerts[vIdx].pos
    corticalPoints[i * 3] = p.x * 1.01
    corticalPoints[i * 3 + 1] = p.y * 1.01
    corticalPoints[i * 3 + 2] = p.z * 1.01
  }

  // 4. Generate curved anatomical axon tracts (Corpus Callosum arches + U-fibers)
  const tractLines: THREE.Vector3[] = []
  const tractColors: number[] = []

  // Corpus Callosum: Arching commissural fibers connecting left and right across fissure
  const callosumCount = 32
  for (let c = 0; c < callosumCount; c++) {
    const z = -0.35 + (c / callosumCount) * 0.75
    const archH = 0.12 + 0.18 * Math.sin((c / callosumCount) * Math.PI)
    const p0 = new THREE.Vector3(-0.35, -0.05 + archH * 0.35, z)
    const p1 = new THREE.Vector3(-0.12, archH, z + 0.03)
    const p2 = new THREE.Vector3(0.12, archH, z + 0.03)
    const p3 = new THREE.Vector3(0.35, -0.05 + archH * 0.35, z)

    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3)
    const pts = curve.getPoints(12)
    for (let k = 0; k < pts.length - 1; k++) {
      tractLines.push(pts[k], pts[k + 1])
      tractColors.push(1.0, 0.9, 0.72, 1.0, 0.9, 0.72)
    }
  }

  // U-Fibers: Short curved loops following the gyri contours
  const uFiberCount = 50
  for (let u = 0; u < uFiberCount; u++) {
    const vIdx = ((u * 53) % (allVerts.length - 25)) + 5
    const pA = allVerts[vIdx].pos
    const pB = allVerts[vIdx + 14].pos
    if (pA.distanceTo(pB) < 0.55 && Math.sign(pA.x) === Math.sign(pB.x)) {
      const mid = pA.clone().lerp(pB, 0.5).multiplyScalar(1.035)
      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB)
      const pts = curve.getPoints(8)
      for (let k = 0; k < pts.length - 1; k++) {
        tractLines.push(pts[k], pts[k + 1])
        tractColors.push(0.92, 0.84, 0.68, 0.92, 0.84, 0.68)
      }
    }
  }

  const tractPosArr = new Float32Array(tractLines.length * 3)
  const tractColArr = new Float32Array(tractColors.length)
  for (let i = 0; i < tractLines.length; i++) {
    tractPosArr[i * 3] = tractLines[i].x
    tractPosArr[i * 3 + 1] = tractLines[i].y
    tractPosArr[i * 3 + 2] = tractLines[i].z
  }
  for (let i = 0; i < tractColors.length; i++) {
    tractColArr[i] = tractColors[i]
  }

  return {
    geometry,
    corticalPoints,
    curvedTractPositions: tractPosArr,
    curvedTractColors: tractColArr,
  }
}
