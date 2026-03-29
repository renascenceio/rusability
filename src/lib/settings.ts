import { supabase, SiteSettings } from "./supabase";
import { Locale } from "./i18n/dictionaries";

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "global-settings")
    .single();

  if (error || !data) {
    // Fallback if no settings found
    return {
      id: "global-settings",
      default_language: "en",
      site_title_en: "rusability | Marketing Intelligence",
      site_title_ru: "rusability | Маркетинговая разведка",
      site_description_en: "Magazine for marketing, PR, and industry professionals. AI-powered insights and tools.",
      site_description_ru: "Журнал для профессионалов в сфере маркетинга, PR и индустрии. Идеи и инструменты на базе ИИ.",
      og_image: "/og-image.jpg",
    };
  }

  return data as SiteSettings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  // Mock implementation for the update
  const { data, error } = await supabase
    .from("site_settings")
    .update(settings);

  if (error) throw error;
  return data;
}

export function getLocalizedSEO(settings: SiteSettings, locale: Locale) {
  return {
    title: locale === "ru" ? settings.site_title_ru : settings.site_title_en,
    description: locale === "ru" ? settings.site_description_ru : settings.site_description_en,
    ogImage: settings.og_image,
  };
}
