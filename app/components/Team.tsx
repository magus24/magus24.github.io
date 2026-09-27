"use client";

import { useLanguage } from "./LanguageContext";
import { Card, Section } from "./charts";
import { TEAM } from "@/lib/data";

function MemberCard({
  m,
}: {
  m: (typeof TEAM)[number];
}) {
  const { t } = useLanguage();
  return (
    <Card className="flex flex-col">
      {/* avatar placeholder */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 font-mono text-lg font-semibold text-emerald-300">
          {m.initials}
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">{m.name}</h3>
          <p className="mt-0.5 text-sm text-emerald-300/90">{m.role}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Contribution
        </p>
        <ul className="space-y-2">
          {m.contribution.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-sm text-zinc-400">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        {[
          { href: m.github, label: t("team.github"), icon: "G" },
          { href: m.linkedin, label: t("team.linkedin"), icon: "in" },
          { href: m.portfolio, label: t("team.portfolio"), icon: "↗" },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface2 px-3 font-mono text-xs text-zinc-300 transition-colors hover:border-zinc-600"
          >
            {l.label}
          </a>
        ))}
      </div>
    </Card>
  );
}

export default function Team() {
  const { t } = useLanguage();
  return (
    <Section
      id="team"
      index="08"
      kicker={t("team.kicker")}
      title={t("team.title")}
      subtitle={t("team.subtitle")}
      className="border-t border-line"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((m) => (
          <MemberCard key={m.id} m={m} />
        ))}
      </div>
    </Section>
  );
}