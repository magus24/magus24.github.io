"use client";

import { useLanguage } from "./LanguageContext";
import { HACKATHON } from "@/lib/data";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-line bg-[#050c17]/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-10 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex items-center justify-center gap-3 md:justify-start">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-200">
            TRAFFIC <span className="text-cyan-200">/ INTELLIGENCE</span>
          </span>
        </div>
        <p className="max-w-md text-xs leading-5 text-zinc-500">{t("footer.tagline")}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          © {new Date().getFullYear()} · {HACKATHON.name}
        </p>
      </div>
    </footer>
  );
}
