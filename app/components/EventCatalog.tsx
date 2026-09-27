"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { EVENT_LABEL_TEXT, EVENT_REPORTS } from "@/lib/data";
import type { EventLabel, EventReadiness } from "@/lib/types";

const UZ_LABELS: Record<EventLabel, string> = {
  accident: "Avariya",
  near_miss: "Yaqin o'tkazib yuborilgan",
  red_light: "Qizil chiroq",
  wrong_way: "Noto'g'ri yo'nalish",
  illegal_u_turn: "Noqonuniy orqali burilish",
  stopped_vehicle: "To'xtagan transport",
  jaywalking: "Yo'ldan o'tish",
  failure_to_yield: "Yo'l berishda xato",
  illegal_turn: "Noqonuniy burilish",
  solid_line_crossing: "Uzluksiz chiziqni kesish",
  stop_line: "Stop-line qoidasi",
  congestion: "Trafik tiqilishi",
  road_obstacle: "Yo'l to'sig'i",
  fire_smoke: "Olov / tutun",
};

const STATUS_ORDER: EventReadiness[] = ["active", "flagged", "prototype", "planned"];

const STATUS_META: Record<
  EventReadiness,
  { labelKey: string; dot: string; text: string; border: string; panel: string }
> = {
  active: {
    labelKey: "events.active",
    dot: "bg-emerald-300",
    text: "text-emerald-200",
    border: "border-emerald-300/30",
    panel: "from-emerald-300/15 via-emerald-300/5 to-transparent",
  },
  flagged: {
    labelKey: "events.flagged",
    dot: "bg-amber-300",
    text: "text-amber-200",
    border: "border-amber-300/30",
    panel: "from-amber-300/15 via-amber-300/5 to-transparent",
  },
  prototype: {
    labelKey: "events.prototype",
    dot: "bg-violet-300",
    text: "text-violet-200",
    border: "border-violet-300/30",
    panel: "from-violet-300/15 via-violet-300/5 to-transparent",
  },
  planned: {
    labelKey: "events.planned",
    dot: "bg-rose-300",
    text: "text-rose-200",
    border: "border-rose-300/30",
    panel: "from-rose-300/15 via-rose-300/5 to-transparent",
  },
};

const GLYPH_PATHS: Record<EventLabel, string[]> = {
  accident: [
    "M7 16h5m8 0h5",
    "M16 7v5m0 8v5",
    "m10 12 4 4 4-4",
    "m10 20 4-4 4 4",
  ],
  near_miss: [
    "M6 23c4-10 9-14 15-13",
    "M20 7h4v4",
    "m20 7-4 4",
    "M8 23h7",
  ],
  red_light: [
    "M12 5v3",
    "M9 8h6v13H9z",
    "M12 11h.01M12 15h.01M12 19h.01",
  ],
  wrong_way: [
    "M7 25 25 7",
    "M17 7h8v8",
    "m25 7-6 6",
    "M5 8h8",
  ],
  illegal_u_turn: [
    "M7 24V14a9 9 0 0 1 18 0v5",
    "M20 19h5v-5",
    "M11 24h10",
  ],
  stopped_vehicle: [
    "M10 8v16M22 8v16",
    "M7 8h18",
    "M7 24h18",
    "M13 12h6",
  ],
  jaywalking: [
    "M16 5v.01",
    "m16 9-3 6 3 4v7m0-11 4 4h4",
    "M13 15h6",
  ],
  failure_to_yield: [
    "M7 24h9",
    "M19 12h6v7h-6z",
    "m25 15-3-3m3 3-3 3",
    "M11 7v.01m-2 4 2 3-2 4",
  ],
  illegal_turn: [
    "M6 25V14a8 8 0 0 1 8-8h7",
    "M17 3h5v5",
    "m17 3 5 5",
    "M6 25h7",
  ],
  solid_line_crossing: [
    "M5 25 27 7",
    "m-1 4 2 2m3 3 2 2m3 3 2 2",
    "M6 19c6-2 11-6 15-11",
  ],
  stop_line: [
    "M5 23h22",
    "M16 5v18",
    "M11 9h10",
    "m-3-3 3 3 3-3",
  ],
  congestion: [
    "M5 22h6v4H5zM13 16h6v10h-6zM21 9h6v17h-6z",
  ],
  road_obstacle: [
    "m16 5 11 11-11 11L5 16 16 5Z",
    "M12 16h8",
  ],
  fire_smoke: [
    "M16 27c-5 0-8-3-8-8 0-4 2-7 5-10 0 4 2 5 3 7 2-2 2-5 1-8 5 3 7 7 7 11 0 5-3 8-8 8Z",
    "M16 22c-2 0-3-1-3-3 0-2 1-3 2-4 0 2 1 2 1 3 1-1 1-2 1-3 1 1 2 2 2 4 0 2-1 3-3 3Z",
  ],
};

function eventName(label: EventLabel, lang: "en" | "uz") {
  return lang === "uz" ? UZ_LABELS[label] : EVENT_LABEL_TEXT[label];
}

function StatusPill({ readiness }: { readiness: EventReadiness }) {
  const { t } = useLanguage();
  const meta = STATUS_META[readiness];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${meta.border} ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {t(meta.labelKey)}
    </span>
  );
}

function EventGlyph({ label }: { label: EventLabel }) {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      {GLYPH_PATHS[label].map((path) => (
        <path
          key={path}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      ))}
    </svg>
  );
}

function ReportField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/80 bg-background/35 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

export default function EventCatalog() {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<EventLabel>("wrong_way");
  const selectedReport = EVENT_REPORTS.find((report) => report.label === selected) ?? EVENT_REPORTS[0];
  const selectedMeta = STATUS_META[selectedReport.readiness];
  const selectedIndex = EVENT_REPORTS.findIndex((report) => report.label === selectedReport.label);

  return (
    <section id="events" className="relative scroll-mt-20 border-t border-line py-16 sm:py-24">
      <div className="bg-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <div className="flex items-baseline gap-5">
              <p className="font-mono text-sm leading-none text-inkfaint">03</p>
              <p className="border-t border-line pt-3 text-xs leading-5 text-inkdim">{t("events.kicker")}</p>
            </div>
            <h2 className="mt-4 max-w-3xl text-balance text-2xl font-semibold leading-[1.12] tracking-[-0.021em] text-foreground sm:text-4xl">{t("events.title")}</h2>
            <p className="mt-4 max-w-[68ch] text-sm leading-7 text-inkdim sm:text-[0.975rem]">{t("events.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status];
              const count = EVENT_REPORTS.filter((report) => report.readiness === status).length;
              return (
                <div key={status} className={`rounded-xl border bg-surface/70 p-3 ${meta.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{t(meta.labelKey)}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-zinc-100">{count.toString().padStart(2, "0")}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EVENT_REPORTS.map((report, index) => {
            const meta = STATUS_META[report.readiness];
            const isSelected = report.label === selectedReport.label;
            return (
              <button
                key={report.label}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${eventName(report.label, lang)} · ${t(meta.labelKey)}`}
                onClick={() => setSelected(report.label)}
                className={`group relative min-h-[190px] overflow-hidden rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${meta.border} ${isSelected ? "bg-white/[0.07] shadow-2xl shadow-cyan-950/30 ring-1 ring-cyan-200/50" : "bg-surface/75 hover:bg-white/[0.04]"}`}
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${meta.panel}`} />
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-xs text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
                  <span className={`h-2 w-2 rounded-full ${meta.dot} ${isSelected ? "animate-pulse" : ""}`} />
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${meta.border} ${meta.text} bg-background/35`}>
                    <EventGlyph label={report.label} />
                  </span>
                  <span className="text-sm font-semibold text-zinc-100">{eventName(report.label, lang)}</span>
                </div>
                <p className="mt-4 text-xs leading-5 text-zinc-500">{report.short}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <StatusPill readiness={report.readiness} />
                  <span className="font-mono text-[10px] text-zinc-600">{report.completedSteps}/{report.steps.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid overflow-hidden rounded border border-line bg-surface lg:grid-cols-[0.72fr_1.28fr]">
          <div className={`relative min-w-0 overflow-hidden border-b border-line bg-gradient-to-br p-6 sm:p-8 lg:border-b-0 lg:border-r ${selectedMeta.panel}`}>
            <div className="relative">
              <div className="flex items-center justify-between gap-3 font-mono text-[10px] text-inkfaint">
                <span>{t("events.selected")}</span>
                <span>{String(selectedIndex + 1).padStart(2, "0")} / 14</span>
              </div>
              <div className={`mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border ${selectedMeta.border} ${selectedMeta.text} bg-background/40`}>
                <EventGlyph label={selectedReport.label} />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">{eventName(selectedReport.label, lang)}</h3>
              <p className="mt-2 text-sm font-medium text-zinc-400">{selectedReport.short}</p>
              <div className="mt-6"><StatusPill readiness={selectedReport.readiness} /></div>
              <p className="mt-8 text-sm leading-7 text-zinc-400">{selectedReport.summary}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                <a href="#demo" className="inline-flex h-10 items-center gap-2 rounded bg-signal px-4 text-xs font-semibold text-[#14100a] transition-colors hover:bg-amber-300">
                  {t("events.openDemo")}
                  <span aria-hidden="true">↗</span>
                </a>
                <a href="#approach" className="inline-flex h-10 items-center gap-2 rounded border border-line bg-background/40 px-4 text-xs font-semibold text-inkdim transition-colors hover:border-inkfaint hover:text-foreground">
                  {t("events.seeArchitecture")}
                </a>
              </div>
            </div>
          </div>

          <div className="min-w-0 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
              <div>
                <p className="font-mono text-[10px] text-inkfaint">{t("events.implementation")}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-inkdim">{t("events.pathNote")}</p>
              </div>
              <span className={`font-mono text-xs ${selectedMeta.text}`}>{selectedReport.completedSteps}/{selectedReport.steps.length} steps</span>
            </div>

            <div className="nice-scroll mt-6 overflow-x-auto pb-2">
              <div className="grid min-w-[560px] grid-cols-5 gap-2">
                {selectedReport.steps.map((step, index) => {
                  const done = index < selectedReport.completedSteps;
                  const isFlagGate = selectedReport.readiness === "flagged" && index === 3;
                  return (
                    <div key={step} className="relative">
                      {index < selectedReport.steps.length - 1 && <span className="absolute left-[calc(50%+18px)] right-[-8px] top-4 h-px bg-line" />}
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[10px] ${done ? `${selectedMeta.border} ${selectedMeta.text} bg-background` : "border-line text-zinc-600"}`}>
                        {done ? "✓" : index + 1}
                      </div>
                      <p className={`mt-3 pr-2 text-[11px] leading-4 ${isFlagGate ? "text-amber-200" : "text-zinc-500"}`}>{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-2">
              <ReportField label={t("events.current")} value={selectedReport.evidence} />
              <ReportField label={t("events.detector")} value={selectedReport.detector} />
              <ReportField label={t("events.blocker")} value={selectedReport.blocker} />
              <ReportField label={t("events.source")} value={selectedReport.source} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
