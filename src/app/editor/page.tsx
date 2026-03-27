"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Send, Sparkles, X, ChevronDown, Check, Type, Plus, Wand2, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditorPage() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Search Strategy");
  const categories = ["Search Strategy", "Public Relations", "Content Strategy", "Digital Privacy", "Branding", "Social Strategy"];

  // Content State
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
    if (excerptRef.current) {
      excerptRef.current.style.height = 'auto';
      excerptRef.current.style.height = excerptRef.current.scrollHeight + 'px';
    }
  }, [title, excerpt]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!title || !content) {
      alert("Please provide at least a title and content.");
      return;
    }
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      alert("Article published successfully!");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between mb-16 border-b border-zinc-100 dark:border-zinc-800 pb-8 sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl -mx-6 px-6 pt-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-hig-blue">
            <X className="w-6 h-6" />
          </Link>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Editing Perspective</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Draft saved at 12:42 PM</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`hig-button-primary px-8 py-2.5 text-sm flex items-center gap-3 transition-all ${isPublishing ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Briefing</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="space-y-16">
        {/* Functional Image Uploader */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group aspect-[21/9] w-full rounded-[48px] overflow-hidden border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer ${
            coverImage
            ? 'border-transparent'
            : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 hover:border-hig-blue hover:bg-hig-blue/[0.02]'
          }`}
        >
          {coverImage ? (
            <>
              <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="p-4 rounded-full bg-white text-hig-blue font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                    <ImageIcon className="w-5 h-5" /> Change Cover Photo
                 </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-8 rounded-full bg-white dark:bg-zinc-900 shadow-xl group-hover:scale-110 transition-transform ring-4 ring-zinc-50 dark:ring-zinc-900/50 group-hover:ring-hig-blue/10">
                <ImageIcon className="w-10 h-10 text-hig-blue" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">Add an evocative cover image</p>
                <p className="text-sm text-zinc-500 font-medium">1600 x 900px recommended. Max 10MB.</p>
              </div>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="space-y-12">
          {/* Enhanced Category Picker */}
          <div className="relative inline-block">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-hig-blue/10 text-hig-blue text-[10px] font-black uppercase tracking-[0.2em] hover:bg-hig-blue/20 transition-all border border-hig-blue/20 shadow-sm"
            >
              {selectedCategory}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>

            {showCategoryMenu && (
              <div className="absolute top-full left-0 mt-3 w-72 hig-card p-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-black/5">
                <div className="p-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-2">Select Category</div>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryMenu(false);
                    }}
                    className="w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-hig-blue flex items-center justify-between group transition-colors"
                  >
                    {cat}
                    {selectedCategory === cat && <Check className="w-4 h-4 text-hig-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Functional Inputs */}
          <textarea
            ref={titleRef}
            placeholder="Type your compelling headline..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-5xl md:text-8xl font-black bg-transparent border-none outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-900 resize-none leading-[0.95] tracking-tight py-4 whitespace-pre-wrap"
            rows={1}
          />

          <textarea
            ref={excerptRef}
            placeholder="Sum it up for the home page feed..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full text-xl md:text-3xl font-medium text-zinc-500 bg-transparent border-none outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-800 resize-none leading-relaxed border-l-4 border-zinc-100 dark:border-zinc-800 pl-10 whitespace-pre-wrap"
            rows={1}
          />

          {/* Real Textarea for Content */}
          <div className="relative min-h-[600px] pt-10 group/content">
            <div className="absolute top-0 left-0 -translate-x-20 translate-y-10 opacity-0 group-hover/content:opacity-100 transition-all duration-500">
               <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setContent(prev => prev + "\n\n")}
                    className="p-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-hig-blue hover:border-hig-blue shadow-xl transition-all hover:scale-110 active:scale-90"
                    title="Add block"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setContent(prev => prev + "\nAI Suggestion: Improving this paragraph for better engagement...")}
                    className="p-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-hig-blue hover:border-hig-blue shadow-xl transition-all hover:scale-110 active:scale-90"
                    title="AI Enhance"
                  >
                    <Wand2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
            <textarea
              placeholder="Tell the story. This is where insights are born. AI is ready to assist..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xl md:text-2xl font-medium text-zinc-800 dark:text-zinc-200 bg-transparent border-none outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-900 resize-none h-full min-h-[600px] leading-relaxed selection:bg-hig-blue/10 whitespace-pre-wrap"
            />
          </div>
        </div>
      </div>

      {/* Improved AI Floating Toolbar */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl px-8 py-5 rounded-[32px] shadow-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-10">
            <div className="flex items-center gap-8 border-r border-zinc-100 dark:border-zinc-800 pr-10">
               <button className="p-2 text-zinc-400 hover:text-hig-blue transition-colors"><Type className="w-5 h-5" /></button>
               <button className="p-2 text-zinc-400 hover:text-hig-blue transition-colors font-black">B</button>
               <button className="p-2 text-zinc-400 hover:text-hig-blue transition-colors font-black italic">I</button>
            </div>

            <button className="flex items-center gap-3 text-hig-blue font-black text-xs uppercase tracking-widest group bg-hig-blue/5 px-6 py-3 rounded-2xl hover:bg-hig-blue/10 transition-all border border-hig-blue/10">
               <Sparkles className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
               AI Refine & Optimize
            </button>
         </div>
      </div>
    </div>
  );
}
