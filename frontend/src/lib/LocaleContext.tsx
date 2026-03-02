"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, t as translate, getDir } from "./i18n";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  isRtl: boolean;
}

const LocaleContext = createContext<LocaleCtx>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
  dir: "ltr",
  isRtl: false,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("qanuni_locale") as Locale;
    if (saved === "ar" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("qanuni_locale", l);
    document.documentElement.lang = l;
    document.documentElement.dir = getDir(l);
  };

  const dir = getDir(locale);

  return (
    <LocaleContext.Provider value={{
      locale,
      setLocale,
      t: (key: string) => translate(key, locale),
      dir,
      isRtl: locale === "ar",
    }}>
      <div dir={dir} style={{ fontFamily: locale === "ar" ? "'Noto Sans Arabic', 'Inter', system-ui, sans-serif" : "'Inter', 'Noto Sans Arabic', system-ui, sans-serif" }}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:shadow-sm ${
        locale === "ar"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-50 text-slate-600 border border-slate-200"
      } ${className}`}
      title={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      {locale === "en" ? "العربية" : "English"}
    </button>
  );
}
