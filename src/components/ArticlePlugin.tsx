import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Flame, Zap } from "lucide-react";

interface ArticlePluginProps {
  type: "tool" | "article" | "news";
  layout?: "horizontal" | "vertical" | "mini";
  data: {
    id: number | string;
    title?: string;
    name?: string;
    description: string;
    image: string;
    category: string;
    link?: string;
    isHot?: boolean;
  };
}

export const ArticlePlugin: React.FC<ArticlePluginProps> = ({ type, data, layout = "horizontal" }) => {
  const isTool = type === "tool";
  const isNews = type === "news";
  const title = isTool ? data.name : data.title;
  const href = isTool ? (data.link || `/tools/${data.id}`) : (isNews ? `/news?id=${data.id}` : `/posts/${data.id}`);

  if (layout === "mini") {
    return (
      <Link href={href} className="flex items-center gap-4 p-4 hig-card hover:bg-[var(--background)] dark:hover:bg-[var(--background)] group/mini transition-all border-dashed">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
          <Image src={data.image} alt={title || ""} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-hig-blue tracking-wider">{data.category}</span>
            {data.isHot && <Flame className="w-2.5 h-2.5 text-orange-500" />}
          </div>
          <h5 className="text-sm font-bold truncate group-hover/mini:text-hig-blue transition-colors">{title}</h5>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[var(--foreground)] group-hover/mini:text-hig-blue" />
      </Link>
    );
  }

  if (layout === "vertical") {
    return (
      <div className="hig-card overflow-hidden group/vertical border-hig-blue/20 bg-hig-blue/[0.02]">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image src={data.image} alt={title || ""} fill className="object-cover transition-transform duration-700 group-hover/vertical:scale-110" />
          <div className="absolute top-4 left-4 bg-hig-blue text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
            <Zap className="w-3 h-3 fill-white" />
            {isTool ? "TOOL" : "PERSPECTIVE"}
          </div>
        </div>
        <div className="p-8 space-y-4">
           <h4 className="text-xl font-bold leading-tight group-hover/vertical:text-hig-blue transition-colors">{title}</h4>
           <p className="text-sm text-[var(--foreground)] leading-relaxed line-clamp-3">{data.description}</p>
           <Link href={href} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-hig-blue pt-4">
              Explore Now <ArrowUpRight className="w-4 h-4" />
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-12 hig-card p-1 overflow-hidden group/plugin border-hig-blue/10 bg-hig-blue/5">
      <div className="flex flex-col md:flex-row items-stretch gap-0">
        <div className="relative w-full md:w-1/3 min-h-[160px]">
          <Image
            src={data.image}
            alt={title || ""}
            fill
            className="object-cover rounded-l-[19px] transition-transform duration-700 group-hover/plugin:scale-110"
          />
        </div>
        <div className="flex-1 p-8 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-2 text-hig-blue font-black text-[10px] uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Featured {isTool ? "Resource" : (isNews ? "Briefing" : "Perspective")}</span>
          </div>
          <h4 className="text-xl font-bold text-[var(--foreground)] dark:text-white group-hover/plugin:text-hig-blue transition-colors">
            {title}
          </h4>
          <p className="text-sm text-[var(--foreground)] dark:text-[var(--foreground)] leading-relaxed line-clamp-2">
            {data.description}
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-hig-blue pt-2 group/link"
          >
            Explore Now
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
