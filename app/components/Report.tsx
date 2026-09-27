"use client";

import { useLanguage } from "./LanguageContext";
import { Card, Section } from "./charts";

const COLS = ["built", "arch", "worked", "failed", "next"] as const;

export default function Report() {
  const { t } = useLanguage();

  return (
    <Section
      id="report"
      index="07"
      kicker={t("report.kicker")}
      title={t("report.title")}
      className="border-t border-line"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COLS.map((c) => (
          <Card key={c} className={c === "built" ? "lg:col-span-2 lg:row-span-2" : ""}>
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
              {t(`report.cols.${c}`)}
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{t(`report.${c}`)}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}