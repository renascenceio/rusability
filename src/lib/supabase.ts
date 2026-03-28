// This is a placeholder for future Supabase integration as requested by the user.
// Replace with actual Supabase client initialization when moving to production.

export type MembershipTier = 'free' | 'pro';

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

// Mock Supabase Client
export const supabase = {
  from: (_table: string) => ({
    select: (_query: string = "*") => ({
      eq: (_column: string, _value: string | number) => ({
        single: async () => ({ data: null, error: null }),
        limit: async (_n: number) => ({ data: [], error: null }),
      }),
      order: (_column: string, { ascending: _ascending }: { ascending: boolean }) => ({
        limit: async (_n: number) => ({ data: [], error: null }),
      }),
    }),
    insert: async (data: Record<string, unknown>) => ({ data, error: null }),
    update: async (data: Record<string, unknown>) => ({ data, error: null }),
  }),
};
