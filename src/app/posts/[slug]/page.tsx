import { Clock, User, Share2, Heart, MessageCircle, Bookmark, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ARTICLES, INDUSTRY_TOOLS } from "@/lib/data";
import { notFound } from "next/navigation";
import { ArticlePlugin } from "@/components/ArticlePlugin";

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const article = ARTICLES.find(a => a.id.toString() === slug);

  if (!article) {
    // For demo purposes, we can also check for specific slugs used in search
    if (slug !== "future-of-marketing-ai") {
       notFound();
    }
  }

  const displayData = article || {
    title: "The Future of Marketing: How AI is Redefining Personalization",
    category: "Search Strategy",
    time: "8 min read",
    author: "Elena Rossi",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200"
  };

  const isProPost = displayData.isProAuthor;

  return (
    <div className={`max-w-7xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-500 ${isProPost ? 'pro-editorial' : ''}`}>
      {isProPost && (
        <div className="flex justify-center mb-8">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
            <Sparkles className="w-3 h-3 fill-white" />
            Premium Perspective
          </span>
        </div>
      )}
      <header className="mb-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-10 text-hig-blue font-bold text-xs uppercase tracking-widest">
          <span className="bg-hig-blue/10 px-3 py-1.5 rounded-full">{displayData.category}</span>
          <span className="text-zinc-400">•</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {displayData.time}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-10 leading-tight max-w-5xl mx-auto tracking-tight">
          {displayData.title}
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-lg">
                 <User className="w-6 h-6 text-zinc-500" />
              </div>
              <div className="text-left">
                 <p className="font-bold text-zinc-900 dark:text-zinc-100">{displayData.author}</p>
                 <p className="text-sm text-zinc-500 font-medium tracking-tight">Chief Content Strategist</p>
              </div>
           </div>

           <div className="hidden md:block h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

           <div className="flex items-center gap-4">
              <button className="hig-button-primary py-2 px-6 text-sm flex items-center gap-2">Follow</button>
              <div className="flex gap-2">
                 <button className="p-3 text-zinc-400 hover:text-hig-blue transition-colors rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900"><Share2 className="w-5 h-5" /></button>
                 <button className="p-3 text-zinc-400 hover:text-hig-blue transition-colors rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900"><Bookmark className="w-5 h-5" /></button>
              </div>
           </div>
        </div>
      </header>

      <div className="relative mb-20 rounded-[40px] overflow-hidden shadow-2xl h-[400px] md:h-[600px] border border-zinc-100 dark:border-zinc-800">
         <Image
           src={displayData.image}
           alt={displayData.title}
           fill
           priority
           className="object-cover"
         />
      </div>

      <div className="flex flex-col lg:flex-row gap-20">
         <aside className="w-full lg:w-[120px] hidden lg:block sticky top-32 h-fit space-y-8">
            <div className="flex flex-col items-center gap-8">
               <div className="flex flex-col items-center gap-2">
                  <button className="p-4 text-zinc-400 hover:text-rose-500 transition-colors rounded-full bg-white dark:bg-zinc-900 shadow-hig border border-zinc-100 dark:border-zinc-800 group">
                    <Heart className="w-6 h-6 group-hover:fill-rose-500" />
                  </button>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">1.2K</span>
               </div>

               <div className="flex flex-col items-center gap-2">
                  <button className="p-4 text-zinc-400 hover:text-hig-blue transition-colors rounded-full bg-white dark:bg-zinc-900 shadow-hig border border-zinc-100 dark:border-zinc-800 group">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">48</span>
               </div>
            </div>
         </aside>

         <article className="flex-1 space-y-10">
            <p className="text-2xl font-medium leading-relaxed text-zinc-800 dark:text-zinc-200 italic border-l-4 border-hig-blue pl-8 py-2">
              The era of mass marketing is ending. AI is not just another tool; it&apos;s the bridge between raw data and hyper-personalized customer experiences.
            </p>

            <p>
              In the rapidly evolving landscape of digital marketing, the integration of artificial intelligence (AI) has shifted from a futuristic concept to a present-day necessity. The ability of machine learning algorithms to process vast datasets in real-time is enabling brands to deliver content that resonates on a deeply individual level.
            </p>

            {!isProPost && (
              <ArticlePlugin
                type="tool"
                data={{
                  id: INDUSTRY_TOOLS[0].id,
                  name: INDUSTRY_TOOLS[0].name,
                  description: INDUSTRY_TOOLS[0].description,
                  image: INDUSTRY_TOOLS[0].image,
                  category: INDUSTRY_TOOLS[0].category,
                  link: INDUSTRY_TOOLS[0].link
                }}
              />
            )}

            <h2 className="text-3xl font-bold tracking-tight pt-10">The Algorithmic Approach to Empathy</h2>

            <p>
              One of the most profound impacts of AI in marketing is its role in sentiment analysis and emotional intelligence. By monitoring social signals and engagement patterns, AI engines can now predict the emotional state of a user and adjust the tone of the messaging accordingly. This &quot;algorithmic empathy&quot; is what separates modern personalization from the basic &quot;First Name&quot; tags of the past decade.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-900 p-12 rounded-[32px] border border-zinc-100 dark:border-zinc-800 space-y-6">
               <h3 className="text-xl font-black uppercase tracking-widest text-hig-blue">Key Insights for 2024</h3>
               <ul className="space-y-4">
                  {[
                    "Zero-Click Searches: Why optimization for the snippet is the new SEO.",
                    "Voice-to-Task: The rise of invisible interfaces and AI agents.",
                    "Privacy-First Data: Leveraging first-party data without cross-site tracking."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <span className="w-6 h-6 rounded-full bg-hig-blue text-white flex items-center justify-center shrink-0 font-bold text-[10px]">{i+1}</span>
                       <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300 leading-tight">{item}</span>
                    </li>
                  ))}
               </ul>
            </div>

            <p>
              As we move further into 2024, the challenge for marketers will be balancing the efficiency of AI with the authenticity that human oversight provides. The brands that succeed will be those that use AI to enhance human creativity, not replace it.
            </p>

            <div className="pt-20 border-t border-zinc-100 dark:border-zinc-800 space-y-12">
               <h3 className="text-2xl font-bold tracking-tight">More from Elena Rossi</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Link href="/posts/zero-click-search" className="hig-card p-8 group">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs text-hig-blue font-black uppercase tracking-widest">
                           <span>SEO</span>
                           <span className="text-zinc-400">•</span>
                           <span>4 min read</span>
                        </div>
                        <h4 className="text-xl font-bold group-hover:text-hig-blue transition-colors">The Zero-Click Search Paradox</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">How to maintain brand visibility when users don&apos;t need to click through to your website.</p>
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-hig-blue pt-4">Read Now <ArrowUpRight className="w-4 h-4" /></div>
                     </div>
                  </Link>
                  <Link href="/posts/ai-agent-era" className="hig-card p-8 group">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs text-hig-blue font-black uppercase tracking-widest">
                           <span>Future Tech</span>
                           <span className="text-zinc-400">•</span>
                           <span>6 min read</span>
                        </div>
                        <h4 className="text-xl font-bold group-hover:text-hig-blue transition-colors">Marketing in the Era of AI Agents</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">When the customer is an AI agent, how do your marketing strategies change?</p>
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-hig-blue pt-4">Read Now <ArrowUpRight className="w-4 h-4" /></div>
                     </div>
                  </Link>
               </div>
            </div>
         </article>
      </div>
    </div>
  );
}
