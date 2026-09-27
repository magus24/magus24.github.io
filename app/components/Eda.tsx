"use client";

import { useLanguage } from "./LanguageContext";
import { Card, Section, VERDICT_COLORS, verdictOf } from "./charts";
import {
  EDA_CLASS_MATRIX,
  EDA_DECISIONS,
  EDA_RISK_PROFILES,
  EDA_RISK_SUMMARY,
  EDA_VIDEO_STATS,
  EVENT_PROVIDERS,
  RUN_PER_CLASS,
  RUN_PROVENANCE,
  RUN_TOTALS,
  SCENE,
  groupInt,
} from "@/lib/data";
import type { EventLabel } from "@/lib/types";

/**
 * Everything in this section is measured on the four organizer clips.
 *
 * The previous version of this page carried two hand-drawn schematics (a "motion
 * heatmap" and a trajectory sketch) and a lane diagram that was not the
 * calibrated geometry. Those were removed rather than relabelled: the event layer
 * receives boxes, never frames, so a real per-pixel motion field does not exist
 * to plot, and a schematic sitting next to real measurements argues instead of
 * informing. What replaces them is thinner and true — a per-class matrix, mean
 * risk per eighth of each clip, and the actual scene polygons at 3840×2160.
 */

const ALARM = 0.5;

function fmt(value: number, digits = 2): string {
  return value.toFixed(digits);
}

/* ── per-class matrix ─────────────────────────────────────────────────────── */

function MatrixCell({ segments, coverage }: { segments: number; coverage: number }) {
  if (segments === 0) {
    return (
      <div className="flex h-9 items-center justify-center rounded border border-line bg-white/[0.02] font-mono text-[11px] text-inkfaint">
        0
      </div>
    );
  }
  const intensity = Math.min(1, coverage / 100);
  return (
    <div
      className="relative flex h-9 items-center justify-center overflow-hidden rounded border font-mono text-[11px] text-zinc-100"
      style={{
        borderColor: coverage >= 25 ? "rgba(255,77,77,0.4)" : "rgba(91,217,138,0.32)",
        backgroundColor: `rgba(${coverage >= 25 ? "255,77,77" : "91,217,138"},${
          0.05 + intensity * 0.16
        })`,
      }}
      title={`${segments} segment${segments === 1 ? "" : "s"}, ${fmt(coverage, 0)}% of the clip`}
    >
      <span
        className="absolute inset-y-0 left-0"
        style={{
          width: `${Math.min(100, coverage)}%`,
          backgroundColor: `rgba(${coverage >= 25 ? "255,77,77" : "91,217,138"},0.12)`,
        }}
      />
      <span className="relative">{segments}</span>
    </div>
  );
}

function ClassMatrix() {
  const { t } = useLanguage();
  return (
    <Card className="min-w-0 lg:col-span-2">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-semibold text-zinc-100">{t("eda.classMatrix")}</h3>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-inkfaint">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px]" style={{ background: VERDICT_COLORS.saturating.bar }} />
            {t("eda.verdictSaturating")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px]" style={{ background: VERDICT_COLORS.brief.bar }} />
            {t("eda.verdictBrief")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px]" style={{ background: VERDICT_COLORS.silent.bar }} />
            {t("eda.verdictSilent")}
          </span>
        </div>
      </div>
      <p className="mb-5 text-xs leading-5 text-inkfaint">{t("eda.classMatrixNote")}</p>

      <div className="nice-scroll overflow-x-auto pb-1">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.12em] text-inkfaint">
              <th className="py-2 pr-3 font-normal">{t("eda.colClasses")}</th>
              {EDA_VIDEO_STATS.map((v) => (
                <th key={v.video} className="px-2 py-2 text-center font-normal">
                  {v.video.replace(".MP4", "")}
                </th>
              ))}
              <th className="px-2 py-2 text-right font-normal">sec</th>
              <th className="py-2 pl-3 text-right font-normal">provider</th>
            </tr>
          </thead>
          <tbody>
            {EDA_CLASS_MATRIX.map((row) => {
              const verdict = verdictOf(row.label);
              const bar = VERDICT_COLORS[verdict].bar;
              return (
                <tr key={row.label} className="border-b border-line/60 last:border-0">
                  <td className="py-1.5 pr-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-[3px] shrink-0 rounded-[1px]"
                        style={{ backgroundColor: bar }}
                      />
                      <span className="text-[13px] text-zinc-300">
                        {row.label.replace(/_/g, " ")}
                      </span>
                    </span>
                  </td>
                  {row.segments.map((segments, i) => (
                    <td key={i} className="px-1 py-1">
                      <MatrixCell segments={segments} coverage={row.coverage[i]} />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right font-mono text-[11px] text-inkfaint">
                    {row.totalSeconds > 0 ? fmt(row.totalSeconds, 1) : "—"}
                  </td>
                  <td className="py-1.5 pl-3 text-right font-mono text-[10px] text-inkfaint">
                    {EVENT_PROVIDERS[row.label]?.provider ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── risk profiles ────────────────────────────────────────────────────────── */

const DASHES = ["", "7 4", "2 4", "10 4 2 4"];

function RiskProfiles() {
  const { t } = useLanguage();
  const W = 620;
  const H = 220;
  const PAD = { l: 34, r: 74, t: 14, b: 26 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxV = 0.6;
  const x = (t: number) => PAD.l + t * innerW;
  const y = (v: number) => PAD.t + innerH - (v / maxV) * innerH;

  return (
    <Card className="min-w-0">
      <h3 className="mb-1 font-semibold text-zinc-100">{t("eda.riskProfiles")}</h3>
      <p className="mb-4 text-xs leading-5 text-inkfaint">{t("eda.riskProfilesNote")}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("eda.riskProfiles")}>
        {[0, 0.2, 0.4, 0.6].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="rgba(170,185,205,0.10)" />
            <text x={PAD.l - 7} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#6a737f" fontFamily="monospace">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text
            key={f}
            x={x(f)}
            y={H - 8}
            textAnchor="middle"
            fontSize="9"
            fill="#6a737f"
            fontFamily="monospace"
          >
            {Math.round(f * 100)}%
          </text>
        ))}

        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={y(ALARM)}
          y2={y(ALARM)}
          stroke="#ff9a2e"
          strokeWidth="1"
          strokeDasharray="5 4"
          opacity="0.8"
        />
        <text x={W - PAD.r + 5} y={y(ALARM) + 3} fontSize="9" fill="#ff9a2e" fontFamily="monospace">
          0.5
        </text>

        {EDA_RISK_PROFILES.map((profile, i) => {
          const d = profile.points
            .map((p, j) => `${j === 0 ? "M" : "L"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`)
            .join(" ");
          const last = profile.points[profile.points.length - 1];
          const mean = profile.points.reduce((a, p) => a + p.v, 0) / profile.points.length;
          return (
            <g key={profile.title}>
              <path
                d={d}
                fill="none"
                stroke="#a9c7e8"
                strokeWidth="1.5"
                strokeDasharray={DASHES[i % DASHES.length]}
                strokeLinejoin="round"
                opacity={0.35 + i * 0.16}
              />
              <circle cx={x(last.t)} cy={y(last.v)} r="2.5" fill="#a9c7e8" opacity={0.5 + i * 0.15} />
              <text
                x={W - PAD.r + 5}
                y={y(last.v) + 3}
                fontSize="9.5"
                fill="#99a3b0"
                fontFamily="monospace"
                opacity={0.55 + i * 0.14}
              >
                {profile.title.replace(".MP4", "")} {mean.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 border-t border-line pt-3 font-mono text-[11px] leading-5 text-inkfaint">
        Window means peak at {EDA_RISK_SUMMARY.meanMax.toFixed(2)} — under the line — while
        individual frames reach {EDA_RISK_SUMMARY.peakMin.toFixed(2)}–
        {EDA_RISK_SUMMARY.peakMax.toFixed(2)}: {groupInt(EDA_RISK_SUMMARY.alarmedTotal)} of{" "}
        {groupInt(EDA_RISK_SUMMARY.pointsTotal)} frames (
        {EDA_RISK_SUMMARY.alarmedShare}%) sit above 0.5. Risk here is spiky, not sustained.
      </p>
    </Card>
  );
}

/* ── calibrated scene ──────────────────────────────────────────────────────── */

function SceneMap() {
  const { t } = useLanguage();
  const poly = (
    points: readonly (readonly number[])[],
    fill: string,
    stroke: string,
    width: number,
    dash?: string,
  ) => (
    <polygon
      points={points.map(([px, py]) => `${px},${py}`).join(" ")}
      fill={fill}
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash}
    />
  );

  return (
    <Card className="min-w-0">
      <h3 className="mb-1 font-semibold text-zinc-100">{t("eda.sceneMap")}</h3>
      <p className="mb-4 text-xs leading-5 text-inkfaint">{t("eda.sceneMapNote")}</p>
      <svg
        viewBox={`0 0 ${SCENE.frame.w} ${SCENE.frame.h}`}
        className="w-full rounded border border-line bg-[#08090c]"
        role="img"
        aria-label={t("eda.sceneMap")}
      >
        {poly(SCENE.road, "rgba(169,199,232,0.045)", "rgba(169,199,232,0.35)", 6)}

        {SCENE.uTurnZones.map((zone) =>
          poly(zone, "rgba(255,154,46,0.07)", "rgba(255,154,46,0.5)", 5, "26 18"),
        )}

        {SCENE.crosswalks.map((cw) =>
          poly(cw, "rgba(91,217,138,0.10)", "rgba(91,217,138,0.55)", 5),
        )}

        {SCENE.lanes.map((lane) =>
          poly(lane.polygon, "rgba(169,199,232,0.05)", "rgba(169,199,232,0.45)", 5, "40 22"),
        )}

        {SCENE.solidLines.map((line) => poly(line, "none", "rgba(255,255,255,0.55)", 9))}
        {SCENE.stopLines.map((line) => poly(line, "none", "#ff9a2e", 11))}
        {SCENE.lightRois.map((roi) => poly(roi, "none", "#ff4d4d", 8, "18 14"))}

        {SCENE.lanes.map((lane) => {
          const xs = lane.polygon.map((p) => p[0]);
          const ys = lane.polygon.map((p) => p[1]);
          const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
          const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
          return (
            <text
              key={lane.id}
              x={cx}
              y={cy}
              textAnchor="middle"
              fontSize="76"
              fill="#a9c7e8"
              opacity="0.75"
              fontFamily="monospace"
            >
              {lane.id} · {lane.direction}°
            </text>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] text-inkfaint">
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-5 rounded" style={{ background: "rgba(169,199,232,0.6)" }} />
          {SCENE.lanes.length} lanes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-5 rounded" style={{ background: "rgba(91,217,138,0.7)" }} />
          {SCENE.crosswalks.length} crosswalks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-5 rounded" style={{ background: "#ff9a2e" }} />
          stop line
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-5 rounded" style={{ background: "rgba(255,255,255,0.6)" }} />
          solid line
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-5 rounded" style={{ background: "#ff4d4d" }} />
          signal ROI
        </span>
      </div>
    </Card>
  );
}

/* ── section ──────────────────────────────────────────────────────────────── */

export default function Eda() {
  const { t } = useLanguage();
  const saturating = (Object.keys(RUN_PER_CLASS) as EventLabel[]).filter(
    (label) => verdictOf(label) === "saturating",
  );

  return (
    <Section
      id="eda"
      index="04"
      kicker={t("eda.kicker")}
      title={t("eda.title")}
      subtitle={t("eda.subtitle")}
      className="border-t border-line"
    >
      <div className="mb-6 rounded border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-xs leading-6 text-amber-200/90">
        {t("eda.note")}
      </div>

      {/* Clip table */}
      <Card>
        <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.videoStats")}</h3>
        <div className="nice-scroll overflow-x-auto pb-1">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.12em] text-inkfaint">
                <th className="py-2.5 pr-4 font-normal">{t("eda.colVideo")}</th>
                <th className="py-2.5 pr-4 font-normal">{t("eda.colResolution")}</th>
                <th className="py-2.5 pr-4 font-normal">{t("eda.colFps")}</th>
                <th className="py-2.5 pr-4 font-normal">{t("eda.colDuration")}</th>
                <th className="py-2.5 pr-4 font-normal">{t("eda.colLight")}</th>
                <th className="py-2.5 pr-4 text-right font-normal">{t("eda.colEvents")}</th>
                <th className="py-2.5 pr-4 text-right font-normal">{t("eda.colClasses")}</th>
                <th className="py-2.5 pr-4 text-right font-normal">{t("eda.colRiskMax")}</th>
                <th className="py-2.5 pr-4 text-right font-normal">{t("eda.colRiskMean")}</th>
                <th className="py-2.5 pr-4 text-right font-normal">{t("eda.colAlarmed")}</th>
                <th className="py-2.5 pr-4 text-right font-normal">{t("eda.colPartA")}</th>
                <th className="py-2.5 text-right font-normal">{t("eda.colBudget")}</th>
              </tr>
            </thead>
            <tbody>
              {EDA_VIDEO_STATS.map((v) => (
                <tr key={v.video} className="border-b border-line/60 text-zinc-300 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-zinc-100">{v.video}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{v.resolution}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{v.fps}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{v.duration}</td>
                  <td className="py-2.5 pr-4 text-xs text-inkdim">{v.lighting}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">{v.events}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">{v.classes}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs text-signal">{v.riskMax}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">{v.riskMean}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">
                    {v.framesAlarmed}
                    <span className="text-inkfaint">/{v.riskPoints}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs">{v.partASec}s</td>
                  <td className="py-2.5 text-right font-mono text-xs">
                    {v.budgetUsed}%
                    <span className="text-inkfaint"> of {v.budgetSec}s</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2">
          {EDA_VIDEO_STATS.filter((v) => v.decodeNote).map((v) => (
            <p key={v.video} className="font-mono text-[11px] leading-5 text-alarm/90">
              {v.video}: {v.decodeNote}
            </p>
          ))}
        </div>
      </Card>

      {/* Matrix full width, then risk profiles and the calibrated scene */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ClassMatrix />
        <RiskProfiles />
        <SceneMap />
      </div>

      {/* Decisions + provenance */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.decisions")}</h3>
          <div className="space-y-4">
            {EDA_DECISIONS.map((d, i) => (
              <div key={i} className="rounded border border-line bg-surface p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ice">
                  <span className="h-1.5 w-1.5 rounded-full bg-ice" />
                  {t("eda.finding")}
                </div>
                <p className="mt-1.5 text-sm leading-6 text-zinc-300">{d.finding}</p>
                <div className="my-2.5 flex items-center gap-2 text-zinc-600">
                  <span className="h-px flex-1 bg-line" />
                  <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
                    <path
                      d="M6 0v6M6 6L2.5 3M6 6l3.5-3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ok">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  {t("eda.decision")}
                </div>
                <p className="mt-1.5 text-sm leading-6 text-zinc-300">{d.decision}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Provenance */}
        <Card className="min-w-0">
        <h3 className="mb-3 font-semibold text-zinc-100">{t("eda.provenance")}</h3>
        <dl className="grid gap-x-6 gap-y-2 font-mono text-[11px] leading-5 sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="shrink-0 text-inkfaint">detector</dt>
            <dd className="text-zinc-300">{RUN_PROVENANCE.detector}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-inkfaint">conf / iou</dt>
            <dd className="text-zinc-300">
              {RUN_PROVENANCE.conf} / {RUN_PROVENANCE.iou}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-inkfaint">device</dt>
            <dd className="text-zinc-300">{RUN_PROVENANCE.device}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-inkfaint">footage</dt>
            <dd className="text-zinc-300">{RUN_PROVENANCE.sourceClips}</dd>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <dt className="shrink-0 text-inkfaint">per-clip errors</dt>
            <dd className="text-zinc-300">
              {Object.values(RUN_PROVENANCE.perClipErrors).every((e) => e.length === 0)
                ? "none on any clip"
                : JSON.stringify(RUN_PROVENANCE.perClipErrors)}
            </dd>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <dt className="shrink-0 text-inkfaint">events</dt>
            <dd className="text-zinc-300">
              {RUN_TOTALS.events} segments · {RUN_TOTALS.classesFiring} of 14 classes fire ·{" "}
              {saturating.length} saturating ({saturating.join(", ")})
            </dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-line pt-4 text-xs leading-6 text-inkfaint">
          {RUN_PROVENANCE.caveat}
        </p>
      </Card>
      </div>
    </Section>
  );
}
