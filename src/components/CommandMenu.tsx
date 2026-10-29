import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, CornerDownLeft, Globe } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROFILE } from '../data/profile'
import { PROJECTS } from '../data/projects'
import { sound } from '../lib/audio'
import { prefersReducedMotion } from '../hooks/useMediaQuery'
import { useLocalizedContent } from '../i18n/content'
import { useI18n } from '../i18n/provider'

const EASE = [0.22, 1, 0.36, 1] as const

interface CommandMenuProps {
  open: boolean
  onClose: () => void
}

interface Action {
  id: string
  group: string
  name: string
  run: () => void
}

export function CommandMenu({ open, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { t, messages } = useI18n()
  const { menuItems } = useLocalizedContent()

  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    })
  }, [])

  const actions = useMemo<Action[]>(
    () => [
      {
        id: 'top',
        group: messages.command.groupNav,
        name: messages.command.backToTop,
        run: () =>
          window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }),
      },
      ...menuItems.map((item) => ({
        id: item.target,
        group: messages.command.groupSections,
        name: item.label.toLowerCase(),
        run: () => goTo(item.target),
      })),
      ...PROJECTS.map((p) => ({
        id: `p-${p.id}`,
        group: 'REPOSITORIES',
        name: `${p.title.toLowerCase()} · ${p.tags.slice(0, 2).join(' ')}`,
        run: () => {
          if (p.github) window.open(p.github, '_blank', 'noopener')
          else goTo('work')
        },
      })),
      { id: 'gh', group: messages.command.groupContact, name: PROFILE.github, run: () => window.open(PROFILE.github, '_blank', 'noopener') },
      { id: 'tg', group: messages.command.groupContact, name: `telegram · ${PROFILE.telegram}`, run: () => window.open(PROFILE.telegram, '_blank', 'noopener') },
      { id: 'in', group: messages.command.groupContact, name: PROFILE.linkedin, run: () => window.open(PROFILE.linkedin, '_blank', 'noopener') },
      { id: 'em', group: messages.command.groupContact, name: PROFILE.email, run: () => (window.location.href = `mailto:${PROFILE.email}`) },
    ],
    [goTo, menuItems, messages],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter(
      (a) => a.name.toLowerCase().includes(q) || a.group.toLowerCase().includes(q),
    )
  }, [query, actions])

  useEffect(() => {
    if (open) {
      setQuery('')
      setIndex(0)
      const t = window.setTimeout(() => inputRef.current?.focus(), 60)
      return () => window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({
      block: 'nearest',
    })
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, index])

  const run = useCallback(
    (action: Action) => {
      onClose()
      window.setTimeout(action.run, 80)
    },
    [onClose],
  )

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={t('command.aria')}>
          <motion.div
            className="overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={onClose}
          />
          <motion.div
            className="cmd"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.35, ease: EASE }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation()
                onClose()
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                sound.playHover()
                setIndex((i) => (i + 1) % Math.max(filtered.length, 1))
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                sound.playHover()
                setIndex((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1))
              }
              if (event.key === 'Enter' && filtered[index]) {
                event.preventDefault()
                sound.playClick()
                run(filtered[index])
              }
            }}
          >
            <div className="cmd-panel">
              <div className="cmd-input-row">
                <span className="caret" aria-hidden="true">
                  {'>'}
                </span>
                <label htmlFor="cmd-input" className="visually-hidden">
                  {t('command.inputLabel')}
                </label>
                <input
                  ref={inputRef}
                  id="cmd-input"
                  className="cmd-input"
                  type="text"
                  placeholder={t('command.placeholder')}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setIndex(0)
                  }}
                />
                <CornerDownLeft size={14} strokeWidth={1.5} color="var(--dim)" aria-hidden="true" />
              </div>
              <div ref={listRef} className="cmd-list" role="listbox" aria-label={t('command.commandsAria')}>
                {filtered.length === 0 && (
                  <div className="cmd-empty">
                    {t('command.empty').replace('{query}', query)}
                  </div>
                )}
                {filtered.map((action, i) => (
                  <button
                    key={action.id}
                    type="button"
                    className="cmd-item"
                    role="option"
                    aria-selected={i === index}
                    data-index={i}
                    onMouseEnter={() => {
                      sound.playHover()
                      setIndex(i)
                    }}
                    onClick={() => {
                      sound.playClick()
                      run(action)
                    }}
                  >
                    <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                    <span className="name">{action.name}</span>
                    <span className="group">{action.group}</span>
                    {action.group === messages.command.groupSections ? (
                      <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Globe size={14} strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}