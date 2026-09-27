"use client";

import type { ReactNode } from "react";
import type { EventLabel, EventSeg, RiskPoint } from "@/lib/types";
import { EVENT_REPORTS, RUN_PER_CLASS, RUN_TOTALS, formatDuration } from "@/lib/data";

/* ─── Reusable layout primitives ─────────────────────────────────────────── */

/**
 * A section opener with a left rail.
 *
 * The previous version gave all nine sections the same treatment - a cyan
 * all-caps mono eyebrow, a 48px title, a max-w-2xl subtitle - so nothing about
 * the page's structure was encoded and the eye had no rhythm to follow. The rail
 * now carries the section's position in the argument, which is real information
 * (these ARE a sequence: problem, method, evidence, verdict, people), and the
 * kicker drops the tracked-out uppercase so it reads as a label rather than as
 * a stamp.
 */
export function Section({
  id,
  index,
  kicker,
  title,
  subtitle,
  children,
  className = "",
}: {
  id: string;
  index?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 border-t border-line py-16 sm:py-24 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="lg:grid lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:gap-12">
          <div className="mb-6 lg:mb-0">
            {index ? (
              <p className="font-mono text-sm leading-none text-inkfaint">{index}</p>
            ) : null}
            {kicker ? (
              <p className="mt-3 max-w-[13rem] text-xs leading-5 text-inkdim lg:border-t lg:border-line lg:pt-3">
                {kicker}
              </p>
            ) : null}
          </div>
          <div className="min-w-0">
            <h2 className="max-w-3xl text-balance text-2xl font-semibold leading-[1.12] tracking-[-0.021em] text-foreground sm:text-4xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-4 max-w-[68ch] text-sm leading-7 text-inkdim sm:text-[0.975rem]">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Card({
  children,
  className = "",
  flag = false,
}: {
  children: ReactNode;
  className?: string;
  /** Panel carries a verdict, not just data. */
  flag?: boolean;
}) {
  return (
    <div className={`${flag ? "glass-flag" : "glass"} p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "red" | "slate" | "cyan";
}) {
  const tones: Record<string, string> = {
    green: "border-ok/30 bg-ok/10 text-emerald-200",
    amber: "border-signal/35 bg-signal/10 text-amber-200",
    red: "border-alarm/35 bg-alarm/10 text-red-200",
    slate: "border-line bg-white/[0.04] text-inkdim",
    cyan: "border-ice/25 bg-ice/10 text-ice",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] leading-5 text-inkdim ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ─── Event colour = the measured verdict, not a hue per class ────────────── */

/**
 * Previously all fourteen classes got their own pastel at a similar saturation,
 * which asserted that fourteen detectors are equally alive. The measured run
 * says the opposite: four of them fire for almost the entire footage, and five
 * are structurally silent. So colour is derived from what each class actually
 * did across all four clips, and it updates itself whenever the predictions are
 * regenerated.
 */
export type Verdict = "saturating" | "brief" | "silent";

/** Total measured footage: 340 + 318 + 318 + 128 s. */
const RUN_SECONDS = RUN_TOTALS.durationSec;
const PER_CLASS = RUN_PER_CLASS;

export function verdictOf(label: string): Verdict {
  const measured = PER_CLASS[label];
  if (!measured || measured.segments === 0) return "silent";
  return measured.seconds / RUN_SECONDS >= 0.25 ? "saturating" : "brief";
}

export const VERDICT_COLORS: Record<Verdict, { bar: string; chip: string }> = {
  saturating: { bar: "#ff4d4d", chip: "border-alarm/45 bg-alarm/10 text-red-200" },
  brief: { bar: "#5bd98a", chip: "border-ok/40 bg-ok/10 text-emerald-200" },
  silent: { bar: "#5b636e", chip: "border-line bg-white/[0.03] text-inkfaint" },
};

export const EVENT_COLORS: Record<EventLabel, { bar: string; chip: string }> =
  Object.fromEntries(
    EVENT_REPORTS.map((report) => [report.label, VERDICT_COLORS[verdictOf(report.label)]]),
  ) as Record<EventLabel, { bar: string; chip: string }>;

export function EventChip({ label, onClick }: { label: string; onClick?: () => void }) {
  const colors = EVENT_COLORS[label as EventLabel] ?? VERDICT_COLORS.silent;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs ${colors.chip}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-[1px]"
        style={{ backgroundColor: colors.bar }}
      />
      {label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </button>
  );
}

/* ─── Event timeline (bars on a track; clickable) ─────────────────────────── */

export function EventTimeline({
  duration,
  events,
  onSelect,
  activeIndex,
}: {
  duration: number;
  events: EventSeg[];
  onSelect?: (index: number) => void;
  activeIndex?: number;
}) {
  if (duration <= 0) return null;
  const W = 100; // viewBox width in percent units
  const H = 64;
  const pads = 6;
  const usable = W - pads * 2;

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height: H + 18 }}>
        <svg viewBox={`0 0 ${W} 100`} preserveAspectRatio="none" className="h-full w-full">
          {/* time axis */}
          <line x1={pads} y1={10} x2={W - pads} y2={10} stroke="rgba(148,163,184,.25)" strokeWidth={0.5} />
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={pads + usable * f}
              y1={6}
              x2={pads + usable * f}
              y2={14}
              stroke="rgba(148,163,184,.4)"
              strokeWidth={0.5}
            />
          ))}
          {events.map((e, i) => {
            const x = pads + (e.start / duration) * usable;
            const w = Math.max(((e.end - e.start) / duration) * usable, 1.2);
            const color = EVENT_COLORS[e.label as EventLabel]?.bar ?? "#ef4444";
            return (
              <g
                key={i}
                onClick={() => onSelect?.(i)}
                style={{ cursor: onSelect ? "pointer" : "default" }}
                opacity={activeIndex === undefined || activeIndex === i ? 1 : 0.3}
              >
                <rect x={x} y={16} width={w} height={28} rx={2} fill={color} fillOpacity={0.85}>
                  <title>{`${e.label} · ${formatDuration(e.start)}–${formatDuration(e.end)}`}</title>
                </rect>
              </g>
            );
          })}
          {activeIndex !== undefined && events[activeIndex] && (
            <line
              x1={pads + (events[activeIndex].start / duration) * usable}
              y1={2}
              x2={pads + (events[activeIndex].start / duration) * usable}
              y2={58}
              stroke="#fff"
              strokeWidth={0.8}
              strokeDasharray="2 2"
            />
          )}
        </svg>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-500">
          <span>00:00</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {events.length === 0 && (
          <span className="font-mono text-xs text-zinc-500">—</span>
        )}
        {events.map((e, i) => (
          <EventChip
            key={i}
            label={e.label}
            onClick={() => onSelect?.(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Risk curve ──────────────────────────────────────────────────────────── */

export function RiskCurve({
  points,
  accidentAt,
}: {
  points: RiskPoint[];
  accidentAt?: number | null;
}) {
  if (!points || points.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-line font-mono text-xs text-zinc-500">
        No risk data
      </div>
    );
  }
  const W = 600;
  const H = 140;
  const padL = 26;
  const padR = 8;
  const padT = 14;
  const padB = 22;

  const tMax = Math.max(...points.map((p) => p[0]), 1);
  const x = (t: number) => padL + (t / tMax) * (W - padL - padR);
  const y = (s: number) => padT + (1 - Math.min(s, 1)) * (H - padT - padB);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Accident risk curve">
        <defs>
          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padL}
            x2={W - padR}
            y1={y(f)}
            y2={y(f)}
            stroke="rgba(148,163,184,.18)"
            strokeWidth={1}
            strokeDasharray={f === 0 ? "0" : "3 4"}
          />
        ))}
        <line x1={padL} x2={W - padR} y1={y(0.5)} y2={y(0.5)} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" />
        <text x={W - padR} y={y(0.5) + 3} textAnchor="end" fontSize={8} fill="#f59e0b" fontFamily="monospace">
          θ = 0.5
        </text>
        <path d={`${path} L ${x(tMax)} ${y(0)} L ${x(0)} ${y(0)} Z`} fill="url(#riskFill)" />
        <path d={path} fill="none" stroke="#f87171" strokeWidth={2} strokeLinejoin="round" />
        {accidentAt != null && (
          <g>
            <line x1={x(accidentAt)} x2={x(accidentAt)} y1={padT} y2={H - padB} stroke="#fef08a" strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={x(accidentAt)} y={H - padB - 2} fontSize={9} fill="#fef08a" fontFamily="monospace" textAnchor={accidentAt > tMax / 2 ? "end" : "start"}>
              accident
            </text>
          </g>
        )}
        {[0, 0.5, 1].map((f) => (
          <text key={f} x={padL - 5} y={y(f) + 3} fontSize={9} fill="#94a3b8" fontFamily="monospace" textAnchor="end">
            {f.toFixed(1)}
          </text>
        ))}
        <text x={W - padR} y={H - 6} fontSize={9} fill="#94a3b8" fontFamily="monospace" textAnchor="end">
          {formatDuration(tMax)}
        </text>
        <text x={padL} y={H - 6} fontSize={9} fill="#94a3b8" fontFamily="monospace">
          00:00
        </text>
      </svg>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        P(accident within 5 s)
      </p>
    </div>
  );
}

/* ─── Bar chart (object counts over time) ─────────────────────────────────── */

export function CountBars({
  series,
}: {
  series: { label: string; values: number[] }[];
}) {
  const W = 320;
  const H = 150;
  const padL = 30;
  const padB = 22;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const groupW = (W - padL - 10) / series[0].values.length;
  const barW = Math.max((groupW / series.length) * 0.7, 3);
  const palette = ["#34d399", "#60a5fa", "#fbbf24", "#a78bfa"];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Object counts over time">
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={padL} x2={W - 6} y1={H - padB - f * (H - padB - 8)} y2={H - padB - f * (H - padB - 8)} stroke="rgba(148,163,184,.15)" strokeWidth={1} />
        ))}
        {series[0].values.map((_, i) => (
          <text key={i} x={padL + groupW * i + groupW / 2} y={H - 6} fontSize={8} fill="#94a3b8" fontFamily="monospace" textAnchor="middle">
            {i * 15}s
          </text>
        ))}
        <text x={padL - 4} y={H - padB - (0) * (H - padB - 8) + 3} fontSize={8} fill="#94a3b8" fontFamily="monospace" textAnchor="end">
          0
        </text>
        <text x={padL - 4} y={H - padB - 1 * (H - padB - 8) + 3} fontSize={8} fill="#94a3b8" fontFamily="monospace" textAnchor="end">
          {max}
        </text>
        {series.map((s, si) =>
          s.values.map((v, i) => {
            const bh = (v / max) * (H - padB - 10);
            return (
              <rect
                key={`${si}-${i}`}
                x={padL + groupW * i + (groupW / series.length) * si}
                y={H - padB - bh}
                width={barW}
                height={bh}
                rx={1.5}
                fill={palette[si % palette.length]}
                fillOpacity={0.85}
              >
                <title>{`${s.label} @ ${i * 15}s: ${v}`}</title>
              </rect>
            );
          })
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {series.map((s, i) => (
          <span key={s.label} className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[i % palette.length] }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Area chart (traffic density) ────────────────────────────────────────── */

export function DensityArea({ data }: { data: { t: number; v: number }[] }) {
  const W = 320;
  const H = 130;
  const padL = 30;
  const padB = 22;
  const padT = 10;
  const tMax = Math.max(...data.map((d) => d.t), 1);
  const x = (t: number) => padL + (t / tMax) * (W - padL - 6);
  const y = (v: number) => padT + (1 - v) * (H - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(d.t).toFixed(1)} ${y(d.v).toFixed(1)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Traffic density over time">
        <defs>
          <linearGradient id="densityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`${path} L ${x(tMax)} ${y(0)} L ${x(0)} ${y(0)} Z`} fill="url(#densityFill)" />
        <path d={path} fill="none" stroke="#22d3ee" strokeWidth={2} />
        {data.map((d) => (
          <circle key={d.t} cx={x(d.t)} cy={y(d.v)} r={2.5} fill="#22d3ee" />
        ))}
        <text x={padL} y={H - 6} fontSize={8} fill="#94a3b8" fontFamily="monospace">
          00:00
        </text>
        <text x={W - 6} y={H - 6} fontSize={8} fill="#94a3b8" fontFamily="monospace" textAnchor="end">
          {formatDuration(tMax)}
        </text>
      </svg>
      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        <span className="h-2 w-2 rounded-full bg-cyan-400" /> Density
      </div>
    </div>
  );
}