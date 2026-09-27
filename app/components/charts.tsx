"use client";

import type { ReactNode } from "react";
import type { EventLabel, EventSeg, RiskPoint } from "@/lib/types";
import { formatDuration } from "@/lib/data";

/* ─── Reusable layout primitives ─────────────────────────────────────────── */

export function Section({
  id,
  kicker,
  title,
  subtitle,
  children,
  className = "",
}: {
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {kicker && (
          <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.24em] text-cyan-300">
            {kicker}
          </p>
        )}
        <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            {subtitle}
          </p>
        )}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-6 ${className}`}
    >
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
    green: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    amber: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    red: "border-rose-300/30 bg-rose-300/10 text-rose-200",
    slate: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ─── Event colours ───────────────────────────────────────────────────────── */

export const EVENT_COLORS: Record<EventLabel, { bar: string; chip: string }> = {
  accident: { bar: "#ef4444", chip: "border-red-400/40 bg-red-400/10 text-red-300" },
  near_miss: { bar: "#f97316", chip: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
  red_light: { bar: "#f43f5e", chip: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
  wrong_way: { bar: "#f59e0b", chip: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  illegal_u_turn: { bar: "#e879f9", chip: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300" },
  stopped_vehicle: { bar: "#94a3b8", chip: "border-slate-400/40 bg-slate-400/10 text-slate-300" },
  jaywalking: { bar: "#a78bfa", chip: "border-violet-400/40 bg-violet-400/10 text-violet-300" },
  failure_to_yield: { bar: "#fb7185", chip: "border-pink-400/40 bg-pink-400/10 text-pink-300" },
  illegal_turn: { bar: "#c084fc", chip: "border-purple-400/40 bg-purple-400/10 text-purple-300" },
  solid_line_crossing: { bar: "#22d3ee", chip: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" },
  stop_line: { bar: "#2dd4bf", chip: "border-teal-400/40 bg-teal-400/10 text-teal-300" },
  congestion: { bar: "#60a5fa", chip: "border-blue-400/40 bg-blue-400/10 text-blue-300" },
  road_obstacle: { bar: "#a3e635", chip: "border-lime-400/40 bg-lime-400/10 text-lime-300" },
  fire_smoke: { bar: "#ef4444", chip: "border-red-400/40 bg-red-400/10 text-red-300" },
};

export function EventChip({ label, onClick }: { label: string; onClick?: () => void }) {
  const colors = EVENT_COLORS[label as EventLabel] ?? EVENT_COLORS.accident;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition-transform hover:-translate-y-0.5 ${colors.chip}`}
    >
      <span
        className="h-2 w-2 rounded-full"
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