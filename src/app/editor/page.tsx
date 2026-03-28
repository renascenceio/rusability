"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Send, Sparkles, X, ChevronDown, Check, Wand2, Eye, Bold, Italic, Link as LinkIcon, Quote } from "lucide-react";
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
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix: string = "") => {
    if (!contentRef.current) return;
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    const newText = beforeText + prefix + selectedText + suffix + afterText;
    setContent(newText);

    // Focus and reset selection (simplified)
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

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
      <div className="space-y-16">
        {/* Functional Image Uploader */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group aspect-[21/9] w-full rounded-[48px] overflow-hidden border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer ${
            coverImage
            ? 'border-transparent'
            : 'bg-white dark:bg-white/50 border-[var(--border)] dark:border-[var(--border)] hover:border-hig-blue hover:bg-hig-blue/[0.02]'
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
              <div className="p-8 rounded-full bg-white dark:bg-white shadow-xl group-hover:scale-110 transition-transform ring-4 ring-zinc-50 dark:ring-zinc-900/50 group-hover:ring-hig-blue/10">
                <ImageIcon className="w-10 h-10 text-hig-blue" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black text-[var(--foreground)] dark:text-black">Add an evocative cover image</p>
                <p className="text-sm text-[var(--foreground)] font-medium">1600 x 900px recommended. Max 10MB.</p>
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
              <div className="absolute top-full left-0 mt-3 w-72 hig-card p-2 z-50 bg-white/95 dark:bg-white/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-black/5">
                <div className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] border-b border-[var(--border)] dark:border-[var(--border)] mb-2">Select Category</div>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryMenu(false);
                    }}
                    className="w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] hover:bg-white dark:hover:bg-white hover:text-hig-blue flex items-center justify-between group transition-colors"
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
            placeholder="Type your compelling headliner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl md:text-6xl font-black bg-transparent border-none outline-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-none leading-[1.1] tracking-tight py-2 overflow-hidden text-black dark:text-white"
            rows={1}
          />

          <textarea
            ref={excerptRef}
            placeholder="Sum it up for the home page feed..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full text-xl md:text-3xl font-black text-black dark:text-white bg-transparent border-none outline-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-none leading-relaxed border-l-4 border-black/10 dark:border-white/10 pl-10 whitespace-pre-wrap"
            rows={1}
          />

          {/* Real Textarea for Content */}
          <div className="relative min-h-[600px] pt-10 group/content">
            <textarea
              ref={contentRef}
              placeholder="Tell the story. This is where insights are born. AI is ready to assist..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xl md:text-2xl font-black text-black dark:text-white bg-transparent border-none outline-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-none h-full min-h-[600px] leading-relaxed selection:bg-hig-blue/10 whitespace-pre-wrap"
            />
          </div>
        </div>
      </div>

      {/* Floating Unified Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
         <div className="bg-[var(--background)] border-2 border-black dark:border-white rounded-full p-2 pr-6 shadow-2xl flex items-center justify-between gap-8 backdrop-blur-3xl">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-3 rounded-full hover:bg-rose-500 text-[var(--foreground)] hover:text-white transition-all border border-transparent hover:border-black dark:hover:border-white">
                <X className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/10 dark:border-white/10">
                  <button
                    onClick={() => applyFormat("**", "**")}
                    className="p-3 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-[var(--foreground)] transition-all" title="Bold">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyFormat("_", "_")}
                    className="p-3 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-[var(--foreground)] transition-all" title="Italic">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyFormat("> ", "")}
                    className="p-3 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-[var(--foreground)] transition-all" title="Quote">
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => applyFormat("[", "](https://)")}
                    className="p-3 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-[var(--foreground)] transition-all" title="Link">
                    <LinkIcon className="w-4 h-4" />
                  </button>
              </div>

              <div className="flex items-center gap-1 bg-hig-blue/10 p-1 rounded-full border border-hig-blue/20">
                  <button
                    onClick={() => {
                      if (!content) return;
                      setContent(prev => prev + "\n\nAI Analysis: This section could benefit from more data-driven examples.");
                    }}
                    className="p-3 rounded-full hover:bg-hig-blue hover:text-white text-hig-blue transition-all"
                    title="AI Enhance"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (!content) return;
                      setContent("AI is rewriting...");
                      setTimeout(() => setContent(content + "\n\n(AI Rewrite complete)"), 1000);
                    }}
                    className="p-3 rounded-full hover:bg-hig-blue hover:text-white text-hig-blue transition-all" title="AI Rewrite">
                    <Sparkles className="w-4 h-4" />
                  </button>
              </div>
            </div>

            <div className="flex items-center gap-10 flex-1 justify-center px-10">
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black uppercase tracking-tighter text-hig-blue">Editing</span>
                 <span className="text-[10px] font-bold text-[var(--foreground)] opacity-40">Saved 12:42</span>
              </div>
              <div className="flex flex-col items-center border-l border-black/10 dark:border-white/10 pl-10">
                 <span className="text-[10px] font-black uppercase text-[var(--foreground)] opacity-40 leading-none">Words</span>
                 <span className="text-sm font-black text-[var(--foreground)] mt-1">{content.split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div className="flex flex-col items-center border-l border-black/10 dark:border-white/10 pl-10">
                 <span className="text-[10px] font-black uppercase text-[var(--foreground)] opacity-40 leading-none">Read</span>
                 <span className="text-sm font-black text-[var(--foreground)] mt-1">{Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)}m</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <button className="p-3 rounded-full border-2 border-black dark:border-white text-[var(--foreground)] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                  <Eye className="w-5 h-5" />
               </button>
               <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-hig-blue text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
               >
                 {isPublishing ? "..." : "Publish Now"} <Send className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
