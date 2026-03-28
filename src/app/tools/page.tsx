"use client";

import { useState } from "react";
import { Search, ExternalLink, Sparkles, Sliders, MessageSquare, PieChart, ShieldCheck, Grid, List as ListIcon, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { INDUSTRY_TOOLS } from "@/lib/data";

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-6 h-6 text-hig-blue" />,
  MessageSquare: <MessageSquare className="w-6 h-6 text-hig-blue" />,
  PieChart: <PieChart className="w-6 h-6 text-hig-blue" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-hig-blue" />,
};

const CATEGORIES = ["All", "AI Marketing", "Public Relations", "Analytics", "Brand Protection", "Social Media", "SEO"];

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredTools = INDUSTRY_TOOLS.filter(tool => {
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-6">Marketing Tools</h1>
        <p className="text-xl text-[var(--foreground)] dark:text-[var(--foreground)] max-w-2xl leading-relaxed font-medium">
          The essential toolkit for digital marketing and PR professionals. Hand-curated, AI-vetted, and community-reviewed.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-[240px] space-y-10">
           <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">Categories</h3>
              <div className="flex flex-col gap-4">
                 {CATEGORIES.map((cat) => (
                   <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm font-medium text-left transition-all ${
                     activeCategory === cat ? "text-hig-blue translate-x-1" : "text-[var(--foreground)] hover:text-[var(--foreground)] dark:hover:text-[var(--foreground)]"
                   }`}>
                     {cat}
                   </button>
                 ))}
              </div>
           </div>

           <div className="hig-card p-6 bg-hig-blue/5 border-hig-blue/10">
              <h4 className="text-sm font-bold text-hig-blue mb-3">Rusability Suggests</h4>
              <p className="text-xs text-[var(--foreground)] leading-relaxed mb-4">
                Based on your interest in &quot;AI Copywriting&quot;, we recommend checking out Persona AI.
              </p>
              <button className="text-[10px] font-black uppercase tracking-wider text-hig-blue underline">View Suggestion</button>
           </div>
        </aside>

        {/* Tools Content */}
        <div className="flex-1 space-y-10">
           <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="relative flex-1 max-w-md w-full group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)] dark:text-[var(--foreground)]" />
                 <input
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-white dark:bg-white border border-[var(--border)] dark:border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-[var(--foreground)] focus:ring-2 focus:ring-hig-blue/20 shadow-none transition-all group-hover:border-[var(--border)] dark:group-hover:border-[var(--border)] font-black"
                   placeholder="Search tools..."
                 />
              </div>
              <div className="flex items-center gap-3">
                 <div className="bg-white dark:bg-white p-1 rounded-xl flex items-center">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-white shadow-sm text-hig-blue" : "text-[var(--foreground)] dark:text-[var(--foreground)]"}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-white shadow-sm text-hig-blue" : "text-[var(--foreground)] dark:text-[var(--foreground)]"}`}
                    >
                      <ListIcon className="w-5 h-5" />
                    </button>
                 </div>
                 <button className="hig-button-secondary text-sm flex items-center gap-2 py-3">
                   <Sliders className="w-4 h-4" />
                   Sort
                 </button>
              </div>
           </div>

           {viewMode === "grid" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredTools.map((tool) => (
                  <Link key={tool.id} href={`/tools/${tool.id}`} className="hig-card group overflow-hidden flex flex-col bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none hover:border-[var(--border)]">
                    <div className="h-[200px] overflow-hidden relative">
                        <Image
                          src={tool.image}
                          alt={tool.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-hig-blue shadow-sm">
                           {tool.category}
                        </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col space-y-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white border border-[var(--border)] dark:border-[var(--border)] flex items-center justify-center">
                                {tool.icon ? ICON_MAP[tool.icon] : <Sparkles className="w-6 h-6 text-hig-blue" />}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-black leading-tight text-[var(--foreground)] group-hover:text-hig-blue transition-colors">
                                {tool.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                <span className="text-[10px] text-[var(--foreground)] dark:text-[var(--foreground)] font-black ml-1">4.9 (128 reviews)</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[var(--foreground)] dark:text-[var(--foreground)] text-sm leading-relaxed line-clamp-3 font-black">
                            {tool.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-[var(--border)] dark:border-[var(--border)]">
                          <button className="flex-1 bg-hig-blue text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-hig-blue/20">
                            Connect <ArrowRight className="w-4 h-4" />
                          </button>
                          <button className="px-5 py-3 rounded-xl border border-[var(--border)] dark:border-[var(--border)] text-[var(--foreground)] hover:text-hig-blue hover:border-hig-blue transition-all">
                             <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                    </div>
                  </Link>
                ))}
             </div>
           ) : (
             <div className="space-y-4">
                {filteredTools.map((tool) => (
                  <Link key={tool.id} href={`/tools/${tool.id}`} className="hig-card p-6 flex items-center gap-6 group hover:bg-white dark:hover:bg-white/50 bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] shadow-none">
                     <div className="w-20 h-20 relative rounded-2xl overflow-hidden shrink-0 border border-[var(--border)]">
                        <Image src={tool.image} alt={tool.name} fill className="object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                           <h4 className="font-black text-lg group-hover:text-hig-blue transition-colors truncate text-[var(--foreground)]">{tool.name}</h4>
                           <span className="px-2 py-0.5 rounded-md bg-white dark:bg-white text-[9px] font-black uppercase text-[var(--foreground)]">{tool.category}</span>
                        </div>
                        <p className="text-sm text-[var(--foreground)] dark:text-[var(--foreground)] line-clamp-1 font-black">{tool.description}</p>
                     </div>
                     <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                           <div className="text-sm font-bold text-[var(--foreground)] dark:text-white">Free Trial</div>
                           <div className="text-[10px] text-[var(--foreground)] font-bold">Starts at $29/mo</div>
                        </div>
                        <div className="p-3 rounded-full bg-hig-blue/10 text-hig-blue group-hover:bg-hig-blue group-hover:text-white transition-all">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                     </div>
                  </Link>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
