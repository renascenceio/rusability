"use client";

import { useState } from "react";
import { Image as ImageIcon, Send, Sparkles, X, ChevronDown, Check } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Search Strategy");
  const categories = ["Search Strategy", "Public Relations", "Content Strategy", "Digital Privacy", "Branding", "Social Strategy"];

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      alert("Article published successfully!");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-hig-blue transition-colors">
            <X className="w-6 h-6" />
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Drafting</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-bold text-zinc-400 hover:text-zinc-900 px-4 py-2 rounded-full transition-colors">Save Draft</button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`hig-button-primary px-8 py-2.5 text-sm flex items-center gap-2 ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPublishing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Publish
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="space-y-12">
        {/* Cover Image Placeholder */}
        <div className="relative group aspect-[21/9] w-full rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-hig-blue transition-all overflow-hidden">
          <div className="p-6 rounded-full bg-white dark:bg-zinc-800 shadow-hig group-hover:scale-110 transition-transform">
            <ImageIcon className="w-8 h-8 text-hig-blue" />
          </div>
          <div className="text-center">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">Add high-resolution cover photo</p>
            <p className="text-sm text-zinc-500">1200 x 600px recommended for best display</p>
          </div>
        </div>

        {/* Category Picker */}
        <div className="relative inline-block">
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-hig-blue/5 text-hig-blue text-xs font-black uppercase tracking-widest hover:bg-hig-blue/10 transition-all border border-hig-blue/10"
          >
            {selectedCategory}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showCategoryMenu && (
            <div className="absolute top-full left-0 mt-2 w-56 hig-card p-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategoryMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-hig-blue flex items-center justify-between group"
                >
                  {cat}
                  {selectedCategory === cat && <Check className="w-3 h-3 text-hig-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title Input */}
        <textarea
          placeholder="New Perspective Title..."
          className="w-full text-5xl md:text-7xl font-black bg-transparent border-none outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 resize-none h-auto min-h-[120px] leading-tight tracking-tight"
          rows={1}
          onChange={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        {/* Excerpt Input */}
        <textarea
          placeholder="Brief summary of your briefing..."
          className="w-full text-xl md:text-2xl font-medium text-zinc-500 bg-transparent border-none outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 resize-none h-auto min-h-[60px] leading-relaxed border-l-4 border-zinc-100 dark:border-zinc-800 pl-8"
          rows={1}
          onChange={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        {/* Rich Text Placeholder */}
        <div className="min-h-[400px] relative">
          <div className="absolute top-0 left-0 -translate-x-12 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 rounded-full border border-zinc-200 text-zinc-400 hover:border-hig-blue hover:text-hig-blue transition-all">
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          <textarea
            placeholder="Tell your story. AI can assist with research and style..."
            className="w-full text-lg md:text-xl font-medium text-zinc-800 dark:text-zinc-200 bg-transparent border-none outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 resize-none h-full min-h-[400px] leading-relaxed"
          />
        </div>
      </div>

      {/* Toolbar / AI Suggestions */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl px-8 py-4 rounded-full shadow-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-8">
        <div className="flex items-center gap-6 border-r border-zinc-100 dark:border-zinc-800 pr-8">
           <button className="text-zinc-400 hover:text-hig-blue font-black text-xs uppercase tracking-widest">B</button>
           <button className="text-zinc-400 hover:text-hig-blue font-black text-xs italic tracking-widest">I</button>
           <button className="text-zinc-400 hover:text-hig-blue font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4">U</button>
        </div>
        <button className="flex items-center gap-2 text-hig-blue font-black text-xs uppercase tracking-widest group">
          <Sparkles className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
          AI Refine
        </button>
      </div>
    </div>
  );
}
