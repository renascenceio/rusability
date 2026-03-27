export interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  time: string;
  image: string;
  featured?: boolean;
  isProAuthor?: boolean;
  views?: number;
  engagement?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  membership: 'free' | 'pro';
  interests: string[];
}

export interface IndustryTool {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  link: string;
}

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: "Google's AI Search: The Shift in SEO Strategy for 2024",
    excerpt: "With SGE rolling out globally, marketers are rethinking how they measure success beyond simple organic clicks. The focus is shifting towards 'Information Gain' and semantic relevance as Google prioritizes zero-click experiences.",
    author: "Elena Rossi",
    category: "Search Strategy",
    time: "5 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
    featured: true,
    isProAuthor: true,
    views: 12500,
    engagement: 88,
  },
  {
    id: 2,
    title: "How PR Professionals are Leveraging Generative AI for Media Outreach",
    excerpt: "Personalization is at the core of successful PR. AI is now making it possible at scale without losing the human touch. We explore how top agencies are using LLMs to craft pitches that actually get opened.",
    author: "Marc Dubois",
    category: "Public Relations",
    time: "8 min read",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "The Return of Long-Form Content in a World of Shorts",
    excerpt: "Data suggests that while short videos capture attention, long-form depth is what builds trust and authority. In 2024, the 'slow content' movement is gaining traction among B2B decision makers.",
    author: "Sarah Jenkins",
    category: "Content Strategy",
    time: "12 min read",
    image: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Privacy-First Marketing: Navigating a Cookie-less Future",
    excerpt: "The deprecation of third-party cookies is finally here. We look at the first-party data strategies that are actually working for mid-market e-commerce brands.",
    author: "David Chen",
    category: "Digital Privacy",
    time: "7 min read",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "The Psychology of Viral Marketing in the Age of Cynicism",
    excerpt: "Why do some campaigns still break through while others feel like 'adver-spam'? It comes down to emotional resonance and the 'authenticity tax'.",
    author: "Amina Kadi",
    category: "Branding",
    time: "10 min read",
    image: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=800",
  },
];

export const TRENDING = [
  "TikTok Marketing for B2B",
  "Zero-Click Searches",
  "Influencer Compliance 2024",
  "AI Attribution Models",
  "The Rise of Solopreneur Agencies"
];

export const CURRENT_USER: UserProfile = {
  id: "jane-doe",
  name: "Jane Doe",
  role: "Chief Marketing Officer at CloudScale",
  bio: "Passionate about AI-driven customer journeys and predictive analytics.",
  membership: "pro",
  interests: ["AI Marketing", "PR Strategy", "Content Growth", "SEO", "Search Engine Marketing"],
};

export const INDUSTRY_TOOLS: IndustryTool[] = [
  {
    id: 1,
    name: "AetherMetrics",
    description: "Next-gen attribution for multi-channel campaigns.",
    category: "Analytics",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
    link: "/tools/aethermetrics",
  },
  {
    id: 2,
    name: "PersonaFlow",
    description: "AI-powered customer journey mapping.",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=400",
    link: "/tools/personaflow",
  },
  {
    id: 3,
    name: "Sentience PR",
    description: "Real-time brand sentiment tracking.",
    category: "PR",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400",
    link: "/tools/sentience",
  }
];
