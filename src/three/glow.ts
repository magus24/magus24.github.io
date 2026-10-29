import * as THREE from 'three'

/** Lazy radial glow sprite used by node + signal billboards. */
let _glow: THREE.CanvasTexture | null = null

export function glowTexture(): THREE.CanvasTexture {
  if (_glow) return _glow
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.08, 'rgba(255,255,255,0.94)')
  g.addColorStop(0.22, 'rgba(255,255,255,0.46)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.11)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  _glow = new THREE.CanvasTexture(canvas)
  _glow.needsUpdate = true
  return _glow
}