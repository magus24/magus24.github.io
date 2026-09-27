"use client";

import { useRef, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { Card, EventChip, EventTimeline, Pill, RiskCurve, Section } from "./charts";
import { FAILURE_CASES, SAMPLE_VIDEOS, formatDuration } from "@/lib/data";
import type { SampleVideo } from "@/lib/types";

function VideoPanel({ video }: { video: SampleVideo }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState<number | undefined>(undefined);

  const jump = (i: number) => {
    const v = ref.current;
    if (!v) return;
    setActive(i);
    v.currentTime = video.events[i]?.start ?? 0;
    void v.play();
    v.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const hasVideo = Boolean(video.file);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="font-semibold text-zinc-100">{video.title}</h3>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">
            {t("results.meta.duration")} {formatDuration(video.duration)} ·{" "}
            {t("results.meta.fps")} {video.fps} · {t("results.meta.resolution")}{" "}
            {video.resolution} · {video.lighting}
          </p>
        </div>
        <div className="flex gap-2">
          <Pill tone="green">{video.events.length} events</Pill>
          <Pill tone="slate">{video.id}</Pill>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        {/* left: video */}
        <div>
          {hasVideo ? (
            <video
              ref={ref}
              src={video.file}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-xl border border-line bg-black"
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-black/40 text-center">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M10 9.5v5l4-2.5-4-2.5z" fill="currentColor" />
              </svg>
              <p className="max-w-xs px-4 text-xs leading-5 text-zinc-500">
                {t("results.videoPending")}
              </p>
            </div>
          )}
          <p className="mt-2 font-mono text-[10px] text-zinc-600">
            {t("results.clickToJump")}
          </p>
        </div>

        {/* right: events + timeline + risk */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
              {t("results.events")}
            </h4>
            {video.events.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-3 py-2 font-mono text-xs text-zinc-500">
                {t("results.noEvents")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {video.events.map((e, i) => (
                  <EventChip
                    key={`${e.label}-${i}`}
                    label={e.label}
                    onClick={() => jump(i)}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
              {t("results.timeline")}
            </h4>
            <EventTimeline
              duration={video.duration}
              events={video.events}
              activeIndex={active}
              onSelect={jump}
            />
          </div>

          <div>
            <h4 className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
              {t("results.riskCurve")}
            </h4>
            {video.risk.length > 1 ? (
              <RiskCurve points={video.risk} />
            ) : (
              <p className="rounded-lg border border-dashed border-line px-3 py-2 font-mono text-xs text-zinc-500">
                {t("results.riskNotRun")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FailureCard({
  f,
  index,
}: {
  f: (typeof FAILURE_CASES)[number];
  index: number;
}) {
  const { t } = useLanguage();
  return (
    <Card>
      <p className="font-mono text-xs text-red-400">
        Failure case #{String(index + 1).padStart(2, "0")}
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {t("results.expected")}
          </dt>
          <dd className="mt-0.5 text-zinc-300">{f.expected}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {t("results.predicted")}
          </dt>
          <dd className="mt-0.5 text-zinc-300">{f.predicted}</dd>
        </div>
        <div className="border-t border-line pt-3">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {t("results.reason")}
          </dt>
          <dd className="mt-0.5 text-sm leading-6 text-zinc-400">{f.reason}</dd>
        </div>
      </dl>
    </Card>
  );
}

export default function Results() {
  const { t } = useLanguage();

  return (
    <Section
      id="results"
      index="05"
      kicker={t("results.kicker")}
      title={t("results.title")}
      subtitle={t("results.subtitle")}
      className="border-t border-line"
    >
      <div className="space-y-6">
        {SAMPLE_VIDEOS.map((v) => (
          <VideoPanel key={v.id} video={v} />
        ))}
      </div>

      {/* Failure cases */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold text-zinc-100">{t("results.failureTitle")}</h3>
        <p className="mt-1 text-sm text-zinc-500">{t("results.failureSub")}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {FAILURE_CASES.map((f, i) => (
            <FailureCard key={f.id} f={f} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}