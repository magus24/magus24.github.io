import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EXPERIMENTS, type ExperimentPattern } from '../data/experiments'
import type { Project } from '../data/projects'
import { cx } from '../lib/utils'
import { SectionLabel } from '../components/Primitives'
import { ExperimentGlyph } from '../components/visuals/ExperimentGlyph'
import { sound } from '../lib/audio'
import { useLocalizedContent } from '../i18n/content'
import { useI18n } from '../i18n/provider'

const PATTERN_REPOS: Record<ExperimentPattern, string[]> = {
  vision: ['sputnik-ai', 'med-vision', 'firedetect', 'wiut-cv-track'],
  security: ['passive-agent', 'shieldx', 'exam-guard', 'telegram-fishing'],
  agents: ['passive-agent', 'ecobot', 'eshitaman'],
  interfaces: ['portfolio-core', 'yotoqhonam', 'sputnik-ai'],
  reverse: ['passive-agent', 'antifake', 'shieldx'],
  hardware: ['smartwater', 'smart-traffic', 'firedetect'],
}

interface ExperimentsProps {
  onOpen?: (project: Project) => void
}

export function Experiments({ onOpen }: ExperimentsProps) {
  const [active, setActive] = useState(0)
  const { experiments, projects } = useLocalizedContent()
  const { t } = useI18n()
  const experiment = experiments[active]

  const relatedProjects = useMemo(() => {
    const ids = PATTERN_REPOS[experiment.pattern] || []
    return ids.map((id) => projects.find((p) => p.id === id)).filter(Boolean) as Project[]
  }, [experiment.pattern, projects])

  return (
    <section id="experiments" className="section" aria-label={t('experiments.aria')}>
      <SectionLabel index="02" title={t('experiments.sectionTitle')} />
      <p className="lede" style={{ marginTop: -28, marginBottom: 44 }}>
        {t('experiments.lede')}
      </p>

      <div className="exp-grid">
        <ul className="exp-list">
          {experiments.map((item, i) => (
            <li key={item.index}>
              <button
                type="button"
                className={cx('exp-row')}
                aria-pressed={i === active}
                onMouseEnter={() => {
                  sound.playHover()
                  setActive(i)
                }}
                onFocus={() => setActive(i)}
                onClick={() => {
                  sound.playClick()
                  setActive(i)
                }}
              >
                <span className="index">{item.index}</span>
                <span className="name">{item.title}</span>
                <ArrowUpRight className="arr" size={18} strokeWidth={1.4} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <div className="exp-stage" aria-live="polite">
          <div className="stage-head">
            <span className="mono">{t('experiments.fieldPreview')}</span>
            <span className="mono" style={{ color: 'var(--accent)' }}>
              {experiment.index} / {String(EXPERIMENTS.length).padStart(2, '0')}
            </span>
          </div>
          <div className="stage-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={experiment.pattern}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}
              >
                <div className="stage-num" aria-hidden="true">
                  {experiment.index}
                </div>
                <div style={{ width: '70%', maxWidth: 220 }}>
                  <ExperimentGlyph pattern={experiment.pattern} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="stage-desc">
            <p>
              <b>{experiment.title}.</b> {experiment.description}
            </p>

            {/* Direct Links to Matching Open Source Repositories */}
            {relatedProjects.length > 0 && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  REPRESENTATIVE ARCHITECTURE:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {relatedProjects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        sound.playModalOpen()
                        onOpen?.(p)
                      }}
                      onPointerEnter={() => sound.playHover()}
                      className="mono"
                      style={{
                        fontSize: 10,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#38bdf8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>{p.title}</span>
                      <ArrowUpRight size={10} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}