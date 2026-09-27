"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageContext";
import type { Lang } from "@/lib/translations";

const LINKS = [
  { href: "#problem", key: "nav.problem" },
  { href: "#approach", key: "nav.approach" },
  { href: "#events", key: "nav.events" },
  { href: "#eda", key: "nav.eda" },
  { href: "#results", key: "nav.results" },
  { href: "#demo", key: "nav.demo" },
  { href: "#report", key: "nav.report" },
  { href: "#team", key: "nav.team" },
] as const;

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const LangToggle = (
    <div className="flex items-center rounded-full border border-line bg-surface/80 p-0.5 font-mono text-xs">
      {(["en", "uz"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            lang === l ? "bg-cyan-300/15 text-cyan-200" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10">
            <span className="absolute h-5 w-5 rounded-full border border-cyan-200/40" />
            <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(255,196,107,.8)]" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            TRAFFIC <span className="text-cyan-200">/ INTELLIGENCE</span>
          </span>
        </a>

        <div className="hidden items-center gap-4 xl:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {t(l.key)}
            </a>
          ))}
          {LangToggle}
        </div>

        <div className="flex items-center gap-3 xl:hidden">
          {LangToggle}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-zinc-300"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-surface px-4 py-3 xl:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-surface2"
              >
                {t(l.key)}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}