"use client";

import { useLanguage } from "./LanguageContext";
import { Card, Pill, Section } from "./charts";
import { DATASETS, LEARNED, MODELS, RULE_BASED } from "@/lib/data";

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1 text-zinc-500">
      {label && (
        <span className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      )}
      <svg width="18" height="14" viewBox="0 0 18 14" className="text-zinc-500">
        <path d="M9 0v9m0 0L4.5 5M9 9l4.5-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function PipeBox({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "green" | "amber" | "red";
}) {
  const tones = {
    default: "border-line bg-surface2 text-zinc-200",
    green: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    red: "border-red-400/40 bg-red-400/10 text-red-300",
  }[tone];
  return (
    <div className={`w-full max-w-xs rounded-xl border px-4 py-2.5 text-center font-mono text-xs sm:text-sm ${tones}`}>
      {label}
    </div>
  );
}

export function PipelineDiagram() {
  const { t } = useLanguage();
  const P = "approach.pipeline.";

  return (
    <Card className="flex flex-col items-center gap-0">
      <PipeBox label={t(`${P}input`)} tone="green" />
      <Arrow />
      <PipeBox label={t(`${P}frames`)} />
      <Arrow />
      <PipeBox label={t(`${P}detect`)} />
      <Arrow />
      <PipeBox label={t(`${P}track`)} />
      <Arrow />
      <PipeBox label={t(`${P}traj`)} />
      <Arrow />
      {/* branch */}
      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        <div className="flex flex-col items-center">
          <svg width="18" height="16" viewBox="0 0 18 16" className="text-zinc-500">
            <path d="M9 0v10m0 0L4.5 6m4.5 4l4.5-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <PipeBox label={t(`${P}scene`)} tone="amber" />
          <Arrow />
          <PipeBox label={t(`${P}events`)} tone="amber" />
        </div>
        <div className="flex flex-col items-center">
          <svg width="18" height="16" viewBox="0 0 18 16" className="text-zinc-500">
            <path d="M9 0v10m0 0L4.5 6m4.5 4l4.5-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <PipeBox label={t(`${P}risk`)} tone="red" />
          <Arrow />
          <PipeBox label={t(`${P}crashRisk`)} tone="red" />
        </div>
      </div>
      <Arrow />
      <PipeBox label={t(`${P}post`)} />
      <Arrow />
      <PipeBox label={t(`${P}final`)} tone="green" />
    </Card>
  );
}

export default function Approach() {
  const { t } = useLanguage();

  return (
    <Section
      id="approach"
      kicker={t("approach.kicker")}
      title={t("approach.title")}
      subtitle={t("approach.subtitle")}
      className="border-t border-line"
    >
      {/* Pipeline */}
      <PipelineDiagram />

      {/* Learned vs rule-based */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            {t("approach.learnedTitle")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {LEARNED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            {t("approach.ruleTitle")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {RULE_BASED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Models */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-zinc-100">{t("approach.models")}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {t("approach.modelsSub")} ·{" "}
          <span className="font-mono text-xs text-amber-400/80">{t("approach.modelNote")}</span>
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {MODELS.map((m) => (
            <Card key={m.name} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-zinc-100">{m.name}</h4>
                <Pill tone={m.learned ? "cyan" : "amber"}>
                  {m.learned ? "learned" : "rule"}
                </Pill>
              </div>
              <dl className="mt-4 space-y-2 text-xs">
                {[
                  [t("approach.field.purpose"), m.purpose],
                  [t("approach.field.input"), m.input],
                  [t("approach.field.output"), m.output],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-16 shrink-0 font-mono text-zinc-500">{k}</dt>
                    <dd className="text-zinc-300">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      </div>

      {/* Datasets */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-zinc-100">{t("approach.datasets")}</h3>
        <p className="mt-1 text-sm text-zinc-500">{t("approach.datasetsSub")}</p>
        <div className="mt-4 overflow-x-auto nice-scroll">
          <table className="w-full min-w-[540px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-xs uppercase tracking-wider text-zinc-500">
                <th className="py-3 pr-4">{t("approach.dataset.name")}</th>
                <th className="py-3 pr-4">{t("approach.dataset.usedFor")}</th>
                <th className="py-3 pr-4">{t("approach.dataset.stage")}</th>
                <th className="py-3">{t("approach.dataset.licence")}</th>
              </tr>
            </thead>
            <tbody>
              {DATASETS.map((d) => (
                <tr key={d.name} className="border-b border-line/70 text-zinc-300">
                  <td className="py-3 pr-4 font-medium text-zinc-100">{d.name}</td>
                  <td className="py-3 pr-4 text-zinc-400">{d.usedFor}</td>
                  <td className="py-3 pr-4">
                    <Pill tone="slate">{d.stage}</Pill>
                  </td>
                  <td className="py-3 font-mono text-xs text-zinc-400">{d.licence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}