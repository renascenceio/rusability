"use client";

import React from"react";
import Image from"next/image";
import Link from"next/link";
import { ArrowUpRight, Sparkles, Flame, Zap} from"lucide-react";
import { useTranslation} from "@/lib/i18n/context";

interface ArticlePluginProps {
 type:"tool" |"article" |"news";
 layout?:"horizontal" |"vertical" |"mini";
 data: {
 id: number | string;
 title?: string;
 name?: string;
 description: string;
 image: string;
 category: string;
 link?: string;
 isHot?: boolean;
 isPro?: boolean;
};
}

export const ArticlePlugin: React.FC<ArticlePluginProps> = ({ type, data, layout ="horizontal"}) => {
 const { t } = useTranslation();
 const isTool = type ==="tool";
 const isNews = type ==="news";
 const title = isTool ? data.name : data.title;
 const href = isTool ? (data.link || `/tools/${data.id}`) : (isNews ? `/news?id=${data.id}` : `/posts/${data.id}`);

 if (layout ==="mini") {
 return (
 <Link href={href} className="flex flex-col items-center gap-4 p-6 hig-card hover:bg-[var(--muted)] group/mini transition-all text-center">
 <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
 <Image src={data.image} alt={title ||""} fill className="object-cover" />
 </div>
 <div className="flex-1 min-w-0 flex flex-col items-center">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[9px] font-bold uppercase text-hig-blue tracking-wider">{data.category}</span>
 {data.isHot && <Flame className="w-2.5 h-2.5 text-orange-500" />}
 </div>
 <h5 className="text-sm font-bold truncate group-hover/mini:text-hig-blue transition-colors text-[var(--foreground)]">{title}</h5>
 </div>
 <ArrowUpRight className="w-4 h-4 text-tertiary group-hover/mini:text-hig-blue" />
 </Link>
 );
}

 if (layout ==="vertical") {
 return (
 <div className="hig-card overflow-hidden group/vertical bg-hig-blue/[0.02] text-center flex flex-col items-center">
 <div className="relative aspect-video w-full overflow-hidden">
 <Image src={data.image} alt={title ||""} fill className="object-cover transition-transform duration-700 group-hover/vertical:scale-110" />
 <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center">
 <div className="bg-hig-blue text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
 <Zap className="w-3 h-3 fill-white" />
 {isTool ? t("article.tool") : t("article.perspective")}
 </div>
 {data.isPro && (
 <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
 <Sparkles className="w-2.5 h-2.5 fill-white" />
 {t("article.premiumPerspective")}
 </div>
 )}
 </div>
 </div>
 <div className="p-8 space-y-4 flex flex-col items-center">
 <h4 className="text-xl font-bold leading-tight group-hover/vertical:text-hig-blue transition-colors text-[var(--foreground)]">{title}</h4>
 <p className="text-sm text-secondary leading-relaxed line-clamp-3 font-medium max-w-sm">{data.description}</p>
 <Link href={href} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-hig-blue pt-4">
 {t("article.exploreNow")} <ArrowUpRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 );
}

 return (
 <div className="my-12 hig-card p-1 overflow-hidden group/plugin bg-hig-blue/5 text-center">
 <div className="flex flex-col items-center gap-0">
 <div className="relative w-full aspect-[21/9] overflow-hidden rounded-t-[19px]">
 <Image
 src={data.image}
 alt={title ||""}
 fill
 className="object-cover transition-transform duration-700 group-hover/plugin:scale-110"
 />
 </div>
 <div className="flex-1 p-10 flex flex-col items-center justify-center space-y-6">
 <div className="flex flex-col items-center gap-3">
 <div className="flex items-center gap-2 text-hig-blue font-bold text-[10px] uppercase tracking-widest">
 <Sparkles className="w-3 h-3" />
 <span>{isTool ? t("article.featuredResource") : (isNews ? t("article.featuredBriefing") : t("article.featuredPerspective"))}</span>
 </div>
 {data.isPro && (
 <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
 <Sparkles className="w-2.5 h-2.5 fill-white" />
 {t("article.premiumPerspective")}
 </div>
 )}
 </div>
 <h4 className="text-2xl font-bold text-[var(--foreground)] group-hover/plugin:text-hig-blue transition-colors max-w-xl">
 {title}
 </h4>
 <p className="text-base text-secondary leading-relaxed line-clamp-2 font-medium max-w-lg">
 {data.description}
 </p>
 <Link
 href={href}
 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-hig-blue text-white px-8 py-3 rounded-full hover:brightness-110 transition-all shadow-sm group/link"
 >
 {t("article.exploreNow")}
 <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
 </Link>
 </div>
 </div>
 </div>
 );
};
