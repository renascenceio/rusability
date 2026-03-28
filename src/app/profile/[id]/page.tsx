"use client";

import { User, Settings, Sparkles, Heart, Clock, Layout, Sliders, ChevronRight, TrendingUp, Users, Target, Edit3, BookOpen, MessageCircle, FileText, Trash2, Shield, Bell, ArrowRight } from "lucide-react";
import Image from "next/image";
import { CURRENT_USER } from "@/lib/data";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const user = CURRENT_USER;
  type TabId = "saved" | "drafts" | "published" | "activity";
  const [activeTab, setActiveTab] = useState<TabId>("saved");
  const isPro = user.membership === "pro";
  const INTERESTS = user.interests;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "saved", label: "Saved Articles", icon: Heart },
    { id: "drafts", label: "My Drafts", icon: FileText },
    { id: "published", label: "Published", icon: BookOpen },
    { id: "activity", label: "Activity", icon: TrendingUp },
  ];

  const contentMap = {
    saved: [
      { title: "The Shift in SEO Strategy for 2024", time: "5 min read", cat: "Search Strategy", date: "Saved 2 days ago" },
      { title: "Generative AI for Media Outreach", time: "8 min read", cat: "Public Relations", date: "Saved 1 week ago" },
      { title: "Brand Safety in the Age of LLMs", time: "12 min read", cat: "Brand Protection", date: "Saved 2 weeks ago" },
    ],
    drafts: [
      { title: "Future of Content Economics", time: "Pending Review", cat: "Monetization", status: "Reviewing" },
      { title: "My PR Strategy for Q3", time: "Draft", cat: "Public Relations", status: "Work in progress" },
    ],
    published: [
      { title: "How to simulate focus groups with AI", time: "15 min read", cat: "AI Marketing", views: "12.4K", date: "Jan 12, 2024" },
    ],
    activity: [
      { action: "Commented on", target: "Why SEO is still relevant", date: "2 hours ago" },
      { action: "Upvoted", target: "New Marketing Tools for 2024", date: "Yesterday" },
      { action: "Started following", target: "Elena Vance", date: "3 days ago" },
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <header className="mb-16 flex flex-col md:flex-row items-center gap-12">
         <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-white flex items-center justify-center border-4 border-white dark:border-black shadow-none ring-1 ring-black/5 overflow-hidden">
               <User className="w-16 h-16 text-[var(--foreground)] group-hover:scale-110 transition-transform" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-white rounded-full shadow-lg border border-[var(--border)] dark:border-[var(--border)] text-hig-blue hover:scale-110 transition-transform">
               <Edit3 className="w-4 h-4" />
            </button>
         </div>
         <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">{user.name}</h1>
                {isPro && (
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">
                    Pro Member
                    </div>
                )}
                </div>
                <p className="text-xl text-[var(--foreground)] dark:text-[var(--foreground)] font-black leading-relaxed max-w-2xl">
                {user.role}. {user.bio}
                </p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
               <button className="hig-button-primary px-8">Follow</button>
               <button className="hig-button-secondary flex items-center gap-2">
                 <Settings className="w-4 h-4" />
                 Account
               </button>
               <button className="p-3 rounded-full border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] hover:text-hig-blue transition-colors">
                  <Bell className="w-5 h-5" />
               </button>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-16">
         <section className="space-y-12">
            <div>
               <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] dark:border-[var(--border)]">
                  <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                     {tabs.map((tab) => (
                       <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`font-black uppercase tracking-widest text-xs pb-4 whitespace-nowrap transition-all border-b-2 ${
                            activeTab === tab.id
                            ? "text-hig-blue border-hig-blue"
                            : "text-[var(--foreground)] border-transparent hover:text-black dark:hover:text-[var(--foreground)]"
                        }`}
                       >
                         {tab.label}
                       </button>
                     ))}
                  </div>
                  <Link href="/editor" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-hig-blue hover:underline mb-4">
                     <Edit3 className="w-4 h-4" /> New Article
                  </Link>
               </div>

               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === "saved" && contentMap.saved.map((article) => (
                    <div key={article.title} className="hig-card p-6 flex items-center justify-between group bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none hover:border-[var(--border)]">
                       <div className="space-y-2">
                          <h3 className="font-black text-lg group-hover:text-hig-blue transition-colors text-[var(--foreground)]">{article.title}</h3>
                          <div className="flex items-center gap-4 text-[10px] text-[var(--foreground)] font-black uppercase tracking-widest">
                             <span className="text-hig-blue">{article.cat}</span>
                             <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.time}</span>
                             <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{article.date}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button className="p-3 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                             <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-3 text-[var(--foreground)] hover:text-hig-blue bg-white dark:bg-white rounded-xl transition-all">
                             <ChevronRight className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  ))}

                  {activeTab === "drafts" && contentMap.drafts.map((article) => (
                    <Link href="/editor" key={article.title} className="hig-card p-6 flex items-center justify-between group bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none hover:border-[var(--border)]">
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-black text-lg group-hover:text-hig-blue transition-colors text-[var(--foreground)]">{article.title}</h3>
                            <span className="text-[8px] font-black uppercase bg-amber-400/10 text-amber-600 px-2 py-0.5 rounded border border-amber-400/20">{article.status}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-[var(--foreground)] font-black uppercase tracking-widest">
                             <span className="text-hig-blue">{article.cat}</span>
                             <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">Updated today</span>
                          </div>
                       </div>
                       <div className="p-3 text-hig-blue bg-hig-blue/5 rounded-xl transition-all group-hover:scale-110">
                          <Edit3 className="w-5 h-5" />
                       </div>
                    </Link>
                  ))}

                  {activeTab === "published" && contentMap.published.map((article) => (
                    <div key={article.title} className="hig-card p-6 flex items-center justify-between group bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none hover:border-[var(--border)]">
                       <div className="space-y-2">
                          <h3 className="font-black text-lg group-hover:text-hig-blue transition-colors text-[var(--foreground)]">{article.title}</h3>
                          <div className="flex items-center gap-4 text-[10px] text-[var(--foreground)] font-black uppercase tracking-widest">
                             <span className="text-hig-blue">{article.cat}</span>
                             <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {article.views} views</span>
                             <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{article.date}</span>
                          </div>
                       </div>
                       <button className="p-3 text-[var(--foreground)] hover:text-hig-blue bg-white dark:bg-white rounded-xl transition-all">
                          <ArrowRight className="w-5 h-5" />
                       </button>
                    </div>
                  ))}

                  {activeTab === "activity" && contentMap.activity.map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 border-l-2 border-[var(--border)] dark:border-[var(--border)] hover:border-hig-blue transition-colors">
                       <div className="w-10 h-10 rounded-full bg-white dark:bg-white flex items-center justify-center shrink-0">
                          {item.action.includes("Comment") ? <MessageCircle className="w-4 h-4 text-hig-blue" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black">
                            <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{item.action}</span> <span className="text-[var(--foreground)] underline underline-offset-4 decoration-black/10 dark:decoration-zinc-800">{item.target}</span>
                          </p>
                          <span className="text-[10px] text-[var(--foreground)] dark:text-[var(--foreground)] font-black uppercase tracking-widest mt-1 block">{item.date}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {isPro && (
              <div className="space-y-8 pt-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                       <BookOpen className="w-6 h-6 text-hig-blue" />
                       Performance Pulse
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Optimization</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="hig-card p-8 space-y-4 bg-white dark:bg-white/50 relative overflow-hidden group border-[var(--border)] dark:border-[var(--border)] shadow-none border-b-2">
                       <div className="flex items-center gap-2 text-[var(--foreground)] dark:text-[var(--foreground)] group-hover:text-hig-blue transition-colors">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Total Readership</span>
                       </div>
                       <p className="text-4xl font-black text-[var(--foreground)]">42.8K</p>
                       <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase">
                          <TrendingUp className="w-3 h-3" /> +12% week
                       </div>
                    </div>
                    <div className="hig-card p-8 space-y-4 bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none border-b-2">
                       <div className="flex items-center gap-2 text-[var(--foreground)] dark:text-[var(--foreground)] group-hover:text-hig-blue transition-colors">
                          <Target className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Conversion Rate</span>
                       </div>
                       <p className="text-4xl font-black text-[var(--foreground)]">8.2%</p>
                       <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase">
                          Peak Performance
                       </div>
                    </div>
                    <div className="hig-card p-8 space-y-4 bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none border-b-2">
                       <div className="flex items-center gap-2 text-[var(--foreground)] dark:text-[var(--foreground)] group-hover:text-hig-blue transition-colors">
                          <Users className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Total Followers</span>
                       </div>
                       <p className="text-4xl font-black text-[var(--foreground)]">12.1K</p>
                       <div className="flex items-center gap-1.5 text-[var(--foreground)] dark:text-[var(--foreground)] font-black text-[10px] uppercase">
                          Growing Network
                       </div>
                    </div>
                 </div>
              </div>
            )}
         </section>

         <aside className="space-y-12">
            <div className="hig-card p-8 bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none border-b-2">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase tracking-widest text-[var(--foreground)] dark:text-[var(--foreground)]">Interests</h3>
                  <button className="p-2 text-[var(--foreground)] hover:text-hig-blue transition-colors">
                     <Sliders className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((tag) => (
                    <span key={tag} className="bg-white dark:bg-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] dark:text-[var(--foreground)] border border-[var(--border)] dark:border-[var(--border)] hover:border-hig-blue hover:text-hig-blue transition-all cursor-pointer">
                      {tag}
                    </span>
                  ))}
               </div>

               <button className="w-full mt-10 hig-button-secondary py-3 text-xs uppercase tracking-[0.2em] font-black">Add Topic</button>
            </div>

            <div className="p-8 hig-card bg-white dark:bg-white text-white relative overflow-hidden group">
               <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-hig-blue flex items-center justify-center shadow-lg shadow-hig-blue/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]">Professional Identity</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <span className="text-[9px] font-black uppercase tracking-widest text-hig-blue">Primary Toolkit</span>
                         <div className="flex items-center gap-4">
                            <span className="text-sm font-bold">Persona AI</span>
                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full w-[85%] bg-hig-blue" />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-4">
                            <span className="text-sm font-bold">Metric Flow</span>
                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full w-[60%] bg-emerald-500" />
                            </div>
                         </div>
                      </div>
                   </div>
                   <button className="w-full mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-hig-blue transition-colors border-b border-white/10 pb-4 text-left flex items-center justify-between group">
                      Certifications <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-hig-blue/20 blur-[80px] -z-0" />
            </div>
         </aside>
      </div>
    </div>
  );
}
