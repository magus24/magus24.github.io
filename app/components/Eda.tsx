"use client";

import { useLanguage } from "./LanguageContext";
import { Card, CountBars, DensityArea, Section } from "./charts";
import {
  EDA_DECISIONS,
  EDA_DENSITY,
  EDA_LANES,
  EDA_OBJECT_COUNTS,
  EDA_VIDEO_STATS,
} from "@/lib/data";

/**
 * SCHEMATIC, not measured. A hand-drawn illustration of what the pipeline
 * looks for, labelled as such in the UI вЂ” we have no per-pixel motion field
 * (the event layer receives boxes, not frames), so a "real" heatmap would be
 * a fabrication.
 */
function MotionHeatmap() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-[#0b1020]">
      <svg viewBox="0 0 400 225" className="h-full w-full">
        <defs>
          <filter id="hmBlur">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <rect width="400" height="225" fill="#0b1020" />
        {/* road */}
        <path d="M0 120 L400 60 L400 110 L0 165 Z" fill="#12182a" />
        {/* heat blobs */}
        <g filter="url(#hmBlur)" fill="#22d3ee">
          <ellipse cx="120" cy="140" rx="34" ry="16" opacity="0.55" />
          <ellipse cx="210" cy="128" rx="42" ry="18" opacity="0.75" />
          <ellipse cx="300" cy="112" rx="30" ry="14" opacity="0.5" />
          <ellipse cx="260" cy="96" rx="26" ry="12" opacity="0.65" fill="#f59e0b" />
          <ellipse cx="70" cy="150" rx="24" ry="12" opacity="0.45" />
        </g>
      </svg>
      <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
        schematic
      </span>
    </div>
  );
}

/** SCHEMATIC, not measured вЂ” see MotionHeatmap. */
function Trajectories() {
  const paths = [
    "M120 160 C 180 150, 220 130, 320 104",
    "M40 140 C 100 132, 150 118, 250 88",
    "M240 96 C 180 112, 120 128, 30 140",
  ];
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-[#0b1020]">
      <svg viewBox="0 0 400 225" className="h-full w-full">
        <rect width="400" height="225" fill="#0b1020" />
        <path d="M0 120 L400 60 L400 110 L0 165 Z" fill="#12182a" />
        {paths.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke={i === 2 ? "#f59e0b" : "#34d399"} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <circle cx={paths[i].split(" ").pop()!.replace("C", "").split(",")[0]} cy={paths[i].slice(-1)[0] || 0} r="0" />
          </g>
        ))}
        <g fontFamily="monospace" fontSize="10">
          <text x="300" y="96" fill="#34d399">V#12</text>
          <text x="52" y="136" fill="#34d399">V#19</text>
          <text x="44" y="112" fill="#f59e0b">V#25 в†’</text>
        </g>
      </svg>
      <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
        schematic
      </span>
    </div>
  );
}

export default function Eda() {
  const { t } = useLanguage();

  return (
    <Section
      id="eda"
      kicker={t("eda.kicker")}
      title={t("eda.title")}
      subtitle={t("eda.subtitle")}
      className="border-t border-line"
    >
      <div className="mb-6 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 font-mono text-xs text-amber-300/90">
        {t("eda.note")}
      </div>

      {/* Video stats */}
      <Card>
        <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.videoStats")}</h3>
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-xs uppercase tracking-wider text-zinc-500">
                <th className="py-2.5 pr-4">Video</th>
                <th className="py-2.5 pr-4">Resolution</th>
                <th className="py-2.5 pr-4">FPS</th>
                <th className="py-2.5 pr-4">Duration</th>
                <th className="py-2.5">Lighting</th>
              </tr>
            </thead>
            <tbody>
              {EDA_VIDEO_STATS.map((v) => (
                <tr key={v.video} className="border-b border-line/70 text-zinc-300">
                  <td className="py-2.5 pr-4 font-medium text-zinc-100">{v.video}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{v.resolution}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{v.fps}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{v.duration}</td>
                  <td className="py-2.5">{v.lighting}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charts grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.objectStats")}</h3>
          <CountBars series={EDA_OBJECT_COUNTS} />
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.density")}</h3>
          <DensityArea data={EDA_DENSITY} />
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.heatmap")}</h3>
          <MotionHeatmap />
          <p className="mt-2 font-mono text-[10px] text-zinc-500">{t("eda.schematic")}</p>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.trajectories")}</h3>
          <Trajectories />
          <p className="mt-2 font-mono text-[10px] text-zinc-500">{t("eda.schematic")}</p>
        </Card>
      </div>

      {/* Lane directions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.lanes")}</h3>
          <div className="relative h-40 overflow-hidden rounded-xl border border-line bg-[#0b1020]">
            <svg viewBox="0 0 400 160" className="h-full w-full">
              <path d="M0 30 L400 30 L400 130 L0 130 Z" fill="#10162a" />
              {EDA_LANES.map((lane, i) => (
                <g key={lane.lane} fontFamily="monospace" fontSize="11">
                  <line
                    x1={0}
                    x2={400}
                    y1={44 + i * 25}
                    y2={44 + i * 25}
                    stroke="#2a3549"
                    strokeWidth="1"
                  />
                  <text x="16" y={48 + i * 25} fill="#94a3b8">{lane.lane}</text>
                  <text x="210" y={48 + i * 25} fill="#34d399">
                    {lane.direction} {lane.direction} {lane.direction}
                  </text>
                </g>
              ))}
            </svg>
            <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
              {t("eda.lanesSource")}
            </span>
          </div>
        </Card>

        {/* EDA в†’ decisions */}
        <div>
          <h3 className="mb-4 font-semibold text-zinc-100">{t("eda.decisions")}</h3>
          <div className="space-y-4">
            {EDA_DECISIONS.map((d, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {t("eda.finding")}
                </div>
                <p className="mt-1.5 text-sm text-zinc-300">{d.finding}</p>
                <div className="my-2.5 flex items-center gap-2 text-zinc-600">
                  <span className="h-px flex-1 bg-line" />
                  <svg width="12" height="10" viewBox="0 0 12 10"><path d="M6 0v6M6 6L2.5 3M6 6l3.5-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" /></svg>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("eda.decision")}
                </div>
                <p className="mt-1.5 text-sm text-zinc-300">{d.decision}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}