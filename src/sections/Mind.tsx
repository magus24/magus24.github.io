import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { PROFILE } from '../data/profile'
import { STATS } from '../data/metrics'
import { LineReveal, Reveal } from '../components/Primitives'
import { useI18n } from '../i18n/provider'

const EASE = [0.22, 1, 0.36, 1] as const

export function Mind() {
  const { t, messages } = useI18n()

  return (
    <section id="mind" className="hero mind-section" aria-label={t('mind.aria')}>
      <div className="hero-inner">
        <Reveal delay={0.05}>
          <p className="hero-kicker mono">{t('mind.label')}</p>
        </Reveal>

        <h1 className="hero-name" aria-label={PROFILE.name}>
          <LineReveal text={PROFILE.name} delay={0.1} />
        </h1>

        <div className="hero-roles" aria-label="Disciplines">
          {PROFILE.roles.map((role, i) => (
            <Reveal key={role} delay={0.25 + i * 0.12}>
              <a className="hero-role" href="#about">
                <span className="num">0{i + 1}</span>
                {role}
              </a>
            </Reveal>
          ))}
        </div>

        <div className="hero-headline" aria-hidden="true">
          {messages.mind.headline.map((line, i) => (
            <LineReveal
              key={line}
              text={line}
              delay={0.6 + i * 0.14}
              className={i === 1 ? 'line--alt' : ''}
            />
          ))}
        </div>
      </div>

      <div className="hero-hint" aria-hidden="true">
        {t('mind.dragHint')}
      </div>

      <div className="hero-strip">
        {STATS.map((stat, i) => (
          <motion.div
            className="hero-stat"
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 + i * 0.1, ease: EASE }}
          >
            <div className="v">{stat.value}</div>
            <div className="l mono">
              {i === 0
                ? t('mind.statProjects')
                : i === 1
                  ? t('mind.statExperiments')
                  : t('mind.statTechnologies')}
            </div>
          </motion.div>
        ))}
        <motion.a
          className="hero-go"
          href="#idea"
          data-cursor="go"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2, ease: EASE }}
        >
          {t('mind.explore')}
          <span className="arr" aria-hidden="true">
            <ArrowDown size={13} strokeWidth={1.5} />
          </span>
        </motion.a>
      </div>
    </section>
  )
}