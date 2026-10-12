import type { ReactNode } from 'react'
import { LineReveal, Reveal } from './Primitives'

/**
 * Shared shell for the five narrative chapters (MIND → IDEA → TRANSFER →
 * INTELLIGENCE → EXECUTION). Big display headline, a thin technical label,
 * a short lead — and room for the chapter's own detail below.
 */
export function StorySection({
  id,
  aria,
  label,
  headline,
  lead,
  children,
  className,
}: {
  id: string
  aria: string
  label: string
  headline: readonly string[]
  lead?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={className ? `section story ${className}` : 'section story'} aria-label={aria}>
      <Reveal>
        <p className="story-label mono">{label}</p>
      </Reveal>
      <h2 className="story-headline" aria-hidden="true">
        {headline.map((line, i) => (
          <LineReveal key={line} text={line} delay={0.08 * i} className={i === 1 ? 'line--alt' : ''} />
        ))}
      </h2>
      {lead && (
        <Reveal delay={0.15}>
          <p className="story-lead">{lead}</p>
        </Reveal>
      )}
      {children && (
        <Reveal delay={0.24}>
          <div className="story-body">{children}</div>
        </Reveal>
      )}
    </section>
  )
}