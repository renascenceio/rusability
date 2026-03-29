"use client";

import { useEffect, useState, useMemo} from"react";
import {
 Search, Sparkles, Command, X, ArrowRight, Zap,
 ShieldCheck, PenTool, Target, FileText, Calendar,
 TrendingUp, Newspaper, BrainCircuit
} from"lucide-react";
import { motion} from"framer-motion";
import { ARTICLES, INDUSTRY_TOOLS, EVENTS, INDUSTRY_NEWS, TRENDING} from"@/lib/data";
import Link from"next/link";

interface SearchResult {
 id: string | number;
 title: string;
 category: string;
 type:'article' |'tool' |'event' |'news' |'ai-suggestion';
 link: string;
}

export const SpotlightSearch = ({ isOpen, onClose}: { isOpen: boolean; onClose: () => void}) => {
 const [query, setQuery] = useState("");
 const [selectedIndex, setSelectedIndex] = useState(0);

 const results = useMemo(() => {
 if (!query) return [];

 const searchResults: SearchResult[] = [];
 const q = query.toLowerCase();

 // Search Articles
 ARTICLES.filter(a =>
 a.title.toLowerCase().includes(q) ||
 a.category.toLowerCase().includes(q) ||
 a.excerpt.toLowerCase().includes(q)
 ).slice(0, 3).forEach(a => {
 searchResults.push({ id: `a-${a.id}`, title: a.title, category: a.category, type:'article', link: `/posts/${a.id}`});
});

 // Search Tools
 INDUSTRY_TOOLS.filter(t =>
 t.name.toLowerCase().includes(q) ||
 t.category.toLowerCase().includes(q) ||
 t.description.toLowerCase().includes(q)
 ).slice(0, 2).forEach(t => {
 searchResults.push({ id: `t-${t.id}`, title: t.name, category: t.category, type:'tool', link: t.link});
});

 // Search News
 INDUSTRY_NEWS.filter(n =>
 n.title.toLowerCase().includes(q) ||
 n.category.toLowerCase().includes(q)
 ).slice(0, 2).forEach(n => {
 searchResults.push({ id: `n-${n.id}`, title: n.title, category: n.category, type:'news', link:'/news'});
});

 // Search Events
 EVENTS.filter(e =>
 e.title.toLowerCase().includes(q) ||
 e.description.toLowerCase().includes(q) ||
 e.location.toLowerCase().includes(q)
 ).slice(0, 2).forEach(e => {
 searchResults.push({ id: `e-${e.id}`, title: e.title, category: e.type, type:'event', link:'/events'});
});

 // AI Predictions / Smart Suggestions
 if (q.length > 2) {
 searchResults.unshift({
 id:'ai-1',
 title: `Predicting trajectory for"${query}" in 2025`,
 category:'AI Projection',
 type:'ai-suggestion',
 link:'#'
});

 if (q.includes('ai') || q.includes('marketing') || q.includes('strategy')) {
 searchResults.push({
 id:'ai-2',
 title: `How to implement ${query} in your workflow`,
 category:'AI Strategy',
 type:'ai-suggestion',
 link:'#'
});
}
}

 return searchResults;
}, [query]);

 useEffect(() => {
 setSelectedIndex(0);
}, [query, results.length]);

 if (!isOpen) return null;

 const getIcon = (type: SearchResult['type']) => {
 switch (type) {
 case'article': return <FileText className="w-4 h-4" />;
 case'tool': return <PenTool className="w-4 h-4" />;
 case'event': return <Calendar className="w-4 h-4" />;
 case'news': return <Newspaper className="w-4 h-4" />;
 case'ai-suggestion': return <BrainCircuit className="w-4 h-4" />;
 default: return <Search className="w-4 h-4" />;
}
};

 return (
 <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
 <motion.div
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 className="fixed inset-0 bg-black/40 backdrop-blur-sm"
 onClick={onClose}
 />

 <motion.div
 initial={{ scale: 0.95, opacity: 0}}
 animate={{ scale: 1, opacity: 1}}
 exit={{ scale: 0.95, opacity: 0}}
 className="relative w-full max-w-2xl bg-[var(--card-bg)] backdrop-blur-3xl rounded-[32px] shadow-2xl overflow-hidden"
 >
 <div className="flex items-center p-6 gap-4">
 <Search className="w-6 h-6 text-[var(--foreground)]" />
 <input
 autoFocus
 className="flex-1 bg-transparent outline-none text-2xl text-[var(--foreground)] placeholder:text-secondary font-bold"
 placeholder="Search anything..."
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 />
 <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--background)] rounded-md">
 <Command className="w-3 h-3 text-[var(--foreground)]" />
 <span className="text-xs font-black text-[var(--foreground)]">K</span>
 </div>
 <button onClick={onClose}>
 <X className="w-5 h-5 text-[var(--foreground)] hover:text-black" />
 </button>
 </div>

 <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
 {query.length === 0 ? (
 <div className="space-y-6">
 <div className="space-y-4">
 <div className="flex items-center gap-2 text-[var(--foreground)] text-[10px] font-black uppercase tracking-[0.2em]">
 <Sparkles className="w-3.5 h-3.5 text-amber-500" />
 <span>AI Recommended Actions</span>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {[
 { title:"Generate Q4 Strategy", desc:"Using live market data", icon: Zap},
 { title:"Review SEO Health", desc:"Instant site-wide audit", icon: ShieldCheck},
 { title:"Draft News Briefing", desc:"Based on current trends", icon: PenTool},
 { title:"Analyze Competitors", desc:"AI-infused pattern detection", icon: Target}
 ].map((item) => (
 <button key={item.title} className="flex items-center gap-4 p-4 text-left hover:bg-[var(--muted)] rounded-2xl transition-all group hover:">
 <div className="w-10 h-10 rounded-xl bg-hig-blue/10 flex items-center justify-center text-hig-blue group-hover:scale-110 transition-transform">
 <item.icon className="w-5 h-5" />
 </div>
 <div>
 <span className="text-sm font-semibold text-[var(--foreground)] block">{item.title}</span>
 <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">{item.desc}</span>
 </div>
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center gap-2 text-[var(--foreground)] text-[10px] font-black uppercase tracking-[0.2em]">
 <TrendingUp className="w-3.5 h-3.5" />
 <span>Trending Vibe</span>
 </div>
 <div className="flex flex-wrap gap-2">
 {TRENDING.map((tag) => (
 <button
 key={tag}
 onClick={() => setQuery(tag)}
 className="px-4 py-2 bg-[var(--muted)] hover:bg-hig-blue/10 hover:text-hig-blue rounded-full text-sm font-bold transition-all hover:"
 >
 {tag}
 </button>
 ))}
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-1">
 {results.length > 0 ? (
 results.map((result, index) => (
 <Link
 key={result.id}
 href={result.link}
 onClick={onClose}
 className={`w-full flex items-center justify-between p-4 text-left rounded-2xl group transition-all ${ selectedIndex === index ?"bg-[var(--muted)] shadow-sm" :"hover:bg-[var(--muted)] /50"}`}
 >
 <div className="flex items-center gap-4">
 <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${ result.type ==='ai-suggestion' ?"bg-amber-400/10 text-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.2" :"bg-hig-blue/5 text-hig-blue"}`}>
 {getIcon(result.type)}
 </div>
 <div>
 <span className="text-sm font-bold text-[var(--foreground)] block group-hover:text-hig-blue transition-colors">
 {result.title}
 </span>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">{result.category}</span>
 <span className="text-[10px] text-tertiary">•</span>
 <span className={`text-[10px] font-bold uppercase tracking-widest ${result.type ==='ai-suggestion' ?'text-amber-500' :'text-tertiary'}`}>
 {result.type}
 </span>
 </div>
 </div>
 </div>
 <div className={`flex items-center gap-3 transition-all ${selectedIndex === index ?"opacity-100 translate-x-0" :"opacity-0 -translate-x-2"}`}>
 <span className="text-[10px] font-black uppercase tracking-widest text-hig-blue">Open</span>
 <ArrowRight className="w-4 h-4 text-hig-blue" />
 </div>
 </Link>
 ))
 ) : (
 <div className="p-12 text-center space-y-4">
 <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto">
 <Search className="w-8 h-8 text-[var(--foreground)] /20" />
 </div>
 <div className="space-y-1">
 <p className="font-black text-[var(--foreground)]">No results for &quot;{query}&quot;</p>
 <p className="text-sm text-[var(--foreground)] /60">Try searching for &quot;AI&quot;, &quot;SEO&quot;, or &quot;PR&quot;.</p>
 </div>
 </div>
 )}
 </div>
 )}
 </div>

 <div className="bg-[var(--muted)] /50 p-4 flex justify-between items-center">
 <p className="text-[10px] text-[var(--foreground)]">Press Esc to close</p>
 <div className="flex gap-4">
 <div className="flex items-center gap-1">
 <span className="text-[10px] text-[var(--foreground)]">Powered by Rusability AI</span>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 );
};
