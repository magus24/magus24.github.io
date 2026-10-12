import { useI18n } from '../i18n/provider'
import { StorySection } from '../components/StorySection'

export function Transfer() {
  const { t, messages } = useI18n()
  const transfer = messages.transfer

  return (
    <StorySection
      id="transfer"
      aria={t('transfer.aria')}
      label={transfer.label}
      headline={transfer.headline}
      lead={transfer.desc}
    >
      <div className="transfer-note">
        <span className="mono transfer-arrow" aria-hidden="true">
          ↓
        </span>
        <p className="mono transfer-caption">{t('transfer.sub')}</p>
      </div>
    </StorySection>
  )
}