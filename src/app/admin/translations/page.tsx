"use client";

import { useState } from "react";
import { dictionaries, Locale, TranslationKeys } from "@/lib/i18n/dictionaries";
import { Languages, Search, Sparkles, Wand2, Save, ArrowRight } from "lucide-react";

export default function TranslationsPage() {
  const [activeLocale, setActiveLocale] = useState<Locale>("ru");
  const [searchQuery, setSearchQuery] = useState("");
  const [localDict, setLocalDict] = useState(dictionaries);

  const keys = Object.keys(dictionaries.en) as (keyof TranslationKeys)[];
  const filteredKeys = keys.filter(k =>
    k.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dictionaries.en[k].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdate = (key: keyof TranslationKeys, value: string) => {
    setLocalDict(prev => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
            <Languages className="w-4 h-4" />
            Translation Engine
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">Dictionaries.</h1>
          <p className="text-secondary font-medium max-w-xl">Manage all UI strings across supported languages. Use AI to suggest translations for industry-specific terminology.</p>
        </div>

        <div className="flex bg-[var(--muted)] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveLocale("en")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${ activeLocale === "en" ?"bg-[var(--card-bg-solid)] text-hig-blue shadow-lg" :"text-secondary"}`}
          >
            English
          </button>
          <button
            onClick={() => setActiveLocale("ru")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${ activeLocale === "ru" ?"bg-[var(--card-bg-solid)] text-hig-blue shadow-lg" :"text-secondary"}`}
          >
            Russian
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keys or English text..."
            className="w-full bg-[var(--muted)] rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20"
          />
        </div>
        <div className="flex gap-4">
          <button className="hig-button-secondary py-4 px-8 flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            AI Auto-Translate Empty
          </button>
          <button className="hig-button-primary py-4 px-10 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Commit Changes
          </button>
        </div>
      </div>

      <div className="hig-card overflow-hidden">
        <div className="grid grid-cols-[1fr,1.5fr] bg-[var(--muted)] text-[10px] font-black uppercase tracking-widest text-secondary p-6">
          <div>Source (English)</div>
          <div className="flex items-center gap-2">
            Target ({activeLocale === 'ru' ? 'Russian' : 'English'})
            <Sparkles className="w-3 h-3 text-amber-500" />
          </div>
        </div>
        <div className="divide-y divide-[var(--foreground)]/5 max-h-[600px] overflow-y-auto no-scrollbar">
          {filteredKeys.map((key) => (
            <div key={key} className="grid grid-cols-[1fr,1.5fr] p-6 group hover:bg-hig-blue/[0.02] transition-colors">
              <div className="pr-10 space-y-2">
                <span className="text-[10px] font-bold text-hig-blue/60 block">{key}</span>
                <p className="font-bold text-[var(--foreground)]">{dictionaries.en[key]}</p>
              </div>
              <div className="relative">
                <textarea
                  value={localDict[activeLocale][key]}
                  onChange={(e) => handleUpdate(key, e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-[var(--foreground)] resize-none p-0 focus:ring-0"
                  rows={2}
                />
                <button
                  className="absolute right-0 bottom-0 p-2 text-tertiary opacity-0 group-hover:opacity-100 hover:text-hig-blue transition-all"
                  title="Translate with AI"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-hig-blue/5 p-8 rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-hig-blue flex items-center justify-center text-white">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-[var(--foreground)]">Industry Glossary Sync</h4>
            <p className="text-sm text-secondary font-medium">Synchronize translation memory with latest marketing and PR terminology.</p>
          </div>
        </div>
        <button className="hig-button-primary px-8 flex items-center gap-2">
          Start Sync <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
