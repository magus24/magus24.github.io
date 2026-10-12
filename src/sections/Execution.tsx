import { useI18n } from '../i18n/provider'
import { StorySection } from '../components/StorySection'

export function Execution() {
  const { t, messages } = useI18n()
  const ex = messages.execution

  return (
    <StorySection
      id="execution"
      aria={t('execution.aria')}
      label={ex.label}
      headline={ex.headline}
      lead={ex.desc}
    >
      <div className="execution-flow" aria-label="Input - Processing - Output">
        <div className="execution-stage">
          <span className="execution-glyph mono">⇥</span>
          <span className="execution-name">{ex.flow[0].name}</span>
          <span className="mono execution-note">{ex.flow[0].note}</span>
        </div>
        <div className="execution-stage">
          <span className="execution-glyph mono">⇄</span>
          <span className="execution-name">{ex.flow[1].name}</span>
          <span className="mono execution-note">{ex.flow[1].note}</span>
        </div>
        <div className="execution-stage">
          <span className="execution-glyph mono">⇥</span>
          <span className="execution-name">{ex.flow[2].name}</span>
          <span className="mono execution-note">{ex.flow[2].note}</span>
        </div>
      </div>
      <p className="mono story-footer">{ex.result}</p>
    </StorySection>
  )
}