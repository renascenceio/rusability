import { Sparkles, TrendingUp, Globe, ArrowRight } from "lucide-react";

const NEWS_SNIPPETS = [
  {
    id: 1,
    title: "Google's New AI Algorithm Impacts Search Rankings",
    content: "A significant update to the search engine core algorithm has been rolled out, focusing on generative search experiences and expert authority. Marketers are reporting mixed results in visibility across the tech sector.",
    category: "Search Trends",
    time: "2 hours ago",
    confidence: 98.4,
    sentiment: "Neutral Impact",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4638d9985?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Privacy Sandbox Rollout Paused by UK Regulators",
    content: "In a surprising move, the CMA has requested further testing and transparency regarding the phase-out of third-party cookies, citing competition concerns in the digital advertising market.",
    category: "Regulation",
    time: "4 hours ago",
    confidence: 92.1,
    sentiment: "Negative Impact",
    image: "https://images.unsplash.com/photo-1508921334172-b1fad997384b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Content Marketing ROI Hits All-Time High in Q1",
    content: "New data shows that brands investing in high-quality editorial content are seeing a 25% increase in conversion rates compared to traditional paid social media campaigns.",
    category: "Performance",
    time: "6 hours ago",
    confidence: 88.5,
    sentiment: "Positive Impact",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
  },
];

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16">
        <div className="flex items-center gap-2 text-hig-blue font-bold text-xs uppercase tracking-widest mb-4">
          <Sparkles className="w-4 h-4" />
          <span>AI Generated Insights</span>
        </div>
        <h1 className="text-5xl font-black mb-4">Intelligence Feed</h1>
        <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">
          Real-time, professionally curated news snippets for marketing and PR professionals, powered by the Rusability AI Engine.
        </p>

        <div className="mt-10 flex gap-4">
           <button className="hig-button-primary">All News</button>
           <button className="hig-button-secondary">Trending</button>
           <button className="hig-button-secondary">Personalized</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-12">
        <div className="space-y-8">
          {NEWS_SNIPPETS.map((news) => (
            <div key={news.id} className="hig-card p-8 group">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-hig-blue">
                         <Globe className="w-4 h-4" />
                         <span className="text-xs font-bold uppercase tracking-widest">{news.category}</span>
                      </div>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-zinc-400" />
                        {news.time}
                      </span>
                    </div>
                    <div className="bg-hig-blue/5 px-2 py-1 rounded text-[10px] font-black text-hig-blue border border-hig-blue/10">
                      AI CONFIDENCE: {news.confidence}%
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">
                    {news.title}
                  </h2>

                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                    {news.content}
                  </p>

                  <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${
                      news.sentiment.includes("Positive") ? "bg-emerald-50 text-emerald-600" :
                      news.sentiment.includes("Negative") ? "bg-rose-50 text-rose-600" :
                      "bg-zinc-100 text-zinc-500"
                    }`}>
                      {news.sentiment}
                    </span>
                    <button className="flex items-center gap-2 text-sm font-bold text-hig-blue hover:gap-3 transition-all">
                      Full Analysis <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-12">
           <div className="hig-card p-8 bg-black text-white dark:bg-zinc-900 overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-5 h-5 text-hig-blue" />
                  <h3 className="text-lg font-bold tracking-tight">Trending Topics</h3>
                </div>

                <div className="space-y-8">
                  {[
                    { tag: "#GoogleSGE", mentions: "12K mentions", trend: "+45%" },
                    { tag: "#TikTokAds", mentions: "8K mentions", trend: "+12%" },
                    { tag: "#PRCrisis", mentions: "5K mentions", trend: "-2%" },
                    { tag: "#MarTech2024", mentions: "3K mentions", trend: "+80%" },
                  ].map((topic) => (
                    <div key={topic.tag} className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="font-bold text-sm tracking-tight">{topic.tag}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">{topic.mentions}</p>
                       </div>
                       <span className={`text-xs font-bold ${topic.trend.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                         {topic.trend}
                       </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-hig-blue/20 blur-[80px]" />
           </div>

           <div className="p-8 hig-card border-dashed">
              <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-zinc-500">Industry Pulse</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Rusability AI is monitoring 5,000+ sources including Twitter, LinkedIn, and TechCrunch.
              </p>
              <button className="w-full hig-button-secondary text-sm">Configure Sources</button>
           </div>
        </aside>
      </div>
    </div>
  );
}
