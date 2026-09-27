"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { translations, type Lang } from "@/lib/translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const languageListeners = new Set<() => void>();
let memoryLanguage: Lang = "en";

function readLanguage(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "uz") return saved;
  } catch {
    return memoryLanguage;
  }
  return memoryLanguage;
}

function subscribeLanguage(listener: () => void): () => void {
  languageListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function lookup(dict: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let node: unknown = dict;
  for (const part of parts) {
    if (node && typeof node === "object" && part in (node as object)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof node === "string") return node;
  // fall back to English for keys missing in the current dictionary
  node = translations.en as unknown as Record<string, unknown>;
  let fallback: unknown = translations.en;
  for (const part of parts) {
    if (fallback && typeof fallback === "object" && part in (fallback as object)) {
      fallback = (fallback as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof fallback === "string" ? fallback : key;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribeLanguage, readLanguage, (): Lang => "en");
  const setLang = useCallback((next: Lang) => {
    memoryLanguage = next;
    try {
      localStorage.setItem("lang", next);
    } catch {}
    document.documentElement.lang = next;
    languageListeners.forEach((listener) => listener());
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => lookup(translations[lang] as unknown as Record<string, unknown>, key),
    }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}