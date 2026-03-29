"use client";

import Link from"next/link";
import { Clock, Globe, ExternalLink} from"lucide-react";
import { useTranslation} from "@/lib/i18n/context";

export const Footer = () => {
 const { t } = useTranslation();
 return (
 <footer className="bg-[var(--background)] pt-20 pb-12">
 <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
 <div className="space-y-6">
 <Link href="/" className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
 rusability
 </Link>
 <p className="text-sm text-secondary leading-relaxed max-w-xs font-medium">
 {t("footer.tagline")}
 </p>
 <div className="flex gap-4">
 <button className="p-2 text-secondary hover:text-hig-blue transition-colors">
 <Clock className="w-5 h-5" />
 </button>
 <button className="p-2 text-secondary hover:text-hig-blue transition-colors">
 <Globe className="w-5 h-5" />
 </button>
 </div>
 </div>

 <div>
 <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-secondary">{t("footer.magazine")}</h4>
 <ul className="space-y-4 text-sm font-semibold text-secondary">
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">{t("footer.dailyNews")}</Link></li>
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">{t("footer.caseStudies")}</Link></li>
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">{t("footer.interviews")}</Link></li>
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">{t("footer.opinion")}</Link></li>
 </ul>
 </div>

 <div>
 <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-secondary">{t("footer.industry")}</h4>
 <ul className="space-y-4 text-sm font-semibold text-secondary">
 <li><Link href="/events" className="hover:text-[var(--foreground)] transition-colors">{t("footer.eventsDir")}</Link></li>
 <li><Link href="/tools" className="hover:text-[var(--foreground)] transition-colors">{t("footer.marketingTools")}</Link></li>
 <li><Link href="/tools" className="hover:text-[var(--foreground)] transition-colors">{t("footer.prResources")}</Link></li>
 <li><Link href="/events" className="hover:text-[var(--foreground)] transition-colors">{t("footer.webinars")}</Link></li>
 </ul>
 </div>

 <div>
 <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-secondary">{t("footer.connect")}</h4>
 <ul className="space-y-4 text-sm font-semibold text-secondary">
 <li><Link href="/profile/jdoe" className="hover:text-[var(--foreground)] transition-colors">{t("footer.personalFeed")}</Link></li>
 <li><button className="flex items-center gap-2 hover:text-[var(--foreground)] transition-colors">{t("footer.newsletter")} <ExternalLink className="w-3.5 h-3.5" /></button></li>
 <li><button className="hover:text-[var(--foreground)] transition-colors">{t("footer.submitArticle")}</button></li>
 <li><button className="hover:text-[var(--foreground)] transition-colors">{t("footer.privacy")}</button></li>
 </ul>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
 <p className="text-[12px] text-tertiary font-medium">
 © {new Date().getFullYear()} {t("footer.rights")}
 </p>
 <div className="flex gap-8 text-[12px] text-tertiary font-medium">
 <button className="hover:text-[var(--foreground)] transition-colors">{t("footer.terms")}</button>
 <button className="hover:text-[var(--foreground)] transition-colors">{t("footer.cookies")}</button>
 <button className="hover:text-[var(--foreground)] transition-colors">{t("footer.legal")}</button>
 </div>
 </div>
 </footer>
 );
};
