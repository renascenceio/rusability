"use client";

import { useState } from "react";
import {
 Users,
 FileText,
 Globe,
 Settings2,
 Palette,
 Eye,
 UserPlus,
 Search,
 Sparkles,
 Zap,
 MoreVertical,
 Flag,
 PenTool,
 ShieldCheck,
 SearchCode,
 LineChart,
 Target,
 ArrowUpRight,
 Plus,
 Rss,
 Activity,
 Wand2,
 CheckCircle2,
 Link as LinkIcon,
 RefreshCw,
 Save
} from"lucide-react";
import Image from"next/image";
import { useTranslation } from "@/lib/i18n/context";

export default function AdminDashboard() {
 const { t } = useTranslation();
 const [activeTab] = useState("analytics");
 const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState("overview");
 const [searchQuery, setSearchQuery] = useState("");

 // Mock functional states
 const [users, setUsers] = useState([
 { id: 1, name:"John Smith", email:"john@cloudscale.io", role:"free", active:"10m ago", score: 84, img:"https://images.unsplash.com/photo-1599566150163-29194dcaad36"},
 { id: 2, name:"Sarah Connor", email:"sarah@cyberdyne.net", role:"pro", active:"Now", score: 98, img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330"},
 { id: 3, name:"David Miller", email:"david@marketing.pro", role:"pro", active:"2h ago", score: 92, img:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"},
 { id: 4, name:"Emily Watson", email:"emily@gmail.com", role:"free", active:"1d ago", score: 45, img:"https://images.unsplash.com/photo-1580489944761-15a19d654956"},
 { id: 5, name:"Michael Chang", email:"m.chang@techhub.com", role:"pro", active:"Now", score: 89, img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"},
 ]);

 const togglePro = (userId: number) => {
 setUsers(users.map(u => u.id === userId ? { ...u, role: u.role ==='pro' ?'free' :'pro'} : u));
};

 return (
 <div className="p-10">

 {/* Analytics Engine */}
 {activeTab ==="analytics" && (
 <div className="space-y-12 animate-in fade-in duration-700">
 <div className="flex items-end justify-between pb-10">
 <header className="space-y-2">
 <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
 <LineChart className="w-4 h-4" />
 {t("admin.analyticsIntel")}
 </div>
 <h1 className="text-5xl font-bold tracking-tighter leading-none text-[var(--foreground)] hover:text-hig-blue cursor-default transition-colors">{t("admin.systemVelocity")}.</h1>
 </header>
 <div className="flex bg-[var(--muted)] p-1.5 rounded-2xl shadow-sm">
 {["overview","users","authors","content"].map((sub) => (
 <button
 key={sub}
 onClick={() => setActiveAnalyticsSubTab(sub)}
 className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${ activeAnalyticsSubTab === sub ?"bg-[var(--card-bg-solid)] text-hig-blue shadow-lg" :"text-secondary hover:text-[var(--foreground)]"}`}
 >
 {sub}
 </button>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
 {[
 { label:"Active Users", val:"12,482", change:"+14.2%", icon: Users, color:"text-hig-blue"},
 { label:"Page Views", val:"1.2M", change:"+5.1%", icon: Eye, color:"text-purple-500"},
 { label:"Avg Engagement", val:"8.4m", change:"+2.4%", icon: Zap, color:"text-amber-500"},
 { label:"New Content", val:"142", change:"+24.0%", icon: PenTool, color:"text-emerald-500"},
 ].map((stat, i) => (
 <div key={i} className="hig-card p-10 flex flex-col justify-between h-56">
 <div className="flex items-center justify-between">
 <div className={`p-3 rounded-2xl ${stat.color.replace('text-','bg-')}/10 ${stat.color}`}>
 <stat.icon className="w-6 h-6" />
 </div>
 <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full">{stat.change}</span>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{stat.label}</p>
 <p className="text-5xl font-black tracking-tighter text-[var(--foreground)]">{stat.val}</p>
 </div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 <div className="lg:col-span-2 hig-card p-10 h-[500px] flex flex-col justify-between">
 <div className="flex items-center justify-between mb-10">
 <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3 italic text-[var(--foreground)]">
 {t("admin.trafficFlow")}
 </h3>
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-hig-blue animate-pulse" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{t("admin.liveStream")}</span>
 </div>
 </div>
 <div className="flex-1 flex items-end gap-4 pb-8">
 {[40, 60, 45, 90, 65, 80, 55, 75, 95, 100, 85, 70, 90, 80, 60, 40].map((h, i) => (
 <div key={i} className="flex-1 bg-[var(--muted)] rounded-t-[20px] relative group transition-all">
 <div style={{ height: `${h}%`}} className="w-full bg-hig-blue/40 group-hover:bg-hig-blue transition-all duration-500 rounded-t-[20px] relative">
 <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-t from-transparent to-[var(--background)] /10 rounded-t-[20px]" />
 </div>
 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-3 py-1.5 rounded-xl text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
 {h}k
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="hig-card p-10 h-[500px] flex flex-col">
 <div className="flex items-center justify-between mb-10 pb-6">
 <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3 italic text-[var(--foreground)]">
 {t("admin.topPerformers")}
 </h3>
 <Sparkles className="w-5 h-5 text-amber-500" />
 </div>
 <div className="space-y-6 overflow-y-auto pr-4 no-scrollbar flex-1">
 {[
 { name:"Elena Rossi", views:"142k", engagement:"9.2%", img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330"},
 { name:"Marc Dubois", views:"98k", engagement:"8.7%", img:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"},
 { name:"Amina Kadi", views:"74k", engagement:"9.5%", img:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"},
 { name:"Sarah Jenkins", views:"62k", engagement:"8.1%", img:"https://images.unsplash.com/photo-1580489944761-15a19d654956"},
 { name:"David Chen", views:"54k", engagement:"7.8%", img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"},
 ].map((author, i) => (
 <div key={i} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl transition-all hover:bg-hig-blue/5">
 <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
 <Image src={`${author.img}?auto=format&fit=crop&q=80&w=100`} alt={author.name} fill className="object-cover" />
 </div>
 <div className="flex-1">
 <p className="font-bold text-sm text-[var(--foreground)] group-hover:text-hig-blue transition-colors">{author.name}</p>
 <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest">{author.views} Views • {author.engagement} Eng</p>
 </div>
 <ArrowUpRight className="w-4 h-4 text-tertiary group-hover:text-hig-blue group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* AI Auto-Editor Protocol */}
 {activeTab ==="ai-moderation" && (
 <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
 <header className="flex items-end justify-between pb-10">
 <div className="space-y-2">
 <div className="flex items-center gap-3 text-rose-500 text-[10px] font-bold uppercase tracking-[0.3em]">
 <Flag className="w-4 h-4" />
 {t("admin.safetyProtocol")}
 </div>
 <h1 className="text-5xl font-bold tracking-tighter leading-none text-[var(--foreground)]">{t("admin.autonomousGuard")}.</h1>
 </div>
 <div className="flex gap-4">
 <div className="flex items-center gap-4 bg-[var(--muted)] px-6 py-3 rounded-2xl">
 <div className="flex -space-x-2">
 {[1,2,3].map(i => (
 <div key={i} className="w-6 h-6 rounded-full bg-[var(--background)]" />
 ))}
 </div>
 <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">3 AI Agents Active</span>
 </div>
 <button className="hig-button-primary">{t("admin.syncCore")}</button>
 </div>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
 <div className="lg:col-span-3 space-y-10">
 {/* Shield Definitions Panel */}
 <div className="hig-card p-10 space-y-10">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <ShieldCheck className="w-8 h-8 text-hig-blue" />
 <h3 className="font-bold text-2xl italic text-[var(--foreground)]">Shield Definitions</h3>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Protection Active</span>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {[
 { name: "NSFW Shield", desc: "Blocks explicit sexual imagery or language.", rules: "Neural vision analysis + NLP keyword density.", status: true },
 { name: "Substance Shield", desc: "Flags content promoting tobacco, alcohol, or drugs.", rules: "Object detection + context analysis.", status: true },
 { name: "Gambling Shield", desc: "Blocks casino gambling, sports betting, or similar.", rules: "Pattern matching for betting terminology.", status: true },
 { name: "Plagiarism Guard", desc: "Detects duplicate or non-original content.", rules: "Cross-platform semantic fingerprinting.", status: true }
 ].map((shield, i) => (
 <div key={i} className="p-6 rounded-3xl bg-[var(--muted)]/50 group hover:bg-hig-blue/5 transition-all space-y-4">
 <div className="flex items-start justify-between">
 <div className="space-y-1">
 <h4 className="font-bold text-[var(--foreground)]">{shield.name}</h4>
 <p className="text-xs text-secondary font-medium leading-relaxed">{shield.desc}</p>
 </div>
 <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${shield.status ? "bg-emerald-500" : "bg-tertiary/20"}`}>
 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${shield.status ? "translate-x-5" : "translate-x-0"}`} />
 </div>
 </div>
 <div className="pt-4 border-t border-[var(--foreground)]/5">
 <p className="text-[9px] font-black uppercase tracking-widest text-tertiary">Core Logic</p>
 <p className="text-[11px] font-bold text-[var(--foreground)] mt-1">{shield.rules}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="hig-card overflow-hidden">
 <div className="bg-[var(--muted)] p-6 flex items-center justify-between">
 <div className="flex items-center gap-6">
 <h3 className="font-bold text-sm uppercase tracking-widest text-secondary">Action Log</h3>
 <div className="flex items-center gap-2 bg-[var(--card-bg-solid)] px-3 py-1.5 rounded-xl">
 <SearchCode className="w-3.5 h-3.5 text-tertiary" />
 <input placeholder="Search..." className="bg-transparent outline-none text-[11px] w-40 font-bold text-[var(--foreground)]" />
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-[var(--card-bg-solid)] text-tertiary hover:text-hig-blue transition-colors">Clear</button>
 <button className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-hig-blue text-white shadow-sm">Export</button>
 </div>
 </div>
                        <div className="space-y-4 p-4">
 {[
 { user:"User_842", reason:"Potential Hate Speech", confidence:"94%", status:"Blocked", time:"12m ago", severity:"high"},
 { user:"Bot_A9", reason:"DDoS Attempt Pattern", confidence:"99%", status:"Shadowbanned", time:"42m ago", severity:"critical"},
 { user:"Author_X", reason:"Copyright Infringement", confidence:"87%", status:"Restricted", time:"2h ago", severity:"medium"},
 { user:"User_221", reason:"Spam Injection", confidence:"92%", status:"Deleted", time:"5h ago", severity:"high"},
 { user:"Anon_99", reason:"Policy Violation", confidence:"76%", status:"Flagged", time:"8h ago", severity:"low"},
 ].map((log, i) => (
                             <div key={i} className="p-8 flex items-center justify-between group hover:bg-hig-blue/5 transition-all rounded-3xl bg-[var(--muted)]/30">
 <div className="flex items-center gap-6">
 <div className={`w-3 h-3 rounded-full animate-pulse ${ log.severity ==='critical' ?'bg-rose-600' : log.severity ==='high' ?'bg-rose-400' : log.severity ==='medium' ?'bg-amber-400' :'bg-hig-blue'}`} />
 <div className="space-y-1">
 <div className="flex items-center gap-4">
 <span className="font-bold text-sm text-[var(--foreground)]">{log.user}</span>
 <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-bold uppercase tracking-widest">{log.reason}</span>
 </div>
 <p className="text-[10px] text-tertiary font-bold uppercase tracking-[0.2em]">Confidence {log.confidence} • Signature Verified</p>
 </div>
 </div>
 <div className="flex items-center gap-8">
 <div className="text-right">
 <span className="text-[11px] font-bold uppercase text-[var(--foreground)] block mb-1">{log.status}</span>
 <span className="text-[10px] text-tertiary font-bold">{log.time}</span>
 </div>
 <button className="p-3 rounded-2xl bg-[var(--muted)] text-secondary hover:text-hig-blue transition-all"><MoreVertical className="w-5 h-5" /></button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-10">
 <div className="hig-card p-8 space-y-8">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Block Categories</h4>
 <div className="space-y-6">
 {[
 { label: "User Blocks", val: 12, color: "text-rose-500" },
 { label: "Content Blocks", val: 84, color: "text-amber-500" }
 ].map((cat, i) => (
 <div key={i} className="space-y-2">
 <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
 <span className="text-secondary">{cat.label}</span>
 <span className={cat.color}>{cat.val}</span>
 </div>
 <div className="h-1 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
 <div style={{ width: `${(cat.val / (cat.val + 50)) * 100}%` }} className={`h-full ${cat.color.replace('text-', 'bg-')}`} />
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="hig-card p-8 bg-[var(--muted)]/50 space-y-6">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Shield Status</h4>
 <div className="space-y-3">
 {["Hate Speech", "Spam", "Self-Promo"].map(s => (
 <div key={s} className="flex items-center justify-between">
 <span className="text-xs font-bold text-[var(--foreground)]">{s}</span>
 <div className="w-2 h-2 rounded-full bg-emerald-500" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* User & Permission Management */}
 {activeTab ==="users" && (
 <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
 <header className="flex items-end justify-between pb-10">
 <div className="space-y-2">
 <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
 <Target className="w-4 h-4" />
 {t("admin.networkIntel")}
 </div>
 <h1 className="text-5xl font-bold tracking-tighter leading-none text-[var(--foreground)]">{t("admin.accessControl")}.</h1>
 </div>
 <div className="flex flex-col md:flex-row items-center gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
 <input
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search users by name or email..."
 className="w-full bg-[var(--muted)] rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-hig-blue/20 transition-all text-[var(--foreground)]"
 />
 </div>
 <div className="flex items-center gap-3">
 <select className="bg-[var(--muted)] rounded-xl py-3 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none border-none">
 <option>Account Type: All</option>
 <option>Free</option>
 <option>Pro</option>
 </select>
 <select className="bg-[var(--muted)] rounded-xl py-3 px-6 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none border-none">
 <option>Status: Active</option>
 <option>Suspended</option>
 <option>Banned</option>
 </select>
 <button className="hig-button-primary flex items-center gap-3 px-6">
 <UserPlus className="w-5 h-5" />
 <span className="text-[10px] uppercase tracking-widest">{t("admin.newUser")}</span>
 </button>
 </div>
 </div>
 </header>

 <div className="hig-card overflow-hidden shadow-xl">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-[var(--muted)] text-[9px] font-black uppercase tracking-[0.3em] text-secondary">
 <th className="px-10 py-6">User Entity</th>
 <th className="px-10 py-6">Authorization Status</th>
 <th className="px-10 py-6">Connection</th>
 <th className="px-10 py-6">Metrics</th>
 <th className="px-10 py-6 text-right">Administrative</th>
 </tr>
 </thead>
                     <tbody>
 {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user, i) => (
 <tr key={i} className="group hover:bg-hig-blue/[0.02] transition-all border-none">
 <td className="px-10 py-6">
 <div className="flex items-center gap-5">
 <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
 <Image src={`${user.img}?auto=format&fit=crop&q=80&w=100`} alt={user.name} fill className="object-cover" />
 </div>
 <div>
 <p className="font-black text-sm text-[var(--foreground)] group-hover:text-hig-blue transition-colors">{user.name}</p>
 <p className="text-[10px] text-tertiary font-bold tracking-tight">{user.email}</p>
 </div>
 </div>
 </td>
 <td className="px-10 py-6">
 <button
 onClick={() => togglePro(user.id)}
 className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 ${ user.role ==='pro' ?"bg-amber-400 text-white shadow-lg shadow-amber-400/20" :"bg-[var(--muted)] text-secondary hover:text-amber-500"}`}
 >
 {user.role} Authorization
 </button>
 </td>
 <td className="px-10 py-6">
 <div className="flex items-center gap-3">
 <span className={`w-1.5 h-1.5 rounded-full ${user.active ==='Now' ?'bg-emerald-500 animate-pulse' :'bg-tertiary/20'}`} />
 <span className="text-[11px] font-bold text-secondary">{user.active}</span>
 </div>
 </td>
 <td className="px-10 py-6">
 <div className="flex items-center gap-4">
 <div className="flex-1 h-1 bg-[var(--muted)] rounded-full overflow-hidden min-w-[100px]">
 <div style={{ width: `${user.score}%`}} className={`h-full rounded-full transition-all duration-1000 ${user.score > 80 ?'bg-emerald-500' :'bg-hig-blue'}`} />
 </div>
 <span className="text-[11px] font-black text-secondary">{user.score}</span>
 </div>
 </td>
 <td className="px-10 py-6 text-right">
 <div className="flex items-center justify-end gap-3">
 <button className="p-3 rounded-2xl bg-[var(--card-bg-solid)] text-tertiary hover:text-hig-blue hover:shadow-lg transition-all"><Settings2 className="w-5 h-5" /></button>
 <button className="p-3 rounded-2xl bg-[var(--card-bg-solid)] text-tertiary hover:text-rose-500 hover:shadow-lg transition-all"><Flag className="w-5 h-5" /></button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* News Automation Hub */}
 {activeTab ==="news-auto" && (
 <div className="space-y-12 animate-in fade-in duration-700">
 <header className="flex items-end justify-between pb-10">
 <div className="space-y-2">
 <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
 <Rss className="w-4 h-4" />
 {t("admin.tab.news")} Management
 </div>
 <h1 className="text-5xl font-bold tracking-tighter leading-none text-[var(--foreground)]">News Engine.</h1>
 </div>
 <button className="hig-button-primary flex items-center gap-3">
 <Plus className="w-4 h-4" /> Add Source
 </button>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 <div className="lg:col-span-2 space-y-10">
 {/* Sources List */}
 <div className="hig-card overflow-hidden">
 <div className="bg-[var(--muted)] p-6 border-b border-[var(--foreground)]/5 flex items-center justify-between">
 <h3 className="font-bold text-sm uppercase tracking-widest text-secondary">Active Sources</h3>
 <span className="text-[10px] font-bold bg-hig-blue/10 text-hig-blue px-3 py-1 rounded-full">4 Feeds Online</span>
 </div>
 <div className="divide-y divide-[var(--foreground)]/5">
 {[
 { name: "Marketing Land RSS", type: "RSS", freq: "Every 30m", status: "Healthy", last: "2m ago" },
 { name: "Google News API", type: "API", freq: "Every 1h", status: "Healthy", last: "45m ago" },
 { name: "AdWeek Global", type: "RSS", freq: "Every 6h", status: "Warning", last: "1d ago" },
 { name: "Twitter PR Pulse", type: "API", freq: "Real-time", status: "Healthy", last: "Now" }
 ].map((s, i) => (
 <div key={i} className="p-6 flex items-center justify-between group hover:bg-hig-blue/[0.02] transition-colors">
 <div className="flex items-center gap-4">
 <div className="p-3 rounded-xl bg-[var(--muted)] text-secondary group-hover:text-hig-blue transition-colors">
 {s.type === "RSS" ? <Rss className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
 </div>
 <div>
 <h4 className="font-bold text-[var(--foreground)]">{s.name}</h4>
 <div className="flex items-center gap-3 text-[10px] font-bold text-tertiary uppercase tracking-widest">
 <span>{s.type} Feed</span>
 <span>•</span>
 <span>{s.freq}</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-8">
 <div className="text-right">
 <div className="flex items-center gap-2 justify-end">
 <span className={`w-2 h-2 rounded-full ${s.status === "Healthy" ? "bg-emerald-500" : "bg-amber-500"}`} />
 <span className="text-[11px] font-bold text-[var(--foreground)]">{s.status}</span>
 </div>
 <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest">Last Fetch: {s.last}</p>
 </div>
 <button className="p-2.5 rounded-xl bg-[var(--muted)] text-secondary hover:text-hig-blue transition-all"><Settings2 className="w-4 h-4" /></button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Processing Queue */}
 <div className="hig-card overflow-hidden">
 <div className="bg-[var(--muted)] p-6 border-b border-[var(--foreground)]/5 flex items-center justify-between">
 <h3 className="font-bold text-sm uppercase tracking-widest text-secondary">Pending Briefings</h3>
 <div className="flex items-center gap-2">
 <button className="p-2 text-secondary hover:text-hig-blue"><RefreshCw className="w-4 h-4" /></button>
 </div>
 </div>
 <div className="p-4 space-y-4">
 {[
 { title: "Apple expands privacy tracking on iOS 18", source: "TechCrunch", score: 98, time: "12m ago" },
 { title: "The rise of zero-click searches in 2024", source: "Search Engine Land", score: 84, time: "45m ago" }
 ].map((item, i) => (
 <div key={i} className="p-6 rounded-2xl bg-[var(--muted)]/30 group hover:bg-hig-blue/5 transition-all">
 <div className="flex items-start justify-between mb-4">
 <div className="space-y-1">
 <span className="text-[10px] font-bold uppercase text-hig-blue tracking-widest">{item.source}</span>
 <h4 className="font-bold text-[var(--foreground)] group-hover:text-hig-blue transition-colors">{item.title}</h4>
 </div>
 <div className="text-right">
 <span className="text-lg font-bold text-hig-blue">{item.score}%</span>
 <p className="text-[9px] font-bold text-tertiary uppercase tracking-widest">Match</p>
 </div>
 </div>
 <div className="flex items-center justify-between pt-4 border-t border-[var(--foreground)]/5">
 <span className="text-[10px] text-tertiary font-bold uppercase tracking-widest">Fetched {item.time}</span>
 <div className="flex gap-2">
 <button className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase bg-[var(--card-bg-solid)] text-secondary hover:text-hig-blue">Review</button>
 <button className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase bg-hig-blue text-white shadow-sm flex items-center gap-2">
 <Wand2 className="w-3 h-3" /> Rewrite as Briefing
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-10">
 <div className="hig-card p-8 bg-hig-blue text-white space-y-6 relative overflow-hidden shadow-lg shadow-hig-blue/20">
 <div className="relative z-10 space-y-4">
 <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
 <Activity className="w-6 h-6 text-white" />
 </div>
 <h3 className="text-xl font-bold italic">Automation Status</h3>
 <div className="space-y-3 pt-2">
 <div className="flex justify-between items-center">
 <span className="text-xs font-bold uppercase tracking-widest opacity-70">Auto-Rewrite</span>
 <div className="w-8 h-4 bg-white/20 rounded-full flex items-center px-0.5">
 <div className="w-3 h-3 bg-white rounded-full ml-auto" />
 </div>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-xs font-bold uppercase tracking-widest opacity-70">Auto-Publish</span>
 <div className="w-8 h-4 bg-white/20 rounded-full flex items-center px-0.5">
 <div className="w-3 h-3 bg-white rounded-full" />
 </div>
 </div>
 </div>
 </div>
 <Zap className="absolute -bottom-10 -right-10 w-40 h-40 text-white/10 -rotate-12" />
 </div>

 <div className="hig-card p-8 space-y-6">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Recently Published</h4>
 <div className="space-y-4">
 {[
 { title: "Google Core Update Live", time: "2h ago", views: "12.4k" },
 { title: "Meta VR Workspace Launch", time: "5h ago", views: "8.2k" }
 ].map((n, i) => (
 <div key={i} className="group cursor-pointer">
 <h5 className="text-sm font-bold text-[var(--foreground)] group-hover:text-hig-blue transition-colors line-clamp-1">{n.title}</h5>
 <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-tertiary uppercase tracking-widest">
 <span>{n.time}</span>
 <span>•</span>
 <span>{n.views} Views</span>
 </div>
 </div>
 ))}
 </div>
 <button className="w-full py-3 bg-[var(--muted)] text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-hig-blue transition-colors">Manage All News</button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* AI Article Engine Hub */}
 {activeTab ==="content" && (
 <div className="space-y-12 animate-in fade-in duration-700">
 <header className="flex items-end justify-between pb-10">
 <div className="space-y-2">
 <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
 <PenTool className="w-4 h-4" />
 {t("admin.tab.articles")} Engine
 </div>
 <h1 className="text-5xl font-bold tracking-tighter leading-none text-[var(--foreground)]">Automation Hub.</h1>
 </div>
 <button className="hig-button-primary flex items-center gap-3">
 <Sparkles className="w-4 h-4" /> New AI Article
 </button>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 <div className="lg:col-span-2 space-y-10">
 {/* Generation Interface */}
 <div className="hig-card p-10 space-y-8">
 <div className="space-y-2">
 <h3 className="text-2xl font-bold italic text-[var(--foreground)]">Generate from Title</h3>
 <p className="text-secondary text-sm font-medium">Input one or multiple titles to trigger the end-to-end AI creation pipeline.</p>
 </div>
 <div className="space-y-6">
 <textarea
 placeholder="Enter article titles (one per line)..."
 className="w-full bg-[var(--muted)] rounded-2xl p-6 font-bold text-lg text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20 min-h-[160px] resize-none"
 />
 <div className="grid grid-cols-2 gap-4">
 <select className="bg-[var(--muted)] rounded-xl p-4 text-xs font-bold uppercase text-[var(--foreground)] outline-none">
 <option>Formal Editorial</option>
 <option>Casual / Social</option>
 <option>Technical Depth</option>
 </select>
 <button className="hig-button-primary flex items-center justify-center gap-3">
 <Zap className="w-4 h-4" /> Trigger AI Pipeline
 </button>
 </div>
 </div>
 </div>

 {/* Pipeline Tracking */}
 <div className="hig-card overflow-hidden">
 <div className="bg-[var(--muted)] p-6 flex items-center justify-between">
 <h3 className="font-bold text-sm uppercase tracking-widest text-secondary">Active Pipeline</h3>
 </div>
 <div className="p-4 space-y-4">
 {[
 { title: "Future of Content Economics", status: "Generating", progress: 65 },
 { title: "Zero-Click Search Recovery", status: "Review", progress: 100 },
 { title: "PR Strategies for 2026", status: "Queued", progress: 0 }
 ].map((job, i) => (
 <div key={i} className="p-6 rounded-2xl bg-[var(--muted)]/30 group">
 <div className="flex items-center justify-between mb-4">
 <h4 className="font-bold text-[var(--foreground)]">{job.title}</h4>
 <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${job.status === "Generating" ? "bg-hig-blue/10 text-hig-blue" : job.status === "Review" ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--foreground)]/5 text-tertiary"}`}>
 {job.status}
 </span>
 </div>
 <div className="h-1.5 w-full bg-[var(--card-bg-solid)] rounded-full overflow-hidden">
 <div
 style={{ width: `${job.progress}%` }}
 className={`h-full transition-all duration-1000 ${job.status === "Review" ? "bg-emerald-500" : "bg-hig-blue"}`}
 />
 </div>
 {job.status === "Review" && (
 <div className="mt-4 flex gap-2">
 <button className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase bg-hig-blue text-white shadow-sm">Open Review Editor</button>
 <button className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase bg-[var(--card-bg-solid)] text-secondary">Regenerate</button>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-10">
 <div className="hig-card p-8 space-y-6">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Pipeline Stats</h4>
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-[var(--foreground)]">Articles Generated</span>
 <span className="text-lg font-bold text-hig-blue">142</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-[var(--foreground)]">AI Efficiency</span>
 <span className="text-lg font-bold text-emerald-500">92%</span>
 </div>
 <div className="h-px bg-[var(--foreground)]/5" />
 <button className="w-full py-3 bg-[var(--muted)] text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-hig-blue transition-colors flex items-center justify-center gap-2">
 <LineChart className="w-4 h-4" /> View Full Report
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* SEO Configuration Hub */}
 {activeTab ==="seo" && (
 <div className="space-y-12 animate-in fade-in duration-700">
 <header className="flex items-end justify-between pb-10">
 <div className="space-y-2">
 <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
 <Globe className="w-4 h-4" />
 {t("admin.tab.seo")} Optimization
 </div>
 <h1 className="text-5xl font-bold tracking-tighter leading-none text-[var(--foreground)]">Google Engine.</h1>
 </div>
 <button className="hig-button-primary flex items-center gap-3">
 <RefreshCw className="w-4 h-4" /> Regenerate Sitemap
 </button>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 <div className="lg:col-span-2 space-y-10">
 {/* Meta Tag Management */}
 <div className="hig-card p-10 space-y-8">
 <div className="flex items-center justify-between">
 <h3 className="text-2xl font-bold italic text-[var(--foreground)]">Global Meta Tags</h3>
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Auto-Sync Active</span>
 </div>
 </div>
 <div className="space-y-6">
 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Global Title Template</label>
 <span className="text-[10px] font-bold text-tertiary">42/60 chars</span>
 </div>
 <input defaultValue="Rusability | Intelligent Marketing Insights" className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20" />
 </div>
 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Meta Description Template</label>
 <span className="text-[10px] font-bold text-tertiary">142/160 chars</span>
 </div>
 <textarea rows={3} defaultValue="Join thousands of marketing professionals getting AI-powered insights, digital tools, and the latest PR trends every day on Rusability." className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20 resize-none" />
 </div>
 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Canonical Base URL</label>
 <input defaultValue="https://rusability.pro" className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20" />
 </div>
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Slug Pattern</label>
 <select className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-hig-blue/20">
 <option>/category/post-title</option>
 <option>/posts/post-title</option>
 <option>/post-title</option>
 </select>
 </div>
 </div>
 </div>
 </div>

 {/* Advanced SEO Tools */}
 <div className="grid grid-cols-2 gap-8">
 <div className="hig-card p-8 space-y-6">
 <div className="flex items-center gap-3">
 <FileText className="w-5 h-5 text-hig-blue" />
 <h4 className="font-bold text-[var(--foreground)]">Robots.txt Editor</h4>
 </div>
 <div className="bg-[var(--card-bg-solid)] p-4 rounded-xl font-mono text-xs text-secondary houseing-relaxed">
 User-agent: *<br/>
 Allow: /<br/>
 Sitemap: https://rusability.pro/sitemap.xml
 </div>
 <button className="w-full py-2.5 bg-hig-blue/5 text-hig-blue rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-hig-blue/10 transition-colors">Edit File</button>
 </div>
 <div className="hig-card p-8 space-y-6">
 <div className="flex items-center gap-3">
 <SearchCode className="w-5 h-5 text-hig-blue" />
 <h4 className="font-bold text-[var(--foreground)]">Schema Markup</h4>
 </div>
 <p className="text-xs text-secondary font-medium">Automatic JSON-LD generation enabled for all articles and profile pages.</p>
 <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-xl">
 <span className="text-[10px] font-bold text-emerald-600 uppercase">Article Schema</span>
 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
 </div>
 <button className="w-full py-2.5 bg-[var(--muted)] text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-hig-blue transition-colors">Preview Markup</button>
 </div>
 </div>
 </div>

 <div className="space-y-10">
 <div className="hig-card p-8 space-y-6">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">SEO Health Score</h4>
 <div className="flex flex-col items-center py-6">
 <div className="relative w-32 h-32 flex items-center justify-center">
 <svg className="w-full h-full -rotate-90">
 <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--foreground)]/5" />
 <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={364.4} strokeDashoffset={36.4} className="text-emerald-500" />
 </svg>
 <span className="absolute text-3xl font-black text-[var(--foreground)]">90</span>
 </div>
 <p className="text-[10px] font-bold uppercase text-tertiary mt-4 tracking-[0.2em]">Optimized</p>
 </div>
 <div className="space-y-4 pt-4">
 <div className="flex items-center justify-between text-[11px] font-bold">
 <span className="text-secondary">Indexing Status</span>
 <span className="text-emerald-500">100% indexed</span>
 </div>
 <div className="flex items-center justify-between text-[11px] font-bold">
 <span className="text-secondary">Mobile Usability</span>
 <span className="text-emerald-500">Perfect</span>
 </div>
 </div>
 </div>

 <div className="hig-card p-8 space-y-6">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Redirect Manager</h4>
 <div className="space-y-4">
 <div className="p-3 bg-[var(--muted)] rounded-xl space-y-1">
 <p className="text-[9px] font-bold text-tertiary">/old-news-slug</p>
 <div className="flex items-center gap-2">
 <ArrowUpRight className="w-3 h-3 text-secondary" />
 <p className="text-[10px] font-bold text-[var(--foreground)] line-clamp-1">/news/current-event-2024</p>
 </div>
 </div>
 </div>
 <button className="w-full py-3 bg-[var(--muted)] text-secondary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-hig-blue transition-colors">Add 301 Redirect</button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Brand Identity Hub */}
 {activeTab ==="brand" && (
 <div className="space-y-12 animate-in fade-in duration-700">
 <header className="flex items-end justify-between pb-10">
 <div className="space-y-2">
 <div className="flex items-center gap-3 text-hig-blue text-[10px] font-bold uppercase tracking-[0.3em]">
 <Palette className="w-4 h-4" />
 {t("admin.tab.brand")} Control
 </div>
 <h1 className="text-5xl font-bold tracking-tighter leading-none text-[var(--foreground)]">Identity Core.</h1>
 </div>
 <button className="hig-button-primary flex items-center gap-3">
 <Save className="w-4 h-4" /> Publish Brand Changes
 </button>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 <div className="lg:col-span-2 space-y-10">
 {/* Logo & Visuals */}
 <div className="hig-card p-10 space-y-10">
 <h3 className="text-2xl font-bold italic text-[var(--foreground)]">Visual Assets</h3>
 <div className="grid grid-cols-2 gap-10">
 <div className="space-y-6">
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Primary Logo (Light)</label>
 <div className="aspect-[3/1] bg-[var(--muted)] rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--foreground)]/5 group cursor-pointer hover:border-hig-blue/20 transition-colors">
 <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Click to Upload</span>
 </div>
 </div>
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Primary Logo (Dark)</label>
 <div className="aspect-[3/1] bg-black rounded-2xl flex items-center justify-center border-2 border-dashed border-white/10 group cursor-pointer hover:border-hig-blue/20 transition-colors">
 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Click to Upload</span>
 </div>
 </div>
 </div>
 <div className="space-y-6">
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Favicon (32x32)</label>
 <div className="w-20 h-20 bg-[var(--muted)] rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--foreground)]/5 group cursor-pointer hover:border-hig-blue/20 transition-colors">
 <Plus className="w-6 h-6 text-tertiary" />
 </div>
 </div>
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Brand Typography</label>
 <select className="w-full bg-[var(--muted)] rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none">
 <option>Geist Sans (Default)</option>
 <option>SF Pro Display</option>
 <option>Inter</option>
 </select>
 </div>
 </div>
 </div>
 </div>

 {/* Brand Colors */}
 <div className="hig-card p-10 space-y-8">
 <h3 className="text-2xl font-bold italic text-[var(--foreground)]">Color Palette</h3>
 <div className="grid grid-cols-4 gap-4">
 {[
 { label: "Accent", color: "bg-[#007AFF]", hex: "#007AFF" },
 { label: "Success", color: "bg-[#34C759]", hex: "#34C759" },
 { label: "Warning", color: "bg-[#FF9500]", hex: "#FF9500" },
 { label: "Critical", color: "bg-[#FF3B30]", hex: "#FF3B30" }
 ].map((c, i) => (
 <div key={i} className="space-y-3">
 <div className={`aspect-square ${c.color} rounded-2xl shadow-inner cursor-pointer hover:scale-105 transition-transform`} />
 <p className="text-[9px] font-black uppercase text-center text-secondary tracking-widest">{c.label}</p>
 <p className="text-[10px] font-bold text-center text-[var(--foreground)] font-mono">{c.hex}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-10">
 <div className="hig-card p-8 space-y-6">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Platform Details</h4>
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-tertiary">Platform Name</label>
 <input defaultValue="Rusability" className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 font-bold text-sm text-[var(--foreground)] outline-none" />
 </div>
 <div className="space-y-2">
 <label className="text-[9px] font-black uppercase tracking-widest text-tertiary">Global Tagline</label>
 <textarea rows={2} defaultValue="Intelligent Marketing Insights" className="w-full bg-[var(--muted)] rounded-xl px-4 py-3 font-bold text-sm text-[var(--foreground)] outline-none resize-none" />
 </div>
 </div>
 </div>

 <div className="hig-card p-8 space-y-6">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Social Connectivity</h4>
 <div className="space-y-4">
 {["Twitter", "LinkedIn", "Instagram", "Facebook"].map(s => (
 <div key={s} className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
 <LinkIcon className="w-4 h-4 text-tertiary" />
 </div>
 <input placeholder={`${s} URL...`} className="flex-1 bg-transparent border-b border-[var(--foreground)]/5 py-1 text-[11px] font-bold text-[var(--foreground)] outline-none focus:border-hig-blue/40 transition-colors" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Configuration Portals */}
 {(activeTab ==="support") && (
 <div className="space-y-12 animate-in fade-in duration-700">
 <header className=" pb-10">
 <h1 className="text-5xl font-bold tracking-tighter leading-none capitalize text-[var(--foreground)]">{activeTab.replace('-','')} Hub.</h1>
 </header>
 </div>
 )}
 </div>
 );
}
