"use client";

import { EVENT_REPORTS } from "@/lib/data";
import type { EventReadiness } from "@/lib/types";
import { useLanguage } from "./LanguageContext";

const RADAR_COLORS: Record<EventReadiness, string> = {
  active: "#5ee6a8",
  flagged: "#ffc46b",
  prototype: "#b8a5ff",
  planned: "#ff746d",
};

function EventRadar() {
  const { t } = useLanguage();
  const active = EVENT_REPORTS.filter((report) => report.readiness === "active").length;
  const flagged = EVENT_REPORTS.filter((report) => report.readiness === "flagged").length;

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-7">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative flex items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">{t("hero.radarLabel")}</p>
          <p className="mt-2 text-sm text-zinc-300">CAM-01 · STATIC SCENE</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          SYSTEM MAP
        </span>
      </div>

      <div className="relative mx-auto mt-5 aspect-square w-full max-w-[420px]">
        <svg viewBox="0 0 420 420" className="h-full w-full" role="img" aria-label="Fourteen traffic event readiness channels">
          <defs>
            <radialGradient id="radarGlow">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="radarBeam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="210" cy="210" r="190" fill="url(#radarGlow)" />
          {[70, 112, 154, 190].map((radius) => (
            <circle key={radius} cx="210" cy="210" r={radius} fill="none" stroke="rgba(152,188,214,.18)" strokeWidth="1" />
          ))}
          <path d="M210 20V400M20 210H400" stroke="rgba(152,188,214,.12)" strokeWidth="1" />
          <path d="M78 78 342 342M342 78 78 342" stroke="rgba(152,188,214,.08)" strokeWidth="1" />
          <g className="radar-sweep">
            <path d="M210 210 210 20A190 190 0 0 1 335 77Z" fill="url(#radarBeam)" />
            <line x1="210" y1="210" x2="210" y2="20" stroke="#67e8f9" strokeOpacity="0.42" strokeWidth="1.5" />
          </g>
          {EVENT_REPORTS.map((report, index) => {
            const angle = (index / EVENT_REPORTS.length) * Math.PI * 2 - Math.PI / 2;
            const radius = report.readiness === "active" ? 160 : report.readiness === "flagged" ? 176 : 190;
            const x = Number((210 + Math.cos(angle) * radius).toFixed(2));
            const y = Number((210 + Math.sin(angle) * radius).toFixed(2));
            const color = RADAR_COLORS[report.readiness];
            return (
              <g key={report.label}>
                <circle cx={x} cy={y} r={report.readiness === "active" ? 7 : 5} fill={color} fillOpacity={report.readiness === "active" ? 0.95 : 0.8} className={report.readiness === "active" ? "radar-pulse" : ""} />
                <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#07111f">{index + 1}</text>
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-mono text-6xl font-semibold tracking-[-0.08em] text-zinc-50">14</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-200">{t("hero.channels")}</p>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2 border-t border-line pt-5 sm:grid-cols-4">
        <div className="rounded-xl bg-emerald-300/8 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-200">{t("hero.defaultPath")}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{active}</p>
        </div>
        <div className="rounded-xl bg-amber-300/8 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-200">{t("hero.behindFlag")}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{flagged}</p>
        </div>
        <div className="col-span-2 rounded-xl bg-white/[0.04] p-3 sm:col-span-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">{t("hero.radarCaption")}</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
            {Object.entries(RADAR_COLORS).map(([status, color]) => (
              <span key={status} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                {t(`events.${status}`)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="hero-section relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-[-22rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            {t("hero.badge")}
          </div>
          <h1 className="mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-zinc-50 sm:text-7xl">
            {t("hero.title1")} <span className="hero-title-accent">{t("hero.title2")}</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">{t("hero.subtitle")}</p>

          <div className="mt-9 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
            <div className="border-l border-cyan-300/40 pl-3">
              <p className="font-mono text-2xl font-semibold text-zinc-100">14</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">{t("hero.channels")}</p>
            </div>
            <div className="border-l border-emerald-300/40 pl-3">
              <p className="font-mono text-2xl font-semibold text-zinc-100">05</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">{t("hero.defaultPath")}</p>
            </div>
            <div className="border-l border-amber-300/40 pl-3">
              <p className="font-mono text-2xl font-semibold text-zinc-100">03</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">{t("hero.behindFlag")}</p>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#events" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-200">
              {t("hero.ctaEvents")}
              <span aria-hidden="true">↘</span>
            </a>
            <a href="#demo" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface/70 px-6 text-sm font-semibold text-zinc-200 transition-all hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-surface">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              {t("hero.ctaDemo")}
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 border-t border-line pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            <span>YOLO11x</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>ByteTrack</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>causal risk hook</span>
          </div>
        </div>

        <EventRadar />
      </div>
    </section>
  );
}
