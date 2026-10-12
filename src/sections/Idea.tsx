import { ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n/provider'
import { StorySection } from '../components/StorySection'

export function Idea() {
  const { t, messages } = useI18n()
  const idea = messages.idea

  return (
    <StorySection
      id="idea"
      aria={t('idea.aria')}
      label={idea.label}
      headline={idea.headline}
      lead={idea.lead}
    >
      <div className="story-steps">
        {idea.steps.map((step, i) => (
          <div className="story-step" key={step.name}>
            <span className="step-num">0{i + 1}</span>
            <span className="step-name">{step.name}</span>
            <span className="mono step-note">{step.note}</span>
            {i < idea.steps.length - 1 && (
              <ArrowRight className="story-step-arrow" size={22} strokeWidth={1.2} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <p className="mono story-footer">{idea.footer}</p>
    </StorySection>
  )
}