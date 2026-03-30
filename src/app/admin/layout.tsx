"use client";

import { BarChart3, ShieldAlert, Globe, Zap, FileText, Users, LifeBuoy, Palette, Settings2, Languages, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { id: "analytics", label: t("admin.tab.analytics"), icon: BarChart3, link: "/admin" },
    { id: "ai-moderation", label: t("admin.tab.aiEditor"), icon: ShieldAlert, link: "/admin" },
    { id: "seo", label: t("admin.tab.seo"), icon: Globe, link: "/admin" },
    { id: "news-auto", label: t("admin.tab.news"), icon: Zap, link: "/admin" },
    { id: "content", label: t("admin.tab.articles"), icon: FileText, link: "/admin" },
    { id: "users", label: t("admin.tab.users"), icon: Users, link: "/admin" },
    { id: "support", label: t("admin.tab.support"), icon: LifeBuoy, link: "/admin" },
    { id: "brand", label: t("admin.tab.brand"), icon: Palette, link: "/admin" },
    { id: "settings", label: t("admin.settings"), icon: Settings2, link: "/admin/settings" },
    { id: "translations", label: t("admin.translations"), icon: Languages, link: "/admin/translations" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-[1600px] mx-auto flex gap-0">
        {/* Sidebar Nav */}
        <aside className="w-72 h-[calc(100vh-80px)] sticky top-20 p-6 flex flex-col justify-between overflow-y-auto bg-[var(--card-bg)] backdrop-blur-3xl border-r border-[var(--foreground)]/5">
          <div className="space-y-1">
            <div className="px-5 py-4 mb-8 rounded-2xl bg-amber-400/5 relative overflow-hidden group/admin">
              <div className="relative z-10">
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600 mb-1">{t("admin.superAccess")}</h2>
                <p className="text-sm font-bold text-[var(--foreground)] italic leading-tight">{t("admin.globalController")}</p>
              </div>
              <ShieldCheck className="absolute -right-4 -bottom-4 w-20 h-20 text-amber-500/10 rotate-12 group-hover/admin:scale-110 transition-transform duration-700" />
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push(tab.link)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all group relative overflow-hidden ${pathname === tab.link ? "bg-hig-blue text-white shadow-lg shadow-hig-blue/20" : "text-secondary hover:text-hig-blue hover:bg-hig-blue/5"}`}
              >
                <tab.icon className={`w-5 h-5 relative z-10 ${pathname === tab.link ? "text-white scale-110" : "text-tertiary group-hover:text-hig-blue group-hover:scale-110"} transition-all`} />
                <span className="relative z-10">{tab.label}</span>
                {pathname === tab.link && <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10" />}
              </button>
            ))}
          </div>

          <div className="pt-8">
            <button className="flex items-center gap-3 text-secondary hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest px-5 py-4 transition-all hover:translate-x-1">
              <Trash2 className="w-4 h-4" /> {t("admin.resetEnv")}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-80px)] bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}
