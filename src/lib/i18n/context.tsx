"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries, Locale, TranslationKeys } from "./dictionaries";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof TranslationKeys) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children, initialLocale = "en" }: { children: React.ReactNode; initialLocale?: Locale }) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  // Sync with backend / local storage if needed
  useEffect(() => {
    const saved = localStorage.getItem("rusability_lang") as Locale;
    if (saved && (saved === "en" || saved === "ru")) {
      setLocale(saved);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("rusability_lang", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: keyof TranslationKeys): string => {
    return dictionaries[locale][key] || dictionaries["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
