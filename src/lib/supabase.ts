// This is a placeholder for future Supabase integration as requested by the user.
// Replace with actual Supabase client initialization when moving to production.

export type MembershipTier ='free' |'pro';

export interface Profile {
 id: string;
 name: string;
 role: string;
 bio: string;
 avatar_url: string;
 membership: MembershipTier;
 interests: string[];
}

export interface Article {
 id: string;
 title: string;
 slug: string;
 content: string;
 excerpt: string;
 author_id: string;
 category: string;
 image_url: string;
 is_featured: boolean;
 is_pro_only: boolean;
 views_count: number;
 engagement_score: number;
 created_at: string;
}

export interface Tool {
 id: string;
 name: string;
 description: string;
 category: string;
 image_url: string;
 link: string;
}

export interface SiteSettings {
 id: string;
 default_language: 'en' | 'ru';
 site_title_en: string;
 site_title_ru: string;
 site_description_en: string;
 site_description_ru: string;
 og_image: string;
 analytics_id?: string;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Site Settings Initial State
const MOCK_SITE_SETTINGS: SiteSettings = {
 id: 'global-settings',
 default_language: 'en',
 site_title_en: 'rusability | Marketing Intelligence',
 site_title_ru: 'rusability | Маркетинговая разведка',
 site_description_en: 'Magazine for marketing, PR, and industry professionals. AI-powered insights and tools.',
 site_description_ru: 'Журнал для профессионалов в сфере маркетинга, PR и индустрии. Идеи и инструменты на базе ИИ.',
 og_image: '/og-image.jpg',
};

// Mock Supabase Client
export const supabase = {
 from: (table: string) => ({
 select: (_query: string ="*") => ({
 eq: (_column: string, _value: any) => ({
 single: async () => {
 if (table === 'site_settings') return { data: MOCK_SITE_SETTINGS, error: null };
 return { data: null, error: null };
},
 limit: async (_n: number) => ({ data: [], error: null}),
}),
 order: (_column: string, { ascending: _ascending}: { ascending: boolean}) => ({
 limit: async (_n: number) => ({ data: [], error: null}),
}),
}),
 insert: async (data: any) => ({ data, error: null}),
 update: async (data: any) => {
 if (table === 'site_settings') {
 Object.assign(MOCK_SITE_SETTINGS, data);
 return { data: MOCK_SITE_SETTINGS, error: null };
}
 return { data, error: null };
},
}),
};
