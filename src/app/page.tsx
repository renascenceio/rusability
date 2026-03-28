import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, User, Bookmark, TrendingUp, Sparkles, ExternalLink, Flame, Users } from "lucide-react";
import { ARTICLES, TRENDING, INDUSTRY_TOOLS, POPULAR_AUTHORS, INDUSTRY_NEWS } from "@/lib/data";

export default function Home() {
  const featuredArticle = ARTICLES.find(a => a.featured) || ARTICLES[0];
  const otherArticles = ARTICLES.filter(a => a.id !== featuredArticle.id);

  // Helper to get random content for injection
  const getRandomTool = () => INDUSTRY_TOOLS[Math.floor(Math.random() * INDUSTRY_TOOLS.length)];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 md:py-16 space-y-16 md:space-y-24">
      {/* Hero Section - Featured Story */}
      <section className="relative group overflow-hidden rounded-[32px] md:rounded-[48px] border border-[var(--border)] dark:border-[var(--border)] bg-white dark:bg-black shadow-sm">
        <Link href={`/posts/${featuredArticle.id}`} className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
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
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-6 md:space-y-8">
            <div className="flex items-center gap-3 text-hig-blue font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
              <Sparkles className="w-4 h-4" />
              <span>STORY OF THE DAY</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-black dark:text-white leading-[1.1] tracking-tight group-hover:text-hig-blue transition-colors">
              {featuredArticle.title}
            </h1>
            <p className="text-base md:text-xl text-black dark:text-white leading-relaxed line-clamp-3 font-black">
              {featuredArticle.excerpt}
            </p>
            <div className="flex items-center justify-between pt-4 md:pt-8 border-t border-[var(--border)] dark:border-[var(--border)]">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-black dark:text-white" />
                  </div>
                  <div className="flex flex-col">
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
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <Users className="w-5 h-5 text-hig-blue" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Voices to follow</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POPULAR_AUTHORS.map((author) => (
            <Link key={author.id} href={`/profile/${author.id}`} className="hig-card p-6 flex items-center gap-6 group hover:bg-hig-blue/5 dark:hover:bg-hig-blue bg-white dark:bg-black border-[var(--border)] shadow-none transition-all">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--background)] shadow-md ring-1 ring-[var(--border)] transition-all">
                <Image src={author.avatar} alt={author.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-hig-blue mb-1 dark:group-hover:text-white/80 transition-colors">{author.role}</p>
                <h4 className="text-2xl font-black text-black dark:text-white dark:group-hover:text-white transition-colors">{author.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-tighter text-black/40 dark:text-white/40 mt-1 dark:group-hover:text-white/60 transition-colors">{author.articlesCount} Articles</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-16 md:gap-24">
        {/* Main Feed */}
        <div className="space-y-16 md:space-y-24">
          <section className="space-y-10 md:space-y-16">
             <div className="flex items-center justify-between border-b border-[var(--border)] dark:border-[var(--border)] pb-6">
                <div className="space-y-1">
                   <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--foreground)] italic">Human stories and ideas</h2>
                   <p className="text-xs text-[var(--foreground)] dark:text-[var(--foreground)] font-black uppercase tracking-widest">The rusability perspective</p>
                </div>
                <Link href="/news" className="text-xs font-black text-hig-blue uppercase tracking-[0.2em] hover:underline">Explore More</Link>
             </div>

             {/* 2/3 and 1/3 Content Grid - Matched Height Refinement */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-stretch">
               {/* 2/3 Width Article */}
               <Link href={`/posts/${otherArticles[0].id}`} className="md:col-span-2 group flex flex-col space-y-6">
                 <div className="relative flex-1 min-h-[300px] md:min-h-[440px] rounded-[32px] overflow-hidden border border-[var(--border)] dark:border-[var(--border)]">
                    <Image src={otherArticles[0].image} alt={otherArticles[0].title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-hig-blue">
                       <span>{otherArticles[0].category}</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-white" />
                       <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{otherArticles[0].time}</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black leading-tight group-hover:text-hig-blue transition-colors text-[var(--foreground)]">
                       {otherArticles[0].title}
                    </h3>
                    <p className="text-[var(--foreground)] dark:text-[var(--foreground)] leading-relaxed font-black line-clamp-2">
                       {otherArticles[0].excerpt}
                    </p>
                 </div>
               </Link>

               {/* 1/3 Width Article - Now matched height with 2/3 visually */}
               <Link href={`/posts/${otherArticles[1].id}`} className="md:col-span-1 group flex flex-col space-y-6">
                 <div className="relative flex-1 min-h-[300px] rounded-[32px] overflow-hidden border border-[var(--border)] dark:border-[var(--border)]">
                    <Image src={otherArticles[1].image} alt={otherArticles[1].title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-hig-blue">
                       <span>{otherArticles[1].category}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black leading-tight group-hover:text-hig-blue transition-colors text-[var(--foreground)]">
                       {otherArticles[1].title}
                    </h3>
                    <p className="text-sm text-[var(--foreground)] dark:text-[var(--foreground)] font-black line-clamp-2 leading-relaxed">
                       {otherArticles[1].excerpt}
                    </p>
                 </div>
               </Link>
             </div>

             {/* Secondary Grid - Continuous Content */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
               {/* Injection Tool Card */}
               {(() => {
                 const tool = getRandomTool();
                 return (
                  <div className="bg-hig-blue rounded-[32px] p-8 text-white flex flex-col justify-between group cursor-pointer relative overflow-hidden h-full min-h-[340px]">
                    <div className="relative z-10 space-y-6">
                      <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Featured Tool</div>
                      <h4 className="text-2xl font-black leading-tight group-hover:underline">{tool.name}</h4>
                      <p className="text-white/80 text-sm font-medium leading-relaxed">{tool.description}</p>
                      <Link href={tool.link} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-hig-blue px-6 py-3 rounded-full">
                        Try Now <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  </div>
                 );
               })()}

               {/* Remaining Articles in the expanded list */}
               {otherArticles.slice(2).map((article) => (
                 <Link key={article.id} href={`/posts/${article.id}`} className="group flex flex-col space-y-6 h-full">
                   <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden border border-[var(--border)] dark:border-[var(--border)] shrink-0">
                     <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                   </div>
                   <div className="space-y-3 flex-1">
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-hig-blue">
                        <span>{article.category}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{article.time}</span>
                     </div>
                     <h3 className="text-xl font-black leading-tight group-hover:text-hig-blue transition-colors line-clamp-2 text-[var(--foreground)]">{article.title}</h3>
                     <p className="text-sm text-[var(--foreground)] dark:text-[var(--foreground)] font-black line-clamp-2 leading-relaxed">{article.excerpt}</p>
                   </div>
                 </Link>
               ))}
             </div>
          </section>

          {/* Emotional Intelligence / Vision Section */}
          <section className="bg-white dark:bg-black border border-[var(--border)] dark:border-[var(--border)] rounded-[32px] md:rounded-[48px] p-8 md:p-16 text-[var(--foreground)] overflow-hidden relative shadow-none">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-10 text-hig-blue font-black uppercase tracking-[0.2em] text-[10px]">
                  <Sparkles className="w-4 h-4" />
                  <span>EMOTIONAL INTELLIGENCE</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-black mb-12 tracking-tight leading-tight text-[var(--foreground)]">Crafting the future of marketing with heart.</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {INDUSTRY_TOOLS.map((tool) => (
                    <Link key={tool.id} href={tool.link} className="hig-card bg-white dark:bg-white/10 border-[var(--border)] dark:border-white/10 hover:bg-white p-6 space-y-6 block group shadow-none">
                       <div className="relative w-full aspect-square rounded-[24px] overflow-hidden border border-[var(--border)]">
                          <Image src={tool.image} alt={tool.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between text-[var(--foreground)]">
                             <h4 className="font-black text-lg">{tool.name}</h4>
                             <ExternalLink className="w-4 h-4 text-[var(--foreground)]" />
                          </div>
                          <p className="text-xs text-[var(--foreground)] dark:text-[var(--foreground)] font-black leading-relaxed">{tool.description}</p>
                       </div>
                       <div className="pt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-hig-blue text-white px-3 py-1.5 rounded-full">{tool.category}</span>
                       </div>
                    </Link>
                  ))}
               </div>
            </div>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-hig-blue/10 blur-[120px] -z-0 rounded-full" />
          </section>
        </div>

        {/* Industry Pulse & Trending - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Industry Pulse News */}
          <div className="hig-card p-8 bg-[var(--background)] border-[var(--border)] shadow-none border-b-2">
             <div className="flex items-center gap-2 mb-8 border-b border-[var(--border)] pb-4">
                <Flame className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-xl text-[var(--foreground)] uppercase tracking-tight">Pulse News</h3>
             </div>
             <div className="space-y-6">
                {INDUSTRY_NEWS.map((item) => (
                  <div key={item.id} className="group cursor-pointer space-y-2 border-b border-[var(--border)] pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-hig-blue">{item.category}</span>
                      {item.isHot && <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1"><Flame className="w-2 h-2" /> HOT</span>}
                    </div>
                    <h4 className="text-sm font-black leading-snug text-[var(--foreground)] group-hover:text-hig-blue transition-colors">{item.title}</h4>
                  </div>
                ))}
             </div>
          </div>

          <div className="hig-card p-8 bg-[var(--background)] border-[var(--border)] shadow-none border-b-2">
            <div className="flex items-center gap-2 mb-8 border-b border-[var(--border)] pb-4">
              <TrendingUp className="w-5 h-5 text-hig-blue font-black" />
              <h3 className="font-black text-xl text-[var(--foreground)] uppercase tracking-tight">Trending Vibes</h3>
            </div>

            <div className="space-y-8">
              {TRENDING.map((tag, i) => (
                <Link key={tag} href={`/news?q=${tag}`} className="flex gap-6 group">
                  <span className="text-4xl font-black text-[var(--foreground)]/40 dark:text-white/10 group-hover:text-hig-blue transition-colors shrink-0">0{i+1}</span>
                  <div className="space-y-2 pt-1">
                    <h4 className="font-black text-sm leading-snug text-[var(--foreground)] group-hover:text-hig-blue transition-colors line-clamp-3 uppercase tracking-tight">
                      {tag}
                    </h4>
                    <p className="text-[8px] text-[var(--foreground)] uppercase font-black tracking-[0.2em] flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-emerald-600" />
                       <span className="font-black">LIVE INSIGHT</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Full Width Personalization */}
        <div className="hig-card p-12 bg-hig-blue text-white overflow-hidden relative">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] opacity-80">Tailored For You</h3>
                 <h2 className="text-3xl md:text-5xl font-black leading-tight">Your Personalization Engine.</h2>
                 <p className="text-lg font-medium opacity-90 max-w-xl">
                   Get content and tools tailored to your PR & Search Strategy goals. We use AI to analyze your reading patterns.
                 </p>
              </div>
              <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest bg-white text-hig-blue px-10 py-5 rounded-full hover:bg-white transition-colors shadow-2xl shrink-0">
                Customize My Feed <ArrowUpRight className="w-5 h-5" />
              </Link>
           </div>
           <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 blur-[100px] -z-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
