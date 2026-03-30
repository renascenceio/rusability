"use client";

import Link from"next/link";
import Image from"next/image";
import { ArrowUpRight, User, Bookmark, TrendingUp, Sparkles, ExternalLink, Flame, Users, BrainCircuit} from"lucide-react";
import { ARTICLES, TRENDING, INDUSTRY_TOOLS, POPULAR_AUTHORS, CURRENT_USER} from"@/lib/data";
import { getPersonalizedFeed, getPersonalizedNews} from"@/lib/personalization";
import { useTranslation } from "@/lib/i18n/context";

export default function Home() {
 const { t } = useTranslation();
 const featuredArticle = ARTICLES.find(a => a.featured) || ARTICLES[0];
 const otherArticles = ARTICLES.filter(a => a.id !== featuredArticle.id);

 const personalizedFeed = getPersonalizedFeed(CURRENT_USER, 4);
 const personalizedNews = getPersonalizedNews(CURRENT_USER, 5);

 // Helper to get random content for injection
 const getRandomTool = () => INDUSTRY_TOOLS[Math.floor(Math.random() * INDUSTRY_TOOLS.length)];

 return (
 <div className="max-w-7xl mx-auto px-6 py-8 md:py-16 space-y-16 md:space-y-24">
 {/* Hero Section - Featured Story */}
 <section className="relative group overflow-hidden rounded-[32px] bg-[var(--card-bg-solid)] shadow-sm text-center">
 <Link href={`/posts/${featuredArticle.id}`} className="flex flex-col min-h-[500px] md:min-h-[600px]">
 <div className="relative h-[300px] lg:h-full overflow-hidden">
 <Image
 src={featuredArticle.image}
 alt={featuredArticle.title}
 fill
 className="object-cover transition-transform duration-1000 group-hover:scale-105"
 priority
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:hidden" />
 </div>
 <div className="p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center space-y-6 md:space-y-8">
 <div className="flex items-center gap-3 text-hig-blue font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
 <Sparkles className="w-4 h-4" />
 <span>{t("home.storyOfDay")}</span>
 </div>
 <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-[1.1] tracking-tight group-hover:text-hig-blue transition-colors">
 {featuredArticle.title}
 </h1>
 <p className="text-base md:text-xl text-secondary leading-relaxed line-clamp-3 font-medium">
 {featuredArticle.excerpt}
 </p>
 <div className="flex flex-col items-center gap-6 pt-4 md:pt-8 dark:">
 <div className="flex flex-col items-center gap-4">
 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--background)] flex items-center justify-center">
 <User className="w-5 h-5 md:w-6 md:h-6 text-[var(--foreground)]" />
 </div>
 <div className="flex flex-col gap-0.5">
 <span className="font-bold text-sm md:text-base text-black dark:text-white">{featuredArticle.author}</span>
 <span className="text-xs text-black/60 dark:text-white/60 font-black tracking-widest uppercase">{featuredArticle.category} • {featuredArticle.time}</span>
 </div>
 </div>
 <div className="hidden md:flex gap-4">
 <button className="hig-button-secondary p-3 rounded-full"><Bookmark className="w-5 h-5" /></button>
 <button className="hig-button-primary p-3 rounded-full"><ArrowUpRight className="w-5 h-5" /></button>
 </div>
 </div>
 </div>
 </Link>
 </section>

 {/* Popular Authors Section */}
 <section className="space-y-8">
 <div className="flex items-center gap-3 pb-4">
 <Users className="w-5 h-5 text-hig-blue" />
 <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">{t("home.voicesToFollow")}</h2>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {POPULAR_AUTHORS.map((author) => (
 <Link key={author.id} href={`/profile/${author.id}`} className="hig-card p-6 flex items-center gap-6 group">
 <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md ring-1 ring-transparent transition-all">
 <Image src={author.avatar} alt={author.name} fill className="object-cover" />
 </div>
 <div className="flex flex-col gap-1 items-center">
 <h4 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{author.name}</h4>
 <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-hig-blue">{author.role}</p>
 <p className="text-[10px] font-bold uppercase tracking-tighter text-tertiary mt-2">{author.articlesCount} {t("home.articlesCount")}</p>
 </div>
 </Link>
 ))}
 </div>
 </section>

 <div className="flex flex-col gap-16 md:gap-24">
 {/* Main Feed */}
 <div className="space-y-16 md:space-y-24">
 <section className="space-y-10 md:space-y-16">
 <div className="flex items-center justify-between pb-6">
 <div className="space-y-1">
 <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)] italic">{t("home.humanStories")}</h2>
 <p className="text-xs text-secondary font-bold uppercase tracking-widest">{t("home.perspective")}</p>
 </div>
 <Link href="/news" className="text-xs font-bold text-hig-blue uppercase tracking-[0.2em] hover:underline">{t("home.exploreMore")}</Link>
 </div>

 {/* 2/3 and 1/3 Content Grid - Matched Height Refinement */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-stretch">
 {/* 2/3 Width Article */}
 <Link href={`/posts/${otherArticles[0].id}`} className="md:col-span-2 group flex flex-col space-y-6 text-center items-center">
 <div className="relative w-full aspect-video rounded-[32px] overflow-hidden">
 <Image src={otherArticles[0].image} alt={otherArticles[0].title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
 </div>
 <div className="space-y-4 flex flex-col items-center">
 <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-hig-blue">
 <span>{otherArticles[0].category}</span>
 <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
 <span className="text-secondary">{otherArticles[0].time}</span>
 </div>
 <h3 className="text-3xl md:text-4xl font-bold leading-tight group-hover:text-hig-blue transition-colors text-[var(--foreground)]">
 {otherArticles[0].title}
 </h3>
 <p className="text-secondary leading-relaxed font-medium line-clamp-2">
 {otherArticles[0].excerpt}
 </p>
 </div>
 </Link>

 {/* 1/3 Width Article - Now matched height with 2/3 visually */}
 <Link href={`/posts/${otherArticles[1].id}`} className="md:col-span-1 group flex flex-col space-y-6 text-center items-center">
 <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden">
 <Image src={otherArticles[1].image} alt={otherArticles[1].title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
 </div>
 <div className="space-y-4 flex flex-col items-center">
 <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-hig-blue">
 <span>{otherArticles[1].category}</span>
 </div>
 <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-hig-blue transition-colors text-[var(--foreground)]">
 {otherArticles[1].title}
 </h3>
 <p className="text-sm text-secondary font-medium line-clamp-2 leading-relaxed">
 {otherArticles[1].excerpt}
 </p>
 </div>
 </Link>
 </div>

 {/* Secondary Grid - Continuous Content */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
 {/* Injection Tool Card - Refined White Version */}
 {(() => {
 const tool = getRandomTool();
 return (
 <div className="bg-[var(--card-bg-solid)] dark:bg-[var(--secondary-system-grouped-background)] rounded-[32px] p-8 text-[var(--foreground)] flex flex-col justify-between group cursor-pointer relative overflow-hidden h-full min-h-[340px] shadow-sm hover:shadow-md transition-shadow">
 <div className="relative z-10 space-y-6">
 <div className="bg-hig-blue/10 text-hig-blue w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{t("home.featuredTool")}</div>
 <h4 className="text-2xl font-bold leading-tight group-hover:text-hig-blue transition-colors">{tool.name}</h4>
 <p className="text-secondary text-sm font-medium leading-relaxed">{tool.description}</p>
 <Link href={tool.link} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-hig-blue text-white px-6 py-3 rounded-full hover:brightness-110 transition-all shadow-sm">
 {t("home.tryNow")} <ExternalLink className="w-4 h-4" />
 </Link>
 </div>
 </div>
 );
})()}

 {/* Remaining Articles in the expanded list */}
 {otherArticles.slice(2).map((article) => (
 <Link key={article.id} href={`/posts/${article.id}`} className="group flex flex-col space-y-6 h-full text-center items-center relative z-10">
 <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shrink-0">
 <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
 </div>
 <div className="space-y-3 flex-1 flex flex-col items-center">
 <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-hig-blue">
 <span>{article.category}</span>
 <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
 <span className="text-secondary">{article.time}</span>
 </div>
 <h3 className="text-xl font-bold leading-tight group-hover:text-hig-blue transition-colors line-clamp-2 text-[var(--foreground)]">{article.title}</h3>
 <p className="text-sm text-secondary font-medium line-clamp-2 leading-relaxed">{article.excerpt}</p>
 </div>
 </Link>
 ))}
 </div>
 </section>

 {/* Emotional Intelligence / Vision Section */}
 <section className="bg-[var(--card-bg-solid)] dark:bg-[var(--secondary-system-grouped-background)] rounded-[40px] p-8 md:p-16 text-[var(--foreground)] overflow-hidden relative shadow-sm">
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-10 text-hig-blue font-bold uppercase tracking-[0.2em] text-[10px]">
 <Sparkles className="w-4 h-4" />
 <span>{t("home.emotionalIntelligence")}</span>
 </div>
 <h2 className="text-3xl md:text-5xl font-bold mb-12 tracking-tight leading-tight text-[var(--foreground)]">{t("home.futureMarketing")}</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
 {INDUSTRY_TOOLS.map((tool) => (
 <Link key={tool.id} href={tool.link} className="hig-card p-6 space-y-6 block group">
 <div className="relative w-full aspect-square rounded-[20px] overflow-hidden">
 <Image src={tool.image} alt={tool.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
 </div>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-[var(--foreground)]">
 <h4 className="font-bold text-lg">{tool.name}</h4>
 <ExternalLink className="w-4 h-4 text-tertiary group-hover:text-hig-blue transition-colors" />
 </div>
 <p className="text-xs text-secondary font-medium leading-relaxed">{tool.description}</p>
 </div>
 <div className="pt-2">
 <span className="text-[10px] font-bold uppercase tracking-widest bg-hig-blue text-white px-3 py-1.5 rounded-full">{tool.category}</span>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 </div>

 {/* Personalized AI Section */}
 <section className="space-y-10">
 <div className="flex items-center justify-between pb-6">
 <div className="flex items-center gap-3">
 <BrainCircuit className="w-6 h-6 text-hig-blue" />
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{t("home.recommended")}</h2>
 <p className="text-[10px] text-hig-blue font-bold uppercase tracking-widest">{t("home.personalizedAI")}</p>
 </div>
 </div>
 <Link href="/profile" className="text-xs font-bold text-hig-blue uppercase tracking-wider hover:underline">{t("home.adjustInterests")}</Link>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {personalizedFeed.map((article) => (
 <Link key={article.id} href={`/posts/${article.id}`} className="group flex flex-col space-y-4 text-center items-center">
 <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden">
 <Image src={article.image} alt={article.title} fill className="object-cover transition-transform group-hover:scale-105" />
 <div className="absolute top-2 right-2">
 <div className="bg-[var(--card-bg)] backdrop-blur px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
 <Sparkles className="w-2 h-2 text-amber-500" />
 94% {t("home.match")}
 </div>
 </div>
 </div>
 <div className="space-y-2 flex flex-col items-center">
 <h3 className="text-sm font-bold leading-tight group-hover:text-hig-blue transition-colors line-clamp-2 uppercase tracking-tight text-[var(--foreground)]">{article.title}</h3>
 <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-tertiary">
 <span>{article.category}</span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </section>

 {/* Industry Pulse & Trending - Side by Side */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
 {/* Industry Pulse News */}
 <div className="hig-card p-8 bg-[var(--card-bg-solid)] dark:bg-[var(--secondary-system-grouped-background)] shadow-sm relative z-10">
 <div className="flex items-center gap-2 mb-8 pb-4">
 <Flame className="w-5 h-5 text-orange-600" />
 <h3 className="font-bold text-xl text-[var(--foreground)] uppercase tracking-tight">{t("home.pulseNews")}</h3>
 </div>
 <div className="space-y-6">
 {personalizedNews.map((item) => (
 <div key={item.id} className="group cursor-pointer space-y-2 pb-4 last:">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-[9px] font-bold uppercase tracking-wider text-hig-blue">{item.category}</span>
 {CURRENT_USER.interests.some(i => item.category.toLowerCase().includes(i.toLowerCase())) && (
 <span className="text-[8px] font-bold uppercase text-amber-500 flex items-center gap-0.5"><Sparkles className="w-2 h-2" /> {t("home.topInterest")}</span>
 )}
 </div>
 {item.isHot && <span className="bg-rose-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1"><Flame className="w-2 h-2" /> HOT</span>}
 </div>
 <h4 className="text-sm font-bold leading-snug text-[var(--foreground)] group-hover:text-hig-blue transition-colors">{item.title}</h4>
 </div>
 ))}
 </div>
 </div>

 <div className="hig-card p-8 bg-[var(--card-bg-solid)] dark:bg-[var(--secondary-system-grouped-background)] shadow-sm">
 <div className="flex items-center gap-2 mb-8 pb-4">
 <TrendingUp className="w-5 h-5 text-hig-blue font-bold" />
 <h3 className="font-bold text-xl text-[var(--foreground)] uppercase tracking-tight">{t("home.trendingVibe")}</h3>
 </div>

 <div className="space-y-8">
 {TRENDING.map((tag, i) => (
 <Link key={tag} href={`/news?q=${tag}`} className="flex gap-6 group">
 <span className="text-4xl font-bold text-tertiary group-hover:text-hig-blue transition-colors shrink-0">0{i+1}</span>
 <div className="space-y-2 pt-1">
 <h4 className="font-bold text-sm leading-snug text-[var(--foreground)] group-hover:text-hig-blue transition-colors line-clamp-3 uppercase tracking-tight">
 {tag}
 </h4>
 <p className="text-[8px] text-tertiary uppercase font-bold tracking-[0.2em] flex items-center gap-1.5">
 <span className="w-2 h-2 rounded-full bg-emerald-600" />
 <span className="font-bold">{t("home.liveInsight")}</span>
 </p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </div>

 {/* Full Width Personalization - Refined White Version */}
 <div className="rounded-[48px] p-12 bg-[var(--card-bg-solid)] dark:bg-[var(--secondary-system-grouped-background)] text-[var(--foreground)] overflow-hidden relative shadow-sm">
 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
 <div className="space-y-6">
 <div className="flex items-center gap-2 text-hig-blue font-bold text-[10px] uppercase tracking-[0.2em]">
 <BrainCircuit className="w-5 h-5" />
 <span>{t("home.tailoredForYou")}</span>
 </div>
 <h2 className="text-3xl md:text-6xl font-bold leading-none tracking-tighter">{t("home.intelligenceEngine")}</h2>
 <p className="text-xl font-medium text-secondary max-w-xl leading-relaxed">
 {t("home.personalizationNote")}
 </p>
 </div>
 <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-hig-blue text-white px-10 py-5 rounded-full hover:brightness-110 transition-all shadow-sm shrink-0">
 {t("home.customizeFeed")} <ArrowUpRight className="w-5 h-5" />
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
