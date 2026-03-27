import { Search, ExternalLink, Sparkles, Sliders, Layout, MessageSquare, PieChart, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { INDUSTRY_TOOLS } from "@/lib/data";

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-6 h-6 text-hig-blue" />,
  MessageSquare: <MessageSquare className="w-6 h-6 text-hig-blue" />,
  PieChart: <PieChart className="w-6 h-6 text-hig-blue" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-hig-blue" />,
};

const CATEGORIES = ["All", "AI Marketing", "Public Relations", "Analytics", "Brand Protection", "Social Media", "SEO"];

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-6">Marketing Tools</h1>
        <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">
          The essential toolkit for digital marketing and PR professionals. Hand-curated, AI-vetted, and community-reviewed.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-[240px] space-y-10">
           <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Categories</h3>
              <div className="flex flex-col gap-4">
                 {CATEGORIES.map((cat) => (
                   <button key={cat} className={`text-sm font-medium text-left transition-colors ${
                     cat === "All" ? "text-hig-blue" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                   }`}>
                     {cat}
                   </button>
                 ))}
              </div>
           </div>

           <div className="hig-card p-6 bg-hig-blue/5 border-hig-blue/10">
              <h4 className="text-sm font-bold text-hig-blue mb-3">Rusability Suggests</h4>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                Based on your interest in &quot;AI Copywriting&quot;, we recommend checking out Persona AI.
              </p>
              <button className="text-[10px] font-black uppercase tracking-wider text-hig-blue underline">View Suggestion</button>
           </div>
        </aside>

        {/* Tools Grid */}
        <div className="flex-1 space-y-10">
           <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="relative flex-1 max-w-md w-full">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                 <input
                   className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl py-3 pl-12 pr-6 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-hig-blue/20"
                   placeholder="Search tools..."
                 />
              </div>
              <div className="flex items-center gap-4">
                 <button className="hig-button-secondary text-sm flex items-center gap-2 py-3">
                   <Layout className="w-4 h-4" />
                   Grid View
                 </button>
                 <button className="hig-button-secondary text-sm flex items-center gap-2 py-3 opacity-50">
                   <Sliders className="w-4 h-4" />
                   Advanced Sort
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {INDUSTRY_TOOLS.map((tool) => (
                <div key={tool.id} className="hig-card group overflow-hidden flex flex-col">
                   <div className="h-[180px] overflow-hidden relative">
                      <Image
                        src={tool.image}
                        alt={tool.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center">
                              {tool.icon ? ICON_MAP[tool.icon] : <Sparkles className="w-6 h-6 text-hig-blue" />}
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest text-white">{tool.category}</span>
                        </div>
                      </div>
                   </div>

                   <div className="p-8 flex-1 flex flex-col space-y-6">
                      <div className="space-y-4 flex-1">
                         <div className="flex items-center justify-between">
                           <h3 className="text-xl font-bold leading-tight text-zinc-900 dark:text-white group-hover:text-hig-blue transition-colors">
                             {tool.name}
                           </h3>
                           <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                             PRO
                           </div>
                         </div>
                         <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                           {tool.description}
                         </p>
                      </div>

                      <div className="flex items-center gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                         <button className="flex-1 hig-button-primary py-2.5 text-sm flex items-center justify-center gap-2">
                           Try Tool <ExternalLink className="w-4 h-4" />
                         </button>
                         <button className="flex-1 hig-button-secondary py-2.5 text-sm">Review</button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
