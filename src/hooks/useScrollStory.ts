import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '../data/navigation'
import type { SectionId } from '../data/navigation'

export interface Spec {
  enabled: boolean
  dpr: number
  particles: number
  rings: boolean
  parallax: boolean
  dragRotate: boolean
}

/**
 * Device capability tiers:
 * 1 — limited mobile / low-end (compressed scene)
 * 2 — mobile or modest desktop (balanced)
 * 3 — capable desktop (full scene)
 * FPSCapabilities are read once at mount.
 */
export function useCapabilities(): Spec {
  const [spec] = useState<Spec>(() => {
    if (typeof window === 'undefined') {
      return { enabled: false, dpr: 1, particles: 0, rings: false, parallax: false, dragRotate: false }
    }

    let webgl = false
    try {
      const canvas = document.createElement('canvas')
      webgl = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl2') ?? canvas.getContext('webgl')),
      )
    } catch {
      webgl = false
    }
    if (!webgl) {
      return { enabled: false, dpr: 1, particles: 0, rings: false, parallax: false, dragRotate: false }
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      return { enabled: true, dpr: 1, particles: 0, rings: true, parallax: false, dragRotate: false }
    }

    const mobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    const cores = navigator.hardwareConcurrency ?? 4
    const tier = mobile ? (cores <= 4 ? 1 : 2) : cores <= 4 ? 2 : 3
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 3 ? 1.5 : tier === 2 ? 1 : 1)

    return {
      enabled: true,
      dpr,
      particles: tier === 1 ? 42 : tier === 2 ? 72 : 110,
      rings: tier >= 2,
      parallax: tier >= 2,
      dragRotate: tier >= 2,
    }
  })

  return spec
}

/**
 * Tracks which page section owns the viewport and how fast the page
 * is moving — the two signals that drive the CORE state machine.
 */
export function useScrollStory() {
  const [section, setSection] = useState<SectionId>('mind')
  const velocity = useRef(0)
  const projectId = useRef<string | null>(null)

  useEffect(() => {
    let lastY = window.scrollY
    let smoothing = 0
    let raf = 0

    const update = () => {
      const y = window.scrollY
      const raw = Math.abs(y - lastY)
      smoothing = smoothing * 0.82 + Math.min(raw / 24, 3) * 0.18
      velocity.current = smoothing
      lastY = y

      const probe = y + window.innerHeight * 0.35
      let current: SectionId = 'mind'
      const ids = SECTIONS
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.offsetTop <= probe) current = id
      }
      // if the page bottom is reached, contact owns the view
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 8) {
        current = 'contact'
      }

      projectId.current =
        current === 'work'
          ? (() => {
              let pid: string | null = null
              const rows = document.querySelectorAll<HTMLElement>('[data-project]')
              for (const row of rows) {
                if (row.offsetTop <= probe) pid = row.dataset.project ?? null
              }
              return pid
            })()
          : null

      setSection((prev) => (prev === current ? prev : current))
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return { section, velocity, projectId }
}