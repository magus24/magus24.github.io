import { lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import { Background } from './components/Background'
import { Cursor } from './components/Cursor'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { ScrollProgress } from './components/ScrollProgress'
import { ProjectOverlay } from './components/ProjectOverlay'
import { CommandMenu } from './components/CommandMenu'
import { Guide } from './components/Guide'
import { CoreFallback } from './components/CoreFallback'
import { CoreStatus } from './components/CoreStatus'
import { useCapabilities, useScrollStory } from './hooks/useScrollStory'
import { prefersReducedMotion } from './hooks/useMediaQuery'
import { useI18n } from './i18n/provider'
import { networkNodeCount } from './config/neural'
import { cx } from './lib/utils'
import type { Project } from './data/projects'
import { Mind } from './sections/Mind'
import { Idea } from './sections/Idea'
import { Transfer } from './sections/Transfer'
import { Ai } from './sections/Ai'
import { Execution } from './sections/Execution'
import { About } from './sections/About'
import { Work } from './sections/Work'
import { Experiments } from './sections/Experiments'
import { Contact } from './sections/Contact'

const CoreScene = lazy(() =>
  import('./three/CoreScene').then((m) => ({ default: m.CoreScene })),
)

interface OverlayState {
  command: boolean
  guide: boolean
  project: Project | null
}

const OVERLAYS_INITIAL: OverlayState = { command: false, guide: false, project: null }

type OverlayAction =
  | { type: 'command'; value: boolean }
  | { type: 'guide'; value: boolean }
  | { type: 'project'; value: Project | null }

function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState {
  switch (action.type) {
    case 'command':
      return { ...state, command: action.value, guide: false }
    case 'guide':
      return { ...state, command: false, guide: action.value }
    case 'project':
      return { ...state, project: action.value }
  }
}

export default function App() {
  const spec = useCapabilities()
  const story = useScrollStory()
  const reducedMotion = Boolean(useReducedMotion())
  const { t, lang } = useI18n()
  const [overlays, dispatch] = useReducer(overlayReducer, OVERLAYS_INITIAL)

  /* brief blur/fade when the language swaps — the CORE canvas lives outside
     this wrapper, so the 3D scene never flickers at the switch. */
  const [fading, setFading] = useState(false)
  const prevLang = useRef(lang)
  useEffect(() => {
    if (prevLang.current === lang) return
    prevLang.current = lang
    setFading(true)
    const id = window.setTimeout(() => setFading(false), 300)
    return () => window.clearTimeout(id)
  }, [lang])

  const openProject = useCallback((project: Project) => {
    dispatch({ type: 'project', value: project })
  }, [])
  const closeProject = useCallback(() => dispatch({ type: 'project', value: null }), [])
  const setCommand = useCallback(
    (value: boolean) => dispatch({ type: 'command', value }),
    [],
  )
  const setGuide = useCallback((value: boolean) => dispatch({ type: 'guide', value }), [])

  useEffect(() => {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.hash,
    )
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      if (typing) return

      if (event.key === '/') {
        event.preventDefault()
        setCommand(!overlays.command)
      } else if (event.key === '?') {
        event.preventDefault()
        setGuide(!overlays.guide)
      } else if (event.key === 'd' || event.key === 'D') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlays.command, setCommand, setGuide])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#work">
        {t('app.skip')}
      </a>

      <Background />
      <ScrollProgress />

      {spec.enabled ? (
        <Suspense fallback={null}>
          <CoreScene
            spec={spec}
            section={story.section}
            velocity={story.velocity}
            projectId={story.projectId}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      ) : (
        <div className="core-stage" aria-hidden="true">
          <div className="core-fallback">
            <CoreFallback />
          </div>
        </div>
      )}

      <div className={cx('app', fading && 'app-fade')}>
        <Navigation />

        <main>
          <Mind />
          <Idea />
          <Transfer />
          <Ai />
          <Execution />
          <Work onOpen={openProject} />
          <Experiments />
          <About />
          <Contact />
        </main>

        <Footer />
      </div>

      <span className="keys" aria-hidden="true">
        <kbd>/</kbd> {t('app.keysMenu')} <kbd>?</kbd> {t('app.keysGuide')} <kbd>D</kbd>{' '}
        {t('app.keysTop')}
      </span>

      <CoreStatus nodes={networkNodeCount(spec)} />
      <ProjectOverlay project={overlays.project} onClose={closeProject} />
      <CommandMenu open={overlays.command} onClose={() => setCommand(false)} />
      <Guide open={overlays.guide} onClose={() => setGuide(false)} />
      <Cursor />
    </MotionConfig>
  )
}