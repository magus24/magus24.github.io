"use client";

import { RUN_FACTS, SAMPLE_VIDEOS } from "@/lib/data";
import { VERDICT_COLORS, verdictOf } from "./charts";
import { useLanguage } from "./LanguageContext";

const RECORDED = SAMPLE_VIDEOS.find((v) => v.id === "c3905");

/**
 * The hero graphic: the actual measured run.
 *
 * This used to be a radar chart - fourteen numbered dots on concentric rings,
 * a rotating sweep, one number in the middle. All that ink encoded "5 active, 3
 * flagged", which a sentence states better, and a radar has no way to show the
 * only thing this project actually has: WHEN things happen.
 *
 * So the hero is now the evidence. The Part B risk curve sits above the 14 event
 * segments on one shared time axis, the four saturating detectors are ordered to
 * the top because that is the finding, and the two numbers under it are the
 * measured runtime and the budget it has to fit in. It is also the honest
 * headline: we are asking to be judged on measurements, so the first thing on
 * the page is a measurement.
 */
function MeasuredRun() {
  const { t } = useLanguage();
  const run = RECORDED;
  if (!run) return null;

  const W = 760;
  const H = 360;
  const GUT = 122; // class-label gutter
  const X0 = GUT;
  const X1 = W - 12;
  const SPAN = X1 - X0;
  const RISK_TOP = 16;
  const RISK_BOT = 132;
  const RISK_MAX = 0.7;
  const LANE_TOP = 162;
  const LANE_H = 18;
  const AXIS_Y = 300;

  const x = (t: number) => X0 + (t / run.duration) * SPAN;
  const y = (s: number) => RISK_BOT - (Math.min(s, RISK_MAX) / RISK_MAX) * (RISK_BOT - RISK_TOP);

  // Classes ordered by how much of the clip they covered: the finding is at the
  // top, not buried in lane nine.
  const lanes = Object.entries(
    run.events.reduce<Record<string, { start: number; end: number }[]>>((acc, seg) => {
      (acc[seg.label] ??= []).push(seg);
      return acc;
    }, {}),
  )
    .map(([label, segs]) => ({
      label,
      segs,
      seconds: segs.reduce((sum, s) => sum + (s.end - s.start), 0),
    }))
    .sort((a, b) => b.seconds - a.seconds);

  const area =
    `${run.risk.map(([t, s], i) => `${i === 0 ? "M" : "L"}${x(t).toFixed(1)} ${y(s).toFixed(1)}`).join(" ")} ` +
    `L${x(run.duration).toFixed(1)} ${RISK_BOT} L${X0} ${RISK_BOT} Z`;
  const line = run.risk
    .map(([t, s], i) => `${i === 0 ? "M" : "L"}${x(t).toFixed(1)} ${y(s).toFixed(1)}`)
    .join(" ");

  return (
    /* min-w-0: a grid item defaults to min-width:auto, so the chart's 680px
       floor would otherwise inflate the whole card to 714px inside a 390px
       viewport - cropped by the body with nothing to scroll. */
    <div className="glass min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <p className="text-sm font-medium text-foreground">{run.title}</p>
        <p className="font-mono text-xs text-inkfaint">
          {RUN_FACTS.events} segments · {run.duration.toFixed(2)} s · {run.resolution}
        </p>
      </div>

      {/* A 760x360 timeline scaled into a 324px column puts 4px labels on the
          screen. Below the sm breakpoint the chart keeps its intrinsic width
          and the card scrolls sideways instead, so the class names stay
          readable. Scrolling is contained here, so the page never overflows. */}
      <div className="mt-4 overflow-x-auto pb-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[680px] sm:min-w-0"
        role="img"
        aria-label={`Part B risk curve and ${RUN_FACTS.events} event segments measured on ${run.title}`}
      >
        {/* risk scale */}
        {[0, 0.35, 0.7].map((s) => (
          <g key={s}>
            <line
              x1={X0}
              x2={X1}
              y1={y(s)}
              y2={y(s)}
              stroke="rgba(170,185,205,0.10)"
              strokeWidth="1"
            />
            <text x={X0 - 8} y={y(s) + 3} textAnchor="end" fontSize="10" fill="#6a737f" fontFamily="monospace">
              {s.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={X0 - 8} y={RISK_TOP - 5} textAnchor="end" fontSize="10" fill="#99a3b0">
          risk
        </text>

        <path d={area} fill="rgba(169,199,232,0.10)" />
        <path d={line} fill="none" stroke="#a9c7e8" strokeWidth="1.5" />

        {/* alarm threshold, the one line the metric actually cares about */}
        <line
          x1={X0}
          x2={X1}
          y1={y(0.5)}
          y2={y(0.5)}
          stroke="#ff9a2e"
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.8"
        />
        <text x={X1} y={y(0.5) - 5} textAnchor="end" fontSize="10" fill="#ff9a2e" fontFamily="monospace">
          θ 0.5
        </text>

        {/* one lane per class, ordered by total coverage */}
        {lanes.map((lane, i) => {
          const top = LANE_TOP + i * LANE_H;
          const color = VERDICT_COLORS[verdictOf(lane.label)];
          return (
            <g key={lane.label}>
              <text
                x={X0 - 8}
                y={top + 11}
                textAnchor="end"
                fontSize="10"
                fill={color.bar}
                fontFamily="monospace"
              >
                {lane.label.replace(/_/g, " ")}
              </text>
              {lane.segs.map((seg, j) => {
                const w = Math.max(1.5, x(seg.end) - x(seg.start));
                return (
                  <rect
                    key={j}
                    x={x(seg.start)}
                    y={top + 3}
                    width={w}
                    height={12}
                    fill={color.bar}
                    fillOpacity={lane.seconds / run.duration >= 0.25 ? 0.55 : 0.85}
                    rx="1"
                  />
                );
              })}
            </g>
          );
        })}

        {/* time axis */}
        <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} stroke="rgba(170,185,205,0.22)" />
        {[0, 30, 60, 90, 120].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={AXIS_Y} y2={AXIS_Y + 4} stroke="rgba(170,185,205,0.22)" />
            <text x={x(t)} y={AXIS_Y + 16} textAnchor="middle" fontSize="10" fill="#6a737f" fontFamily="monospace">
              {t}s
            </text>
          </g>
        ))}
        <text x={X1} y={AXIS_Y + 30} textAnchor="end" fontSize="10" fill="#6a737f">
          {t("hero.axisNote")}
        </text>
      </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
        {[
          { k: "2.28×", v: t("hero.wallTime"), tone: "text-foreground" },
          { k: "3×", v: t("hero.budget"), tone: "text-foreground" },
          { k: String(RUN_FACTS.framesAlarmed), v: t("hero.alarmed"), tone: "text-signal" },
          { k: "4", v: t("hero.saturating"), tone: "text-alarm" },
        ].map((cell) => (
          <div key={cell.v} className="bg-surface px-3 py-2.5">
            <p className={`font-mono text-lg leading-none ${cell.tone}`}>{cell.k}</p>
            <p className="mt-1.5 text-[11px] leading-4 text-inkfaint">{cell.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="hero-section relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded border border-line px-2.5 py-1 text-xs text-inkdim">
            <span className="h-1.5 w-1.5 rounded-[1px] bg-signal" />
            {t("hero.badge")}
          </div>
          <h1 className="mt-6 max-w-2xl text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl">
            {t("hero.title1")} <span className="hero-title-accent">{t("hero.title2")}</span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-7 text-inkdim">{t("hero.subtitle")}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#results"
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-signal px-5 text-sm font-semibold text-[#14100a] transition-colors hover:bg-amber-300"
            >
              {t("hero.ctaEvents")}
            </a>
            <a
              href="#demo"
              className="inline-flex h-11 items-center justify-center rounded border border-line px-5 text-sm font-semibold text-inkdim transition-colors hover:border-inkfaint hover:text-foreground"
            >
              {t("hero.ctaDemo")}
            </a>
          </div>

          <p className="mt-10 border-t border-line pt-4 text-xs leading-6 text-inkfaint">
            YOLO11x · ByteTrack · 14 classes through one provider registry
          </p>
        </div>

        <MeasuredRun />
      </div>
    </section>
  );
}
