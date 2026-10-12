import { Canvas } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type { Spec } from '../hooks/useScrollStory'
import { CoreFallback } from '../components/CoreFallback'
import { NeuralField, type CoreEvent } from './NeuralField'
import { ExecutionVisualization } from './ExecutionVisualization'
import { FieldBackdrop } from './FieldBackdrop'
import { neuralBudget } from '../config/neural'

interface DragState {
  sx: number
  sy: number
}

interface CoreSceneProps {
  spec: Spec
  section: string
  velocity: RefObject<number>
  projectId: RefObject<string | null>
  reducedMotion: boolean
}

const EXECUTION_SECTIONS = new Set(['execution', 'work', 'experiments'])

export function CoreScene({
  spec,
  section,
  velocity,
  projectId,
  reducedMotion,
}: CoreSceneProps) {
  const drag = useMemo<DragState>(() => ({ sx: 0, sy: 0 }), [])
  const corePulse = useRef<CoreEvent>({ target: 0 })

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.dataset.dragging = 'true'
  }
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.dataset.dragging !== 'true') return
    drag.sx = (drag.sx + event.movementX * 0.004) % (Math.PI * 2)
    drag.sy = (drag.sy + event.movementY * 0.003) % (Math.PI * 2)
  }
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
    delete el.dataset.dragging
  }

  const stars = neuralBudget(spec).stars

  return (
    <div className="core-stage" aria-hidden="true">
      {spec.enabled ? (
        <Canvas
          dpr={spec.dpr}
          frameloop={reducedMotion ? 'demand' : 'always'}
          camera={{ position: [0, 0, 4.6], fov: 34, near: 0.1, far: 40 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        >
          <FieldBackdrop count={stars} reducedMotion={reducedMotion} />
          {spec.particles > 0 && (
            <NeuralField
              spec={spec}
              section={section}
              projectId={projectId}
              velocity={velocity}
              reducedMotion={reducedMotion}
              corePulse={corePulse}
              drag={drag}
            />
          )}
          {spec.particles > 0 && (
            <ExecutionVisualization
              active={EXECUTION_SECTIONS.has(section)}
              reducedMotion={reducedMotion}
            />
          )}
        </Canvas>
      ) : (
        <div className="core-fallback">
          <CoreFallback />
        </div>
      )}
      {spec.dragRotate && !reducedMotion && (
        <div
          className="core-grab"
          style={{ right: 'calc(var(--pad) + 2vw)', top: '24vh' }}
          data-cursor="rotate"
          role="presentation"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      )}
    </div>
  )
}
