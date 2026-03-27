"use client";

import { useState } from "react";
import {
  Users,
  FileText,
  BarChart3,
  ShieldAlert,
  Globe,
  Settings2,
  Palette,
  Eye,
  UserPlus,
  Trash2,
  Search,
  Sparkles,
  Zap,
  MoreVertical,
  Flag,
  PenTool,
  LifeBuoy,
  ShieldCheck,
  SearchCode,
  LineChart,
  Target,
  ArrowUpRight
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock functional states
  const [users, setUsers] = useState([
    { id: 1, name: "John Smith", email: "john@cloudscale.io", role: "free", active: "10m ago", score: 84, img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36" },
    { id: 2, name: "Sarah Connor", email: "sarah@cyberdyne.net", role: "pro", active: "Now", score: 98, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
    { id: 3, name: "David Miller", email: "david@marketing.pro", role: "pro", active: "2h ago", score: 92, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
    { id: 4, name: "Emily Watson", email: "emily@gmail.com", role: "free", active: "1d ago", score: 45, img: "https://images.unsplash.com/photo-1580489944761-15a19d654956" },
    { id: 5, name: "Michael Chang", email: "m.chang@techhub.com", role: "pro", active: "Now", score: 89, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
  ]);

  const togglePro = (userId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: u.role === 'pro' ? 'free' : 'pro' } : u));
  };

  const tabs = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "ai-moderation", label: "AI Auto-Editor", icon: ShieldAlert },
    { id: "seo", label: "SEO Product", icon: Globe },
    { id: "news-auto", label: "Auto-News", icon: Zap },
    { id: "content", label: "Articles", icon: FileText },
    { id: "users", label: "Users", icon: Users },
    { id: "support", label: "Support", icon: LifeBuoy },
    { id: "brand", label: "Brand", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20">
      <div className="max-w-[1600px] mx-auto flex gap-0">

        {/* Sidebar Nav */}
        <aside className="w-72 h-[calc(100vh-80px)] sticky top-20 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto bg-white/50 dark:bg-zinc-950/50 backdrop-blur-3xl">
          <div className="space-y-1">
            <div className="px-5 py-8 mb-10 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-[32px] border border-amber-400/20 relative overflow-hidden group/admin">
               <div className="relative z-10">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-2">Super Admin Access</h2>
                  <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 italic leading-tight">Global Controller</p>
               </div>
               <ShieldCheck className="absolute -right-4 -bottom-4 w-20 h-20 text-amber-500/10 rotate-12 group-hover/admin:scale-110 transition-transform duration-700" />
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all group relative overflow-hidden ${
                  activeTab === tab.id
                    ? "bg-hig-blue text-white shadow-xl shadow-hig-blue/20"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <tab.icon className={`w-5 h-5 relative z-10 ${activeTab === tab.id ? "text-white scale-110" : "text-zinc-400 group-hover:text-hig-blue group-hover:scale-110"} transition-all`} />
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10" />}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
             <button className="flex items-center gap-3 text-zinc-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest px-5 py-4 transition-all hover:translate-x-1">
                <Trash2 className="w-4 h-4" /> Reset Environment
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-10 min-h-[calc(100vh-80px)] bg-white dark:bg-zinc-950/20 shadow-inner">

          {/* Analytics Engine */}
          {activeTab === "analytics" && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-10">
                  <header className="space-y-2">
                    <div className="flex items-center gap-3 text-hig-blue text-[10px] font-black uppercase tracking-[0.3em]">
                       <LineChart className="w-4 h-4" />
                       Analytics Intelligence
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter leading-none">System Velocity.</h1>
                  </header>
                  <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    {["overview", "users", "authors", "content"].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setActiveAnalyticsSubTab(sub)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeAnalyticsSubTab === sub
                          ? "bg-white dark:bg-zinc-800 text-hig-blue shadow-lg"
                          : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { label: "Active Users", val: "12,482", change: "+14.2%", icon: Users, color: "text-hig-blue" },
                    { label: "Page Views", val: "1.2M", change: "+5.1%", icon: Eye, color: "text-purple-500" },
                    { label: "Avg Engagement", val: "8.4m", change: "+2.4%", icon: Zap, color: "text-amber-500" },
                    { label: "New Content", val: "142", change: "+24.0%", icon: PenTool, color: "text-emerald-500" },
                  ].map((stat, i) => (
                    <div key={i} className="hig-card p-10 flex flex-col justify-between h-48 border-zinc-100 dark:border-zinc-800">
                       <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-2xl ${stat.color.replace('text-', 'bg-')}/10 ${stat.color}`}>
                             <stat.icon className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full">{stat.change}</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-4xl font-black tracking-tighter">{stat.val}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 hig-card p-10 h-[500px] flex flex-col justify-between border-zinc-100 dark:border-zinc-800">
                     <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
                           Traffic Flow
                        </h3>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-hig-blue animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Stream</span>
                        </div>
                     </div>
                     <div className="flex-1 flex items-end gap-4 pb-8">
                        {[40, 60, 45, 90, 65, 80, 55, 75, 95, 100, 85, 70, 90, 80, 60, 40].map((h, i) => (
                          <div key={i} className="flex-1 bg-zinc-50 dark:bg-zinc-900/40 rounded-t-[20px] relative group transition-all">
                             <div style={{ height: `${h}%` }} className="w-full bg-hig-blue/40 group-hover:bg-hig-blue transition-all duration-500 rounded-t-[20px] relative">
                                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-t from-transparent to-white/10 rounded-t-[20px]" />
                             </div>
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                               {h}k
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="hig-card p-10 h-[500px] border-zinc-100 dark:border-zinc-800 flex flex-col">
                     <div className="flex items-center justify-between mb-10 border-b border-zinc-50 dark:border-zinc-900 pb-6">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
                          Top Performers
                        </h3>
                        <Sparkles className="w-5 h-5 text-amber-500" />
                     </div>
                     <div className="space-y-6 overflow-y-auto pr-4 no-scrollbar flex-1">
                        {[
                          { name: "Elena Rossi", views: "142k", engagement: "9.2%", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
                          { name: "Marc Dubois", views: "98k", engagement: "8.7%", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
                          { name: "Amina Kadi", views: "74k", engagement: "9.5%", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" },
                          { name: "Sarah Jenkins", views: "62k", engagement: "8.1%", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956" },
                          { name: "David Chen", views: "54k", engagement: "7.8%", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
                        ].map((author, i) => (
                          <div key={i} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl transition-all border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-100 dark:hover:border-zinc-800">
                             <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-lg group-hover:scale-110 transition-transform">
                                <Image src={`${author.img}?auto=format&fit=crop&q=80&w=100`} alt={author.name} fill className="object-cover" />
                             </div>
                             <div className="flex-1">
                                <p className="font-black text-sm">{author.name}</p>
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{author.views} Views • {author.engagement} Eng</p>
                             </div>
                             <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-hig-blue group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* AI Auto-Editor Protocol */}
          {activeTab === "ai-moderation" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
               <header className="flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em]">
                       <ShieldAlert className="w-4 h-4" />
                       Safety Protocol V4
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter leading-none">Autonomous Guard.</h1>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900" />
                           ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">3 AI Agents Active</span>
                     </div>
                     <button className="hig-button-primary bg-zinc-900 dark:bg-zinc-100 dark:text-black">Sync Core</button>
                  </div>
               </header>

               <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                  <div className="lg:col-span-3 space-y-10">
                     <div className="hig-card overflow-hidden border-zinc-100 dark:border-zinc-800">
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                           <div className="flex items-center gap-4 flex-1">
                              <SearchCode className="w-5 h-5 text-zinc-400" />
                              <input placeholder="Search audit logs by signature..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                           </div>
                           <div className="flex items-center gap-2">
                              <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800">Clear Logs</button>
                              <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-hig-blue text-white shadow-lg">Export Report</button>
                           </div>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                           {[
                             { user: "User_842", reason: "Potential Hate Speech", confidence: "94%", status: "Blocked", time: "12m ago", severity: "high" },
                             { user: "Bot_A9", reason: "DDoS Attempt Pattern", confidence: "99%", status: "Shadowbanned", time: "42m ago", severity: "critical" },
                             { user: "Author_X", reason: "Copyright Infringement", confidence: "87%", status: "Restricted", time: "2h ago", severity: "medium" },
                             { user: "User_221", reason: "Spam Injection", confidence: "92%", status: "Deleted", time: "5h ago", severity: "high" },
                             { user: "Anon_99", reason: "Policy Violation", confidence: "76%", status: "Flagged", time: "8h ago", severity: "low" },
                           ].map((log, i) => (
                             <div key={i} className="p-8 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className={`w-3 h-3 rounded-full animate-pulse ${
                                      log.severity === 'critical' ? 'bg-rose-600' :
                                      log.severity === 'high' ? 'bg-rose-400' :
                                      log.severity === 'medium' ? 'bg-amber-400' : 'bg-hig-blue'
                                   }`} />
                                   <div className="space-y-1">
                                      <div className="flex items-center gap-4">
                                         <span className="font-black text-sm">{log.user}</span>
                                         <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-black uppercase tracking-widest">{log.reason}</span>
                                      </div>
                                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Confidence {log.confidence} • Signature Verified</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-8">
                                   <div className="text-right">
                                      <span className="text-[11px] font-black uppercase text-zinc-900 dark:text-zinc-100 block mb-1">{log.status}</span>
                                      <span className="text-[10px] text-zinc-400 font-bold">{log.time}</span>
                                   </div>
                                   <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-hig-blue transition-all"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-10">
                     <div className="hig-card p-10 space-y-10 bg-zinc-950 text-white border-zinc-800 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-10">
                           <div className="flex items-center gap-4">
                              <ShieldAlert className="w-8 h-8 text-rose-500" />
                              <h3 className="font-black text-xl italic">Core Rules</h3>
                           </div>
                           <div className="space-y-6">
                              {[
                                { t: "Auto-block Flags", v: "3 Units" },
                                { t: "AI Plagiarism", v: "80% Threshold" },
                                { t: "Shadowban Bots", v: "Active" },
                                { t: "NSFW Shield", v: "Max Level" }
                              ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group/item transition-all hover:bg-white/10">
                                   <span className="text-xs font-black uppercase tracking-widest text-white/70 group-hover/item:text-white transition-colors">{p.t}</span>
                                   <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-bold text-emerald-500">{p.v}</span>
                                      <div className="w-8 h-4 bg-emerald-500 rounded-full flex items-center px-0.5">
                                         <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                                      </div>
                                   </div>
                                </div>
                              ))}
                           </div>
                           <button className="w-full hig-button-primary bg-white text-black py-4 text-[10px] hover:scale-105 transition-transform">Update Global Protocol</button>
                        </div>
                        <ShieldCheck className="absolute -left-10 -bottom-10 w-40 h-40 text-white/5 -rotate-12 group-hover:scale-125 transition-transform duration-1000" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* User & Permission Management */}
          {activeTab === "users" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
               <header className="flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-hig-blue text-[10px] font-black uppercase tracking-[0.3em]">
                       <Target className="w-4 h-4" />
                       Network Intelligence
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter leading-none">Access Control.</h1>
                  </div>
                  <div className="flex gap-4">
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Search users..."
                           className="bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-medium w-80 focus:ring-2 focus:ring-hig-blue/20 transition-all"
                        />
                     </div>
                     <button className="hig-button-primary flex items-center gap-3 px-8">
                        <UserPlus className="w-5 h-5" />
                        <span className="text-[10px] uppercase tracking-widest">New User</span>
                     </button>
                  </div>
               </header>

               <div className="hig-card overflow-hidden border-zinc-100 dark:border-zinc-800 shadow-xl">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                           <th className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800">Entity Profile</th>
                           <th className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800">Authorization</th>
                           <th className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800">Connection</th>
                           <th className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800">Activity Score</th>
                           <th className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 text-right">Admin Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user, i) => (
                          <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-5">
                                   <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-lg group-hover:scale-110 transition-transform">
                                      <Image src={`${user.img}?auto=format&fit=crop&q=80&w=100`} alt={user.name} fill className="object-cover" />
                                   </div>
                                   <div>
                                      <p className="font-black text-sm text-zinc-900 dark:text-zinc-100">{user.name}</p>
                                      <p className="text-xs text-zinc-400 font-medium">{user.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <button
                                   onClick={() => togglePro(user.id)}
                                   className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all active:scale-95 ${
                                     user.role === 'pro'
                                     ? "bg-amber-400 text-white border-amber-500 shadow-lg shadow-amber-400/20"
                                     : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-amber-400 hover:text-amber-500"
                                   }`}
                                >
                                   {user.role} Authorization
                                </button>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                   <span className={`w-2 h-2 rounded-full ${user.active === 'Now' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                                   <span className="text-[11px] font-bold text-zinc-500">{user.active}</span>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                   <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden min-w-[120px]">
                                      <div style={{ width: `${user.score}%` }} className={`h-full rounded-full transition-all duration-1000 ${user.score > 80 ? 'bg-emerald-500' : 'bg-hig-blue'}`} />
                                   </div>
                                   <span className="text-[11px] font-black text-zinc-400">{user.score}</span>
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="flex items-center justify-end gap-3">
                                   <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-hig-blue hover:shadow-lg transition-all"><Settings2 className="w-5 h-5" /></button>
                                   <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-rose-500 hover:shadow-lg transition-all"><Flag className="w-5 h-5" /></button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* Configuration Portals */}
          {(activeTab === "seo" || activeTab === "brand" || activeTab === "news-auto" || activeTab === "support" || activeTab === "content") && (
             <div className="space-y-12 animate-in fade-in duration-700">
                <header className="border-b border-zinc-100 dark:border-zinc-800 pb-10">
                   <h1 className="text-5xl font-black tracking-tighter leading-none capitalize">{activeTab.replace('-', ' ')} Hub.</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   {/* Interactive Config Panel */}
                   <div className="lg:col-span-2 hig-card p-10 space-y-8 border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-black tracking-tight italic">Engine Configuration</h3>
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Ready</span>
                         </div>
                      </div>

                      <div className="space-y-6">
                         {[
                           { label: "AI Creativity Index", value: 85, desc: "Controls the variation in generated headlines and content hooks." },
                           { label: "SEO Keyword Density", value: 1.8, desc: "Optimal target for automated semantic injections.", unit: "%" },
                           { label: "Global Brand Variance", value: 12, desc: "Allowed deviation from core style guide for localized content.", unit: "%" }
                         ].map((item, i) => (
                           <div key={i} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-4 group">
                              <div className="flex items-center justify-between">
                                 <div>
                                    <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">{item.label}</h4>
                                    <p className="text-xs text-zinc-400 font-medium">{item.desc}</p>
                                 </div>
                                 <span className="text-lg font-black text-hig-blue">{item.value}{item.unit || ""}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                 <div
                                    style={{ width: `${(item.value / (item.unit === '%' ? 100 : item.value * 1.2)) * 100}%` }}
                                    className="h-full bg-hig-blue rounded-full transition-all group-hover:brightness-110"
                                 />
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="flex gap-4">
                         <button className="hig-button-primary flex-1">Save Global Config</button>
                         <button className="hig-button-secondary border-none bg-zinc-100 dark:bg-zinc-800 flex-1">Reset Defaults</button>
                      </div>
                   </div>

                   {/* Quick Info & Stats */}
                   <div className="space-y-10">
                      <div className="hig-card p-10 bg-hig-blue text-white border-none shadow-2xl relative overflow-hidden group cursor-pointer">
                         <div className="relative z-10 space-y-6">
                           <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-white" />
                           </div>
                           <h3 className="text-xl font-black italic">Optimization Score</h3>
                           <p className="text-4xl font-black tracking-tighter">98.2</p>
                           <p className="text-xs text-white/60 font-medium leading-relaxed">Your current {activeTab} strategy is performing in the top 1% of the industry.</p>
                         </div>
                         <Zap className="absolute -bottom-10 -right-10 w-40 h-40 text-white/10 -rotate-12 group-hover:scale-125 transition-transform duration-700" />
                      </div>

                      <div className="hig-card p-10 border-zinc-100 dark:border-zinc-800 space-y-6">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recent Audit Logs</h4>
                         <div className="space-y-4">
                            {[
                              { event: "Global SEO Re-index", time: "2m ago" },
                              { event: "Brand Asset Sync", time: "1h ago" },
                              { event: "Auto-content Flush", time: "4h ago" }
                            ].map((log, i) => (
                              <div key={i} className="flex items-center justify-between border-b border-zinc-50 dark:border-zinc-900 pb-3 last:border-0">
                                 <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{log.event}</span>
                                 <span className="text-[10px] text-zinc-400 font-bold">{log.time}</span>
                              </div>
                            ))}
                         </div>
                         <button className="w-full py-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-hig-blue transition-colors">View All Logs</button>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
