import { Clock, TrendingUp, Sparkles, Filter, Newspaper, Flame, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ARTICLES, INDUSTRY_NEWS } from "@/lib/data";
import { ArticlePlugin } from "@/components/ArticlePlugin";

export default function NewsPage() {
  const mainNews = INDUSTRY_NEWS.filter(n => n.isHot);
  const regularNews = INDUSTRY_NEWS.filter(n => !n.isHot);
  const recentArticles = ARTICLES.slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
      <header className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3 text-hig-blue font-black uppercase tracking-[0.2em] text-xs">
          <Newspaper className="w-5 h-5" />
          <span>The Pulse of Marketing</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
          Industry News & Real-time Insights.
        </h1>
        <p className="text-xl text-zinc-500 font-medium leading-relaxed">
          Stay ahead of the curve with AI-generated industry briefings and professional analysis.
        </p>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr,360px] gap-16 md:gap-24">
        {/* News Feed */}
        <div className="space-y-16">
          <section className="space-y-10">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
               <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Breaking Now
               </h2>
               <div className="flex items-center gap-4">
                  <button className="text-xs font-bold text-zinc-400 flex items-center gap-2 hover:text-hig-blue transition-colors">
                     <Filter className="w-4 h-4" /> Filter By Topic
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {mainNews.map((news) => (
                  <div key={news.id} className="hig-card p-10 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800 group cursor-pointer relative overflow-hidden">
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                           <span className="bg-hig-blue/10 text-hig-blue px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{news.category}</span>
                           <span className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest"><Clock className="w-3.5 h-3.5" /> 2m ago</span>
                        </div>
                        <h3 className="text-3xl font-bold leading-tight group-hover:text-hig-blue transition-colors">{news.title}</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                           Recent developments in {news.category} are signaling a major shift for enterprise marketers. Analysts suggest immediate action.
                        </p>
                        <div className="pt-4 flex items-center gap-3">
                           <button className="hig-button-primary text-[10px] px-6 py-2.5">Full Briefing</button>
                           <button className="hig-button-secondary p-2.5 rounded-full"><Sparkles className="w-4 h-4" /></button>
                        </div>
                     </div>
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />
                  </div>
               ))}
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
               <h2 className="text-2xl font-black tracking-tight">Recent Briefings</h2>
            </div>

            <div className="space-y-8">
               {regularNews.map(news => (
                  <div key={news.id} className="flex flex-col md:flex-row gap-8 group cursor-pointer pb-8 border-b border-zinc-50 dark:border-zinc-900 last:border-0">
                     <div className="flex-1 space-y-4 pt-1">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase text-hig-blue tracking-widest">{news.category}</span>
                           <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 1h ago</span>
                        </div>
                        <h3 className="text-2xl font-bold group-hover:text-hig-blue transition-colors leading-snug">{news.title}</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">The latest industry move from {news.category} leaders is expected to impact how digital agencies structure their Q4 outreach campaigns.</p>
                     </div>
                     <div className="w-full md:w-[240px] aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative shrink-0">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20"><Zap className="w-12 h-12" /></div>
                     </div>
                  </div>
               ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Articles in News */}
        <aside className="space-y-16">
          <div className="hig-card p-8 sticky top-24 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl border-white/20">
            <div className="flex items-center gap-2 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <TrendingUp className="w-5 h-5 text-hig-blue" />
              <h3 className="font-black text-xs uppercase tracking-[0.1em] text-zinc-900 dark:text-white">Deep Dives</h3>
            </div>

            <div className="space-y-10">
               {recentArticles.map(a => (
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

            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800">
               <Link href="/" className="hig-button-primary w-full text-center block text-sm">
                  Full Magazine Feed
               </Link>
            </div>
          </div>

          <div className="hig-card p-8 bg-zinc-900 text-white space-y-6">
             <div className="flex items-center gap-2 text-hig-blue font-black text-[10px] uppercase tracking-widest">
               <Sparkles className="w-4 h-4" />
               <span>AI COPILOT</span>
             </div>
             <p className="text-sm font-bold leading-relaxed">
               I noticed 3 major news events that directly impact your interest in <strong>Search Strategy</strong>. Shall I prepare a summary?
             </p>
             <button className="hig-button-primary w-full text-[10px] bg-white text-black py-3">Prepare Summary</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
