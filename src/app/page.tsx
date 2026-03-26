import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, User, Bookmark, TrendingUp, Sparkles } from "lucide-react";
import { ARTICLES, TRENDING } from "@/lib/data";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Main Feed */}
        <div className="flex-1 space-y-20">
          <section>
             <div className="flex items-center gap-3 mb-10 text-hig-blue font-semibold uppercase tracking-widest text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Selected for you</span>
             </div>

             <div className="space-y-16">
               {ARTICLES.map((article) => (
                 <Link key={article.id} href={`/posts/${article.id}`} className="group block">
                   <article className="grid grid-cols-1 md:grid-cols-[1fr,240px] gap-8 items-start">
                     <div className="space-y-4">
                       <div className="flex items-center gap-3 text-sm">
                         <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-zinc-500" />
                         </div>
                         <span className="font-semibold text-zinc-900 dark:text-zinc-100">{article.author}</span>
                         <span className="text-zinc-400">in</span>
                         <span className="font-medium text-zinc-700 dark:text-zinc-300">{article.category}</span>
                       </div>

                       <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white group-hover:text-hig-blue transition-colors leading-tight">
                         {article.title}
                       </h2>

                       <p className="text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                         {article.excerpt}
                       </p>

                       <div className="flex items-center justify-between pt-4">
                         <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                           <div className="flex items-center gap-1.5">
                             <Clock className="w-3.5 h-3.5" />
                             {article.time}
                           </div>
                           <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md text-zinc-500">Popular</span>
                         </div>
                         <div className="flex gap-4">
                           <button className="text-zinc-400 hover:text-hig-blue"><Bookmark className="w-5 h-5" /></button>
                           <button className="text-zinc-400 hover:text-hig-blue"><ArrowUpRight className="w-5 h-5" /></button>
                         </div>
                       </div>
                     </div>

                     <div className="relative order-first md:order-last h-[160px] md:h-full rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                       <Image
                         src={article.image}
                         alt={article.title}
                         fill
                         className="object-cover transition-transform duration-700 group-hover:scale-105"
                       />
                     </div>
                   </article>
                 </Link>
               ))}
             </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] space-y-12">
          <div className="hig-card p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-hig-blue" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Trending Intelligence</h3>
            </div>

            <div className="space-y-6">
              {TRENDING.map((tag, i) => (
                <Link key={tag} href={`/news?q=${tag}`} className="flex gap-4 group">
                  <span className="text-3xl font-black text-zinc-100 dark:text-zinc-900 group-hover:text-hig-blue transition-colors">0{i+1}</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm leading-tight text-zinc-800 dark:text-zinc-200 group-hover:text-hig-blue transition-colors line-clamp-2">
                      {tag}
                    </h4>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Updated 2h ago</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <Link href="/news" className="text-sm font-semibold text-hig-blue hover:underline">
                See all news insights
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-6">
             <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Personalization</h3>
             <p className="text-xs text-zinc-500 leading-relaxed">
               Rusability tracks your interests in real-time to surface the most relevant marketing tools and industry news.
             </p>
             <Link href="/profile/jdoe" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-hig-blue transition-colors">
               Manage Interests <ArrowUpRight className="w-3 h-3" />
             </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
