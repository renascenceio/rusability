import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface ArticlePluginProps {
  type: "tool" | "article";
  data: {
    id: number | string;
    title?: string;
    name?: string;
    description: string;
    image: string;
    category: string;
    link?: string;
  };
}

export const ArticlePlugin: React.FC<ArticlePluginProps> = ({ type, data }) => {
  const isTool = type === "tool";
  const title = isTool ? data.name : data.title;
  const href = isTool ? (data.link || `/tools/${data.id}`) : `/posts/${data.id}`;

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
            <span>Featured {isTool ? "Resource" : "Perspective"}</span>
          </div>
          <h4 className="text-xl font-bold text-zinc-900 dark:text-white group-hover/plugin:text-hig-blue transition-colors">
            {title}
          </h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
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
