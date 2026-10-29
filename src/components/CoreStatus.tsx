import { useI18n } from '../i18n/provider'

interface CoreStatusProps {
  nodes: number
}

/**
 * Quiet telemetry strip pinned to the bottom-left corner — the page's
 * "machine status". Purely decorative, hidden behind the accessibility
 * tree because it duplicates what the scene already communicates.
 */
export function CoreStatus({ nodes }: CoreStatusProps) {
  const { t } = useI18n()

  return (
    <div className="core-status" aria-hidden="true">
      <span className="cs-cell">
        <span className="cs-dot" />
        {t('status.coreOnline')}
      </span>
      <span className="cs-cell">
        {t('status.nodes')} <b>{String(nodes).padStart(2, '0')}</b>
      </span>
      <span className="cs-cell">
        {t('status.signalActive')}
      </span>
      <span className="cs-cell">REPOSITORIES <b>19</b></span>
      <span className="cs-cell">{t('status.systemReady')}</span>
    </div>
  )
}