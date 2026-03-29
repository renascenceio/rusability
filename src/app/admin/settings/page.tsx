"use client";

import { useState, useEffect } from "react";
import { Globe, Shield, Save, RotateCcw, AlertCircle } from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { SiteSettings } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/context";

export default function AdminSettingsPage() {
  const { setLocale } = useTranslation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      setLocale(settings.default_language);
      setMessage({ type: "success", text: "Settings updated successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to update settings:", error);
      setMessage({ type: "error", text: "Failed to update settings." });
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return <div className="p-20 text-center font-bold">Loading Engine...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
          <Shield className="w-4 h-4" />
          System Configuration
        </div>
        <h1 className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">Global Settings.</h1>
      </header>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
          <AlertCircle className="w-5 h-5" />
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <section className="hig-card p-10 space-y-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-hig-blue" />
            <h2 className="text-2xl font-bold italic">Language & SEO</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Default Language</label>
              <select
                id="site_language"
                value={settings.default_language}
                onChange={(event) => setSettings({...settings, default_language: event.target.value as 'en' | 'ru'})}
                className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20"
              >
                <option value="en">English (Global)</option>
                <option value="ru">Russian (Русский)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary">OG Image URL</label>
              <input
                type="text"
                value={settings.og_image}
                onChange={(e) => setSettings({...settings, og_image: e.target.value})}
                className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
            <div className="space-y-6">
              <h3 className="font-bold text-sm text-hig-blue uppercase tracking-widest">English Metadata</h3>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Site Title</label>
                <input
                  type="text"
                  value={settings.site_title_en}
                  onChange={(e) => setSettings({...settings, site_title_en: e.target.value})}
                  className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Description</label>
                <textarea
                  rows={4}
                  value={settings.site_description_en}
                  onChange={(e) => setSettings({...settings, site_description_en: e.target.value})}
                  className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20 resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-sm text-hig-blue uppercase tracking-widest">Russian Metadata</h3>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Название сайта</label>
                <input
                  type="text"
                  value={settings.site_title_ru}
                  onChange={(e) => setSettings({...settings, site_title_ru: e.target.value})}
                  className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Описание</label>
                <textarea
                  rows={4}
                  value={settings.site_description_ru}
                  onChange={(e) => setSettings({...settings, site_description_ru: e.target.value})}
                  className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20 resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 hig-button-primary py-5 flex items-center justify-center gap-3"
          >
            {isSaving ? "..." : <><Save className="w-5 h-5" /> Save Global Configuration</>}
          </button>
          <button
            onClick={() => getSiteSettings().then(setSettings)}
            className="px-10 bg-[var(--muted)] rounded-[24px] font-bold text-secondary hover:text-hig-blue transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
