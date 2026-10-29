import { useState } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { PROFILE } from '../data/profile'
import { SectionLabel, Reveal, LineReveal } from '../components/Primitives'
import { sound } from '../lib/audio'
import { useI18n } from '../i18n/provider'

export function Contact() {
  const { t, messages } = useI18n()
  const [copied, setCopied] = useState(false)

  const copyEmail = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(PROFILE.email).then(() => {
      sound.playConfirm()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const channels = [
    { label: 'GitHub', value: PROFILE.github, href: PROFILE.github },
    { label: 'Telegram', value: PROFILE.telegram, href: PROFILE.telegram },
    { label: 'LinkedIn', value: PROFILE.linkedin, href: PROFILE.linkedin },
    { label: messages.socials.email, value: PROFILE.email, href: `mailto:${PROFILE.email}` },
  ]

  return (
    <section id="contact" className="section" aria-label={t('contact.aria')}>
      <SectionLabel index="06" title={t('contact.sectionTitle')} />

      <div className="contact-grid">
        <div>
          <p className="contact-title" aria-label={t('contact.titleAria')}>
            <LineReveal text={t('contact.lines')[0]} />
            <span className="big">
              <LineReveal text={t('contact.lines')[1]} delay={0.1} />
              <LineReveal text={t('contact.lines')[2]} delay={0.2} />
              <LineReveal text={t('contact.lines')[3]} delay={0.3} />
            </span>
          </p>
          <Reveal delay={0.2}>
            <p className="contact-lead">{t('contact.lead')}</p>
          </Reveal>
        </div>

        <div>
          <div className="mono" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{t('contact.channels')}</span>
            <button
              type="button"
              onClick={copyEmail}
              className="mono"
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? '#4ade80' : 'var(--muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 3,
                transition: 'color 0.2s',
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? 'EMAIL COPIED' : 'COPY EMAIL'}</span>
            </button>
          </div>
          {channels.map((channel, i) => (
            <Reveal key={channel.label} delay={0.08 * i} y={18}>
              <a
                className="contact-channel"
                href={channel.href}
                target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
                data-cursor="open"
                onPointerEnter={() => sound.playHover()}
                onClick={() => sound.playClick()}
              >
                <span className="mono">0{i + 1}</span>
                {channel.label}
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: 'var(--accent)', marginLeft: 'auto' }}
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          ))}

          <div className="contact-status">
            <span className="dot" aria-hidden="true" />
            {t('app.statusOpen')} — {t('app.location')} / {PROFILE.timezone}
          </div>
        </div>
      </div>
    </section>
  )
}