import { User, Settings, Sparkles, Heart, Clock, Layout, Sliders, ChevronRight, TrendingUp, Users, Target } from "lucide-react";
import Image from "next/image";
import { CURRENT_USER, ARTICLES } from "@/lib/data";

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
  await props.params;

  const user = CURRENT_USER;
  const isPro = user.membership === "pro";
  const INTERESTS = user.interests;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
         <div className="w-32 h-32 rounded-full bg-hig-gray-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-black shadow-xl ring-2 ring-hig-blue/20">
            <User className="w-16 h-16 text-zinc-400" />
         </div>
         <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
               <h1 className="text-4xl font-black mb-0">{user.name}</h1>
               {isPro && (
                 <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                   Pro Member
                 </div>
               )}
            </div>
            <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl">
              {user.role}. {user.bio}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
               <button className="hig-button-primary">Edit Profile</button>
               <button className="hig-button-secondary flex items-center gap-2">
                 <Settings className="w-4 h-4" />
                 Settings
               </button>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-16">
         <section className="space-y-12">
            <div>
               <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-8">
                     <button className="font-bold text-sm text-hig-blue border-b-2 border-hig-blue pb-4">Saved Articles</button>
                     <button className="font-bold text-sm text-zinc-400 hover:text-zinc-900 pb-4">History</button>
                     <button className="font-bold text-sm text-zinc-400 hover:text-zinc-900 pb-4">Activity</button>
                  </div>
                  <button className="text-sm font-bold text-zinc-400 flex items-center gap-1">
                     Manage <ChevronRight className="w-4 h-4" />
                  </button>
               </div>

               <div className="space-y-6">
                  {[
                    { title: "The Shift in SEO Strategy for 2024", time: "5 min read", cat: "Search Strategy" },
                    { title: "Generative AI for Media Outreach", time: "8 min read", cat: "Public Relations" },
                    { title: "Return of Long-Form Content", time: "12 min read", cat: "Content Strategy" },
                  ].map((article) => (
                    <div key={article.title} className="hig-card p-6 flex items-center justify-between group">
                       <div className="space-y-2">
                          <h3 className="font-bold text-lg group-hover:text-hig-blue transition-colors">{article.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                             <span className="text-hig-blue font-bold uppercase">{article.cat}</span>
                             <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.time}</span>
                          </div>
                       </div>
                       <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"><Heart className="w-5 h-5 fill-rose-500" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {isPro && (
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight">Author Insights</h3>
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest">Live Metrics</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="hig-card p-8 space-y-2">
                       <div className="flex items-center gap-2 text-zinc-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Total Views</span>
                       </div>
                       <p className="text-3xl font-black">42.8K</p>
                       <p className="text-xs text-emerald-500 font-bold">+12.4% this week</p>
                    </div>
                    <div className="hig-card p-8 space-y-2">
                       <div className="flex items-center gap-2 text-zinc-400">
                          <Target className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Engagement Rate</span>
                       </div>
                       <p className="text-3xl font-black">8.2%</p>
                       <p className="text-xs text-emerald-500 font-bold">Above industry avg</p>
                    </div>
                    <div className="hig-card p-8 space-y-2">
                       <div className="flex items-center gap-2 text-zinc-400">
                          <Users className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Reach</span>
                       </div>
                       <p className="text-3xl font-black">156.2K</p>
                       <p className="text-xs text-rose-500 font-bold">-2.1% this week</p>
                    </div>
                 </div>
              </div>
            )}

            <div className="space-y-8">
               <h3 className="text-xl font-bold tracking-tight">Personalization Engine</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="hig-card p-6 bg-hig-blue/5 border-hig-blue/10">
                     <Sparkles className="w-6 h-6 text-hig-blue mb-4" />
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm uppercase tracking-wider">AI Copilot</h4>
                        {isPro && <span className="text-[8px] font-black bg-hig-blue text-white px-1.5 py-0.5 rounded uppercase">Unlimited</span>}
                     </div>
                     <p className="text-xs text-zinc-500 leading-relaxed">
                        We&apos;ve identified 3 new tools that match your &quot;Search Engine Marketing&quot; interest.
                     </p>
                  </div>
                  <div className="hig-card p-6 bg-emerald-50/50 border-emerald-100">
                     <Layout className="w-6 h-6 text-emerald-500 mb-4" />
                     <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-emerald-600">Smart Layout</h4>
                     <p className="text-xs text-zinc-500 leading-relaxed">
                        Your homepage layout has been optimized for &quot;Industry News&quot; consumption.
                     </p>
                  </div>
               </div>
            </div>
         </section>

         <aside className="space-y-12">
            <div className="hig-card p-8">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold tracking-tight">Your Interests</h3>
                  <button className="p-2 text-zinc-400 hover:text-hig-blue transition-colors">
                     <Sliders className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((tag) => (
                    <span key={tag} className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {tag}
                    </span>
                  ))}
               </div>

               <button className="w-full mt-10 hig-button-secondary text-sm">Add Interest</button>
            </div>

            <div className="p-8 hig-card border-dashed">
               <div className="flex items-center gap-3 mb-6">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                    <Image src="https://images.unsplash.com/photo-1620712943543-bcc4638d9985?auto=format&fit=crop&q=80&w=100" fill className="object-cover" alt="Persona AI" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Connected Tools</h3>
               </div>
               <div className="space-y-4">
                  {["Persona AI", "Metric Flow", "PR Pulse"].map((tool) => (
                    <div key={tool} className="flex items-center justify-between group cursor-pointer">
                       <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-hig-blue transition-colors">{tool}</span>
                       <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  ))}
               </div>
               <button className="w-full mt-8 text-sm font-bold text-hig-blue">Manage Connections</button>
            </div>
         </aside>
      </div>
    </div>
  );
}
