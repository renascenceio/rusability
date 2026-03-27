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
  Plus,
  TrendingUp,
  Eye,
  UserPlus,
  Trash2,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Flag,
  PenTool,
  LifeBuoy
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState("overview");

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
        <aside className="w-72 h-[calc(100vh-80px)] sticky top-20 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="px-4 py-6 mb-8 bg-gradient-to-r from-amber-400/10 to-orange-500/10 rounded-3xl border border-amber-400/20">
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Super Admin</h2>
               <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 italic">Global Controller</p>
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all group ${
                  activeTab === tab.id
                    ? "bg-hig-blue text-white shadow-lg shadow-hig-blue/20"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-zinc-400 group-hover:text-hig-blue"}`} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
             <button className="flex items-center gap-3 text-zinc-400 hover:text-rose-500 text-xs font-black uppercase tracking-widest px-5 py-3 transition-colors">
                <Trash2 className="w-4 h-4" /> Reset Environment
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-10 min-h-[calc(100vh-80px)] bg-white dark:bg-zinc-950/20">

          {/* Analytics Engine */}
          {activeTab === "analytics" && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <header>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Analytics Intelligence</h1>
                    <p className="text-zinc-500 font-medium">Real-time performance across the entire ecosystem.</p>
                  </header>
                  <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
                    {["overview", "users", "authors", "content"].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setActiveAnalyticsSubTab(sub)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeAnalyticsSubTab === sub
                          ? "bg-white dark:bg-zinc-800 text-hig-blue shadow-sm"
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
                    <div key={i} className="hig-card p-8 space-y-4">
                       <div className="flex items-center justify-between">
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          <span className="text-xs font-bold text-emerald-500">{stat.change}</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-3xl font-black">{stat.val}</p>
                          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="hig-card p-10 h-[400px] flex flex-col justify-between">
                     <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-hig-blue" />
                        Traffic Velocity (Last 30 Days)
                     </h3>
                     <div className="flex-1 flex items-end gap-3 pb-4">
                        {[40, 60, 45, 90, 65, 80, 55, 75, 95, 100, 85, 70, 90, 80].map((h, i) => (
                          <div key={i} className="flex-1 bg-hig-blue/10 dark:bg-hig-blue/5 rounded-t-lg relative group transition-all hover:bg-hig-blue">
                             <div style={{ height: `${h}%` }} className="w-full bg-hig-blue/40 group-hover:bg-hig-blue transition-all" />
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                               {h}k
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="hig-card p-10 h-[400px]">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          Top Authors
                        </h3>
                        <button className="text-[10px] font-black uppercase tracking-widest text-hig-blue">View All</button>
                     </div>
                     <div className="space-y-6 overflow-y-auto pr-4">
                        {[
                          { name: "Elena Rossi", views: "142k", engagement: "9.2%", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
                          { name: "Marc Dubois", views: "98k", engagement: "8.7%", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
                          { name: "Amina Kadi", views: "74k", engagement: "9.5%", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" },
                          { name: "Sarah Jenkins", views: "62k", engagement: "8.1%", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956" },
                        ].map((author, i) => (
                          <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 rounded-2xl transition-all">
                             <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm">
                                <Image src={`${author.img}?auto=format&fit=crop&q=80&w=100`} alt={author.name} fill className="object-cover" />
                             </div>
                             <div className="flex-1">
                                <p className="font-bold text-sm">{author.name}</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase">{author.views} Views • {author.engagement} Eng</p>
                             </div>
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* AI Auto-Editor */}
          {activeTab === "ai-moderation" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <header className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">AI Moderation Engine</h1>
                    <p className="text-zinc-500 font-medium italic">Autonomous oversight & safety protocol.</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Active Vigilance</span>
                     </div>
                     <button className="hig-button-primary bg-zinc-900 text-[10px] px-8 py-3">Update Training</button>
                  </div>
               </header>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="hig-card p-1">
                        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 flex items-center gap-4 rounded-t-[19px]">
                           <Search className="w-4 h-4 text-zinc-400" />
                           <input placeholder="Search audit logs..." className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                           {[
                             { user: "User_842", reason: "Potential Hate Speech", confidence: "94%", status: "Blocked", time: "12m ago" },
                             { user: "Bot_A9", reason: "DDoS Attempt Pattern", confidence: "99%", status: "Shadowbanned", time: "42m ago" },
                             { user: "Author_X", reason: "Copyright Infringement", confidence: "87%", status: "Draft Restricted", time: "2h ago" },
                             { user: "User_221", reason: "Spam Injection", confidence: "92%", status: "Deleted", time: "5h ago" },
                           ].map((log, i) => (
                             <div key={i} className="p-6 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-3">
                                      <span className="font-bold text-sm">{log.user}</span>
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase">{log.reason}</span>
                                   </div>
                                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Confidence {log.confidence} • {log.time}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                   <span className="text-[10px] font-black uppercase text-rose-500">{log.status}</span>
                                   <button className="p-2 text-zinc-300 hover:text-hig-blue"><MoreVertical className="w-4 h-4" /></button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="hig-card p-8 space-y-8 bg-zinc-900 text-white border-zinc-800">
                        <div className="flex items-center gap-3">
                           <ShieldAlert className="w-6 h-6 text-rose-500" />
                           <h3 className="font-bold text-lg">Editor Protocols</h3>
                        </div>
                        <div className="space-y-4">
                           {[
                             "Auto-block on 3 flags",
                             "Reject AI-plagiarized text",
                             "Strip non-authorized links",
                             "NSFW image detection"
                           ].map((p, i) => (
                             <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-xs font-medium text-white/80">{p}</span>
                                <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                                   <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                                </div>
                             </div>
                           ))}
                        </div>
                        <button className="w-full hig-button-primary bg-white text-black py-3 text-[10px]">Review All Protocols</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* User Management Section */}
          {activeTab === "users" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <header className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Network Directory</h1>
                    <p className="text-zinc-500 font-medium">Manage permissions, roles, and community access.</p>
                  </div>
                  <button className="hig-button-primary flex items-center gap-2">
                     <UserPlus className="w-4 h-4" /> Add User
                  </button>
               </header>

               <div className="hig-card overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                           <th className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">User Profile</th>
                           <th className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">Membership</th>
                           <th className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">Last Active</th>
                           <th className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">Activity Score</th>
                           <th className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {[
                          { name: "John Smith", email: "john@cloudscale.io", role: "free", active: "10m ago", score: 84 },
                          { name: "Sarah Connor", email: "sarah@cyberdyne.net", role: "pro", active: "Now", score: 98 },
                          { name: "David Miller", email: "david@marketing.pro", role: "pro", active: "2h ago", score: 92 },
                          { name: "Emily Watson", email: "emily@gmail.com", role: "free", active: "1d ago", score: 45 },
                          { name: "Michael Chang", email: "m.chang@techhub.com", role: "pro", active: "Now", score: 89 },
                        ].map((user, i) => (
                          <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-500">
                                      {user.name.split(' ').map(n => n[0]).join('')}
                                   </div>
                                   <div>
                                      <p className="font-bold text-sm">{user.name}</p>
                                      <p className="text-xs text-zinc-400">{user.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                   <button
                                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        user.role === 'pro'
                                        ? "bg-amber-400/10 border-amber-400/20 text-amber-600"
                                        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-amber-400 hover:text-amber-500"
                                      }`}
                                   >
                                      {user.role} Access
                                   </button>
                                   {user.role === 'free' && <Plus className="w-3 h-3 text-zinc-300" />}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-sm font-medium text-zinc-500">{user.active}</td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                      <div style={{ width: `${user.score}%` }} className={`h-full rounded-full ${user.score > 80 ? 'bg-emerald-500' : 'bg-hig-blue'}`} />
                                   </div>
                                   <span className="text-[10px] font-black text-zinc-400">{user.score}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button className="p-2 text-zinc-300 hover:text-hig-blue"><Settings2 className="w-4 h-4" /></button>
                                   <button className="p-2 text-zinc-300 hover:text-rose-500"><ShieldAlert className="w-4 h-4" /></button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* Brand & SEO Tabs - Placeholder High-fidelity views */}
          {(activeTab === "seo" || activeTab === "brand" || activeTab === "news-auto") && (
             <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] animate-in fade-in duration-700">
                <div className="w-24 h-24 rounded-full bg-hig-blue/10 flex items-center justify-center mb-8">
                   <Settings2 className="w-10 h-10 text-hig-blue animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-black mb-4">Configuration Portal</h2>
                <p className="text-zinc-500 font-medium text-center max-w-md leading-relaxed">
                   Accessing the secure {activeTab.toUpperCase()} management layer. This module is active and processing live data in the background.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-12">
                   <div className="hig-card p-6 flex flex-col items-center gap-3 text-center border-dashed">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Systems Active</p>
                   </div>
                   <div className="hig-card p-6 flex flex-col items-center gap-3 text-center border-dashed">
                      <Zap className="w-6 h-6 text-amber-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest">AI Engine Linked</p>
                   </div>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
