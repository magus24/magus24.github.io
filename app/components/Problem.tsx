"use client";

import { useLanguage } from "./LanguageContext";
import { Section } from "./charts";

export default function Problem() {
  const { t } = useLanguage();
  const chain = [
    "chain.c1",
    "chain.c2",
    "chain.c3",
    "chain.c4",
    "chain.c5",
  ] as const;

  return (
    <Section
      id="problem"
      index="01"
      kicker={t("problem.kicker")}
      title={t("problem.title")}
      className="border-t border-line"
    >
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="space-y-5 text-sm leading-7 text-zinc-400 sm:text-base">
          <p>{t("problem.p1")}</p>
          <p>{t("problem.p2")}</p>
          <div className="flex items-center gap-3 pt-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-300/80">
            <span className="h-px w-10 bg-cyan-300/50" />
            {t("problem.tag")}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface2/70 p-4 shadow-2xl shadow-black/20 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.07)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-stretch">
            {chain.map((key, i) => {
              const isLast = i === chain.length - 1;
              return (
                <div key={key} className="flex flex-1 flex-col items-center gap-2 sm:flex-row">
                  <div
                    className={`group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition duration-300 sm:block sm:min-h-28 sm:px-4 sm:py-4 ${
                      isLast
                        ? "border-red-400/40 bg-red-400/10 text-red-200"
                        : "border-line bg-[#0a1424]/90 text-zinc-200 hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] tracking-[0.2em] ${
                        isLast ? "text-red-300/70" : "text-cyan-300/70"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span className="text-xs font-medium leading-4 sm:mt-5 sm:block sm:text-sm">
                      {t(`problem.${key}`)}
                    </span>
                    {isLast && (
                      <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-red-300 shadow-[0_0_14px_rgba(252,165,165,0.9)]" />
                    )}
                  </div>
                  {!isLast && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      className="shrink-0 rotate-90 text-cyan-300/60 sm:rotate-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 0v12m0 0L4.5 7.5M9 12l4.5-4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
          <div className="relative mt-5 flex items-center justify-between border-t border-line/80 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            <span>signal latency</span>
            <span className="text-red-300/70">reaction window →</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
