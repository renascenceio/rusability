"use client";

import { Clock, TrendingUp, Sparkles, Filter, Newspaper, Flame, Zap, BrainCircuit} from"lucide-react";
import Link from"next/link";
import { CURRENT_USER} from"@/lib/data";
import { ArticlePlugin} from"@/components/ArticlePlugin";
import { getPersonalizedNews, getPersonalizedFeed} from"@/lib/personalization";
import { useTranslation } from "@/lib/i18n/context";

export default function NewsPage() {
 const { t } = useTranslation();
 const personalizedNews = getPersonalizedNews(CURRENT_USER, 10);
 const mainNews = personalizedNews.filter(n => n.isHot).slice(0, 2);
 const regularNews = personalizedNews.filter(n => !n.isHot || !mainNews.find(m => m.id === n.id));
 const recommendedArticles = getPersonalizedFeed(CURRENT_USER, 2);

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
 <header className="space-y-6 max-w-3xl">
 <div className="flex items-center gap-3 text-hig-blue font-bold uppercase tracking-[0.2em] text-xs">
 <Newspaper className="w-5 h-5" />
 <span>{t("news.pulse")}</span>
 </div>
 <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-tight text-[var(--foreground)]">
 {t("news.title")}
 </h1>
 <p className="text-xl text-secondary font-medium leading-relaxed">
 {t("news.subtitle")}
 </p>
 </header>

 <div className="flex flex-col lg:grid lg:grid-cols-[1fr,360px] gap-16 md:gap-24">
 {/* News Feed */}
 <div className="space-y-16">
 <section className="space-y-10">
 <div className="flex items-center justify-between pb-6">
 <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-[var(--foreground)]">
 <Flame className="w-6 h-6 text-orange-500" />
 {t("news.breaking")}
 </h2>
 <div className="flex items-center gap-4">
 <button className="text-xs font-bold text-secondary flex items-center gap-2 hover:text-hig-blue transition-colors">
 <Filter className="w-4 h-4" /> {t("news.filter")}
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {mainNews.map((news) => (
 <div key={news.id} className="hig-card p-10 group cursor-pointer relative overflow-hidden">
 <div className="relative z-10 space-y-6">
 <div className="flex items-center justify-between">
 <span className="bg-hig-blue/10 text-hig-blue px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{news.category}</span>
 <span className="flex items-center gap-2 text-tertiary text-[10px] font-bold uppercase tracking-widest"><Clock className="w-3.5 h-3.5" /> 2m {t("news.timeAgo")}</span>
 </div>
 <h3 className="text-3xl font-bold leading-tight group-hover:text-hig-blue transition-colors text-[var(--foreground)]">{news.title}</h3>
 <p className="text-secondary text-sm leading-relaxed font-medium">
 {t("news.recentDevelopments")}
 </p>
 <div className="pt-4 flex items-center gap-3">
 <button className="hig-button-primary text-[10px] px-6 py-2.5">{t("news.briefing")}</button>
 <button className="hig-button-secondary p-2.5 rounded-full"><Sparkles className="w-4 h-4" /></button>
 </div>
 </div>
 <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />
 </div>
 ))}
 </div>
 </section>

 <section className="space-y-10">
 <div className="flex items-center justify-between pb-6">
 <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{t("news.recentBriefings")}</h2>
 </div>

 <div className="space-y-8">
 {regularNews.map(news => (
 <div key={news.id} className="flex flex-col md:flex-row gap-8 group cursor-pointer pb-8 last:">
 <div className="flex-1 space-y-4 pt-1">
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-bold uppercase text-hig-blue tracking-widest">{news.category}</span>
 <span className="text-[10px] text-tertiary font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 1h {t("news.timeAgo")}</span>
 </div>
 <h3 className="text-2xl font-bold group-hover:text-hig-blue transition-colors leading-snug text-[var(--foreground)]">{news.title}</h3>
 <p className="text-secondary text-sm leading-relaxed line-clamp-2 font-medium">The latest industry move from {news.category} leaders is expected to impact how digital agencies structure their Q4 outreach campaigns.</p>
 </div>
 <div className="w-full md:w-[240px] aspect-[16/9] rounded-2xl overflow-hidden bg-[var(--muted)] relative shrink-0">
 <div className="absolute inset-0 flex items-center justify-center text-tertiary/20"><Zap className="w-12 h-12" /></div>
 </div>
 </div>
 ))}
 </div>
 </section>
 </div>

 {/* Sidebar: Articles in News */}
 <aside className="space-y-16">
 <div className="hig-card p-8 sticky top-24">
 <div className="flex items-center gap-2 mb-8 pb-4">
 <TrendingUp className="w-5 h-5 text-hig-blue" />
 <h3 className="font-bold text-xs uppercase tracking-[0.1em] text-secondary">{t("news.deepDives")}</h3>
 </div>

 <div className="space-y-10">
 {recommendedArticles.map(a => (
 <ArticlePlugin
 key={a.id}
 type="article"
 layout="vertical"
 data={{
 id: a.id,
 title: a.title,
 description: a.excerpt,
 image: a.image,
 category: a.category
}}
 />
 ))}
 </div>

 <div className="mt-10 pt-8">
 <Link href="/" className="hig-button-primary w-full text-center block text-sm">
 {t("news.fullFeed")}
 </Link>
 </div>
 </div>

 <div className="hig-card p-8 bg-hig-blue text-white space-y-6 relative overflow-hidden shadow-lg shadow-hig-blue/20">
 <div className="relative z-10 space-y-4">
 <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest">
 <BrainCircuit className="w-4 h-4" />
 <span>{t("news.aiCopilot")}</span>
 </div>
 <p className="text-sm font-bold leading-relaxed">
 {t("news.aiMessage")}
 </p>
 <button className="w-full text-[10px] font-bold uppercase tracking-widest bg-white text-hig-blue py-3 rounded-full hover:brightness-110 transition-all">{t("news.prepareSummary")}</button>
 </div>
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-16" />
 </div>
 </aside>
 </div>
 </div>
 );
}
