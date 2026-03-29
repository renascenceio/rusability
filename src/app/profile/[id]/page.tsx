"use client";

"use client";

import { User, Settings, Sparkles, Heart, Clock, Sliders, ChevronRight, TrendingUp, Users, Target, Edit3, BookOpen, MessageCircle, FileText, Trash2, Shield, Bell, ArrowRight} from"lucide-react";
import { CURRENT_USER} from"@/lib/data";
import Link from"next/link";
import { useState} from"react";
import { useTranslation } from "@/lib/i18n/context";

export default function ProfilePage() {
 const { t } = useTranslation();
 const user = CURRENT_USER;
 type TabId ="saved" |"drafts" |"published" |"activity";
 const [activeTab, setActiveTab] = useState<TabId>("saved");
 const isPro = user.membership ==="pro";
 const INTERESTS = user.interests;

 const tabs: { id: TabId; label: string; icon: React.ElementType}[] = [
 { id:"saved", label: t("profile.savedArticles"), icon: Heart},
 { id:"drafts", label: t("profile.myDrafts"), icon: FileText},
 { id:"published", label: t("profile.published"), icon: BookOpen},
 { id:"activity", label: t("profile.activity"), icon: TrendingUp},
 ];

 const contentMap = {
 saved: [
 { title:"The Shift in SEO Strategy for 2024", time:"5 min read", cat:"Search Strategy", date:"Saved 2 days ago"},
 { title:"Generative AI for Media Outreach", time:"8 min read", cat:"Public Relations", date:"Saved 1 week ago"},
 { title:"Brand Safety in the Age of LLMs", time:"12 min read", cat:"Brand Protection", date:"Saved 2 weeks ago"},
 ],
 drafts: [
 { title:"Future of Content Economics", time:"Pending Review", cat:"Monetization", status:"Reviewing"},
 { title:"My PR Strategy for Q3", time:"Draft", cat:"Public Relations", status:"Work in progress"},
 ],
 published: [
 { title:"How to simulate focus groups with AI", time:"15 min read", cat:"AI Marketing", views:"12.4K", date:"Jan 12, 2024"},
 ],
 activity: [
 { action:"Commented on", target:"Why SEO is still relevant", date:"2 hours ago"},
 { action:"Upvoted", target:"New Marketing Tools for 2024", date:"Yesterday"},
 { action:"Started following", target:"Elena Vance", date:"3 days ago"},
 ]
};

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
 <header className="mb-16 flex flex-col md:flex-row items-center gap-12">
 <div className="relative group">
 <div className="w-32 h-32 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden">
 <User className="w-16 h-16 text-tertiary group-hover:scale-110 transition-transform" />
 </div>
 <button className="absolute bottom-0 right-0 p-2 bg-[var(--card-bg-solid)] rounded-full shadow-lg text-hig-blue hover:scale-110 transition-transform">
 <Edit3 className="w-4 h-4" />
 </button>
 </div>
 <div className="flex-1 space-y-6 text-center md:text-left">
 <div className="space-y-2">
 <div className="flex flex-col md:flex-row items-center gap-4">
 <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">{user.name}</h1>
 {isPro && (
 <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">
 {t("profile.proMember")}
 </div>
 )}
 </div>
 <p className="text-xl text-secondary font-medium leading-relaxed max-w-2xl">
 {user.role}. {user.bio}
 </p>
 </div>
 <div className="flex items-center justify-center md:justify-start gap-4">
 <button className="hig-button-primary px-8">{t("profile.follow")}</button>
 <button className="hig-button-secondary flex items-center gap-2">
 <Settings className="w-4 h-4" />
 {t("profile.account")}
 </button>
 <button className="p-3 rounded-full text-secondary hover:text-hig-blue transition-colors">
 <Bell className="w-5 h-5" />
 </button>
 </div>
 </div>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-16">
 <section className="space-y-12">
 <div>
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`font-bold uppercase tracking-widest text-xs pb-4 whitespace-nowrap transition-all ${ activeTab === tab.id ?"text-hig-blue" :"text-secondary hover:text-[var(--foreground)]"}`}
 >
 {tab.label}
 </button>
 ))}
 </div>
 <Link href="/editor" className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-hig-blue hover:underline mb-4">
 <Edit3 className="w-4 h-4" /> {t("profile.newArticle")}
 </Link>
 </div>

 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
 {activeTab ==="saved" && contentMap.saved.map((article) => (
 <div key={article.title} className="hig-card p-6 flex items-center justify-between group">
 <div className="space-y-2">
 <h3 className="font-bold text-lg group-hover:text-hig-blue transition-colors text-[var(--foreground)]">{article.title}</h3>
 <div className="flex items-center gap-4 text-[10px] text-tertiary font-bold uppercase tracking-widest">
 <span className="text-hig-blue">{article.cat}</span>
 <span className="flex items-center gap-1.5 text-secondary"><Clock className="w-3.5 h-3.5 text-hig-blue" /> {article.time}</span>
 <span>{article.date}</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button className="p-3 text-rose-500 bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
 <Trash2 className="w-4 h-4" />
 </button>
 <button className="p-3 text-secondary hover:text-hig-blue bg-[var(--muted)] rounded-xl transition-all">
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 </div>
 ))}

 {activeTab ==="drafts" && contentMap.drafts.map((article) => (
 <Link href="/editor" key={article.title} className="hig-card p-6 flex items-center justify-between group bg-[var(--background)] shadow-none hover:">
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <h3 className="font-black text-lg group-hover:text-hig-blue transition-colors text-[var(--foreground)]">{article.title}</h3>
 <span className="text-[8px] font-black uppercase bg-amber-400/10 text-amber-600 px-2 py-0.5 rounded">{article.status}</span>
 </div>
 <div className="flex items-center gap-4 text-[10px] text-[var(--foreground)] font-black uppercase tracking-widest">
 <span className="text-hig-blue">{article.cat}</span>
 <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{t("profile.updatedToday")}</span>
 </div>
 </div>
 <div className="p-3 text-hig-blue bg-hig-blue/5 rounded-xl transition-all group-hover:scale-110">
 <Edit3 className="w-5 h-5" />
 </div>
 </Link>
 ))}

 {activeTab ==="published" && contentMap.published.map((article) => (
 <div key={article.title} className="hig-card p-6 flex items-center justify-between group bg-[var(--background)] shadow-none hover:">
 <div className="space-y-2">
 <h3 className="font-black text-lg group-hover:text-hig-blue transition-colors text-[var(--foreground)]">{article.title}</h3>
 <div className="flex items-center gap-4 text-[10px] text-[var(--foreground)] font-black uppercase tracking-widest">
 <span className="text-hig-blue">{article.cat}</span>
 <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {article.views} {t("profile.views")}</span>
 <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{article.date}</span>
 </div>
 </div>
 <button className="p-3 text-[var(--foreground)] hover:text-hig-blue bg-[var(--background)] rounded-xl transition-all">
 <ArrowRight className="w-5 h-5" />
 </button>
 </div>
 ))}

 {activeTab ==="activity" && contentMap.activity.map((item, i) => (
 <div key={i} className="flex items-center gap-6 p-4 hover: transition-colors">
 <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center shrink-0">
 {item.action.includes("Comment") ? <MessageCircle className="w-4 h-4 text-hig-blue" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
 </div>
 <div className="flex-1">
 <p className="text-sm font-black">
 <span className="text-[var(--foreground)] dark:text-[var(--foreground)]">{item.action}</span> <span className="text-[var(--foreground)] underline underline-offset-4 decoration-[var(--foreground)] /20">{item.target}</span>
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
 <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-[var(--foreground)]">
 <BookOpen className="w-6 h-6 text-hig-blue" />
 {t("profile.performancePulse")}
 </h3>
 <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[10px] font-bold uppercase tracking-widest">{t("profile.liveOptimization")}</span>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="hig-card p-8 space-y-4 relative overflow-hidden group">
 <div className="flex items-center gap-2 text-secondary group-hover:text-hig-blue transition-colors">
 <TrendingUp className="w-4 h-4" />
 <span className="text-[10px] font-bold uppercase tracking-widest">{t("profile.totalReadership")}</span>
 </div>
 <p className="text-4xl font-bold text-[var(--foreground)]">42.8K</p>
 <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
 <TrendingUp className="w-3 h-3" /> +12% week
 </div>
 </div>
 <div className="hig-card p-8 space-y-4 group">
 <div className="flex items-center gap-2 text-secondary group-hover:text-hig-blue transition-colors">
 <Target className="w-4 h-4" />
 <span className="text-[10px] font-bold uppercase tracking-widest">{t("profile.conversionRate")}</span>
 </div>
 <p className="text-4xl font-bold text-[var(--foreground)]">8.2%</p>
 <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase">
 {t("profile.peakPerformance")}
 </div>
 </div>
 <div className="hig-card p-8 space-y-4 group">
 <div className="flex items-center gap-2 text-secondary group-hover:text-hig-blue transition-colors">
 <Users className="w-4 h-4" />
 <span className="text-[10px] font-bold uppercase tracking-widest">{t("profile.totalFollowers")}</span>
 </div>
 <p className="text-4xl font-bold text-[var(--foreground)]">12.1K</p>
 <div className="flex items-center gap-1.5 text-secondary font-bold text-[10px] uppercase">
 {t("profile.growingNetwork")}
 </div>
 </div>
 </div>
 </div>
 )}
 </section>

 <aside className="space-y-12">
 <div className="hig-card p-8">
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-lg font-bold uppercase tracking-widest text-secondary">{t("profile.interests")}</h3>
 <button className="p-2 text-secondary hover:text-hig-blue transition-colors">
 <Sliders className="w-4 h-4" />
 </button>
 </div>

 <div className="flex flex-wrap gap-2">
 {INTERESTS.map((tag) => (
 <span key={tag} className="bg-[var(--muted)] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary hover: hover:text-hig-blue transition-all cursor-pointer">
 {tag}
 </span>
 ))}
 </div>

 <button className="w-full mt-10 hig-button-secondary py-3 text-xs uppercase tracking-[0.2em] font-bold">{t("profile.addTopic")}</button>
 </div>

 <div className="p-8 hig-card bg-[var(--foreground)] text-[var(--background)] relative overflow-hidden group">
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-8">
 <div className="w-10 h-10 rounded-xl bg-hig-blue flex items-center justify-center shadow-lg shadow-hig-blue/20">
 <Shield className="w-5 h-5 text-white" />
 </div>
 <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[var(--background)]">{t("profile.professionalIdentity")}</h3>
 </div>
 <div className="space-y-6">
 <div className="space-y-2">
 <span className="text-[9px] font-black uppercase tracking-widest text-hig-blue">{t("profile.primaryToolkit")}</span>
 <div className="flex items-center gap-4">
 <span className="text-sm font-bold">Persona AI</span>
 <div className="h-1 flex-1 bg-[var(--background)] /10 rounded-full overflow-hidden">
 <div className="h-full w-[85%] bg-hig-blue" />
 </div>
 </div>
 </div>
 <div className="space-y-2">
 <div className="flex items-center gap-4">
 <span className="text-sm font-bold">Metric Flow</span>
 <div className="h-1 flex-1 bg-[var(--background)] /10 rounded-full overflow-hidden">
 <div className="h-full w-[60%] bg-emerald-500" />
 </div>
 </div>
 </div>
 </div>
 <button className="w-full mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--background)] hover:text-hig-blue transition-colors pb-4 text-left flex items-center justify-between group">
 {t("profile.certifications")} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 <div className="absolute top-0 right-0 w-32 h-32 bg-hig-blue/20 blur-[80px] -z-0" />
 </div>
 </aside>
 </div>
 </div>
 );
}
