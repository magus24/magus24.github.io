"use client";

import { useLanguage } from "./LanguageContext";
import { Section } from "./charts";
import { LINKS } from "@/lib/data";

const LINKS_LIST = [
  { key: "links.repo", href: LINKS.repository, icon: "repo" },
  { key: "links.weights", href: LINKS.weights, icon: "weight" },
  { key: "links.predictions", href: LINKS.predictions, icon: "json" },
] as const;

function Icon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "repo")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" {...common}>
        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
      </svg>
    );
  if (name === "weight")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" {...common}>
        <path d="M12 3a3 3 0 0 1 3 3c0 .6-.2 1.1-.5 1.6l6 3.2L18 16l-5.5-2.9L7 16l-2.5-5.2 6-3.2A3 3 0 0 1 12 3z" />
        <path d="M12 6h.01" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...common}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

export default function Links() {
  const { t } = useLanguage();
  return (
    <Section
      id="links"
      index="09"
      kicker={t("links.kicker")}
      title={t("links.title")}
      subtitle={t("links.subtitle")}
      className="border-t border-line"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {LINKS_LIST.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-1 hover:border-emerald-400/40"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Icon name={l.icon} />
            </div>
            <h3 className="mt-5 font-semibold text-zinc-100 group-hover:text-emerald-300">
              {t(`${l.key}`)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{t(`${l.key}Desc`)}</p>
          </a>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={LINKS.teamGithub}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
        >
          Team GitHub
        </a>
        <a
          href={LINKS.teamLinkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
        >
          Team LinkedIn
        </a>
      </div>
    </Section>
  );
}