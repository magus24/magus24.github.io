import { useI18n } from '../i18n/provider'
import { StorySection } from '../components/StorySection'

export function Ai() {
  const { t, messages } = useI18n()
  const ai = messages.ai

  return (
    <StorySection
      id="ai"
      aria={t('ai.aria')}
      label={ai.label}
      headline={ai.headline}
      lead={ai.desc}
    >
      <div className="story-qualities">
        {ai.flow.map((q, i) => (
          <div className="story-quality" key={q.name}>
            <span className="step-num">0{i + 1}</span>
            <span className="quality-name">{q.name}</span>
            <span className="mono quality-note">{q.note}</span>
          </div>
        ))}
      </div>
      <p className="mono story-footer">{ai.result}</p>
    </StorySection>
  )
}