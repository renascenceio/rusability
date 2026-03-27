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

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  articlesCount: number;
  isPopular?: boolean;
}

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  isHot?: boolean;
}

export const POPULAR_AUTHORS: Author[] = [
  {
    id: "elena-rossi",
    name: "Elena Rossi",
    role: "Chief Content Strategist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    articlesCount: 42,
    isPopular: true
  },
  {
    id: "marc-dubois",
    name: "Marc Dubois",
    role: "Digital PR Specialist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    articlesCount: 28,
    isPopular: true
  },
  {
    id: "amina-kadi",
    name: "Amina Kadi",
    role: "Brand Psychologist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    articlesCount: 15,
    isPopular: true
  }
];

export const INDUSTRY_NEWS: NewsItem[] = [
  { id: 1, title: "OpenAI announces GPT-5 release date", category: "AI", isHot: true },
  { id: 2, title: "Google rolls out new core update for Search", category: "SEO", isHot: true },
  { id: 3, title: "Apple expands privacy tracking on iOS 18", category: "Privacy" },
  { id: 4, title: "Meta launches new VR workspace for professionals", category: "AR/VR" },
  { id: 5, title: "LinkedIn introduces AI-powered job matching", category: "Social Media", isHot: true }
];

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
  {
    id: 6,
    title: "TikTok for B2B: Is the Industrial Complex Ready for Fun?",
    excerpt: "How manufacturing and logistics companies are finding massive ROI in short-form video by embracing 'Industrial ASMR' and behind-the-scenes transparency.",
    author: "Elena Rossi",
    category: "Social Strategy",
    time: "6 min read",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 7,
    title: "The Ethics of AI Influencers: Who Owns the Digital Soul?",
    excerpt: "As virtual influencers gain millions of followers, we examine the legal and moral implications of non-human brand ambassadors in luxury marketing.",
    author: "Marc Dubois",
    category: "Digital Ethics",
    time: "9 min read",
    image: "https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 8,
    title: "Email Marketing's Second Renaissance",
    excerpt: "Why the newsletter is replacing the social feed as the primary source of high-intent leads for PR and SaaS professionals.",
    author: "Sarah Jenkins",
    category: "Content Strategy",
    time: "7 min read",
    image: "https://images.unsplash.com/photo-1563986768494-0dee2763ff3f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 9,
    title: "Zero-Click Search and the End of Web Traffic as We Know It",
    excerpt: "How to survive when Google answers the query without the user ever clicking through to your site. A new playbook for the AI era.",
    author: "Elena Rossi",
    category: "Search Strategy",
    time: "11 min read",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 10,
    title: "The Rise of Niche Communities in a Fragmented Social Landscape",
    excerpt: "Why marketing professionals are abandoning X and Facebook for gated communities like Discord and specialized Slack channels.",
    author: "Amina Kadi",
    category: "Community Management",
    time: "8 min read",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
  }
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
