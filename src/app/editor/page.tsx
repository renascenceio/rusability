"use client";

import { useState, useRef, useEffect} from"react";
import { Image as ImageIcon, Send, Sparkles, X, ChevronDown, Check, Wand2, Eye, Bold, Italic, Link as LinkIcon, Quote} from"lucide-react";
import Link from"next/link";
import Image from"next/image";

export default function EditorPage() {
 const [isPublishing, setIsPublishing] = useState(false);
 const [showCategoryMenu, setShowCategoryMenu] = useState(false);
 const [selectedCategory, setSelectedCategory] = useState("Search Strategy");
 const categories = ["Search Strategy","Public Relations","Content Strategy","Digital Privacy","Branding","Social Strategy"];

 // Content State
 const [title, setTitle] = useState("");
 const [excerpt, setExcerpt] = useState("");
 const [content, setContent] = useState("");
 const [coverImage, setCoverImage] = useState<string | null>(null);

 const fileInputRef = useRef<HTMLInputElement>(null);
 const titleRef = useRef<HTMLTextAreaElement>(null);
 const excerptRef = useRef<HTMLTextAreaElement>(null);
 const contentRef = useRef<HTMLTextAreaElement>(null);

 const applyFormat = (prefix: string, suffix: string ="") => {
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
 titleRef.current.style.height ='auto';
 titleRef.current.style.height = titleRef.current.scrollHeight +'px';
}
 if (excerptRef.current) {
 excerptRef.current.style.height ='auto';
 excerptRef.current.style.height = excerptRef.current.scrollHeight +'px';
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
 className={`relative group aspect-[21/9] w-full rounded-[40px] overflow-hidden transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer ${ coverImage ?'' :'bg-[var(--muted)] hover: hover:bg-hig-blue/5'}`}
 >
 {coverImage ? (
 <>
 <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <div className="p-4 rounded-full bg-[var(--card-bg-solid)] text-hig-blue font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
 <ImageIcon className="w-5 h-5" /> Change Cover Photo
 </div>
 </div>
 </>
 ) : (
 <>
 <div className="p-8 rounded-full bg-[var(--card-bg-solid)] shadow-sm group-hover:scale-110 transition-transform">
 <ImageIcon className="w-10 h-10 text-hig-blue" />
 </div>
 <div className="text-center space-y-2">
 <p className="text-xl font-bold text-[var(--foreground)] tracking-tight">Add an evocative cover image</p>
 <p className="text-sm text-secondary font-bold uppercase tracking-widest">1600 x 900px recommended. Max 10MB.</p>
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
 className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-hig-blue/10 text-hig-blue text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-hig-blue/20 transition-all shadow-sm"
 >
 {selectedCategory}
 <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showCategoryMenu ?'rotate-180' :''}`} />
 </button>

 {showCategoryMenu && (
 <div className="absolute top-full left-0 mt-3 w-72 hig-card p-2 z-50 bg-[var(--card-bg)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-black/5">
 <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">Select Category</div>
 {categories.map((cat) => (
 <button
 key={cat}
 onClick={() => {
 setSelectedCategory(cat);
 setShowCategoryMenu(false);
}}
 className="w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-bold text-[var(--foreground)] hover:bg-hig-blue/10 hover:text-hig-blue flex items-center justify-between group transition-colors"
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
 className="w-full text-3xl md:text-6xl font-bold bg-transparent outline-none placeholder:text-secondary/30 resize-none leading-[1.1] tracking-tight py-2 overflow-hidden text-[var(--foreground)]"
 rows={1}
 />

 <textarea
 ref={excerptRef}
 placeholder="Sum it up for the home page feed..."
 value={excerpt}
 onChange={(e) => setExcerpt(e.target.value)}
 className="w-full text-xl md:text-3xl font-bold text-[var(--foreground)] bg-transparent outline-none placeholder:text-secondary/30 resize-none leading-relaxed pl-10 whitespace-pre-wrap"
 rows={1}
 />

 {/* Real Textarea for Content */}
 <div className="relative min-h-[600px] pt-10 group/content">
 <textarea
 ref={contentRef}
 placeholder="Tell the story. This is where insights are born. AI is ready to assist..."
 value={content}
 onChange={(e) => setContent(e.target.value)}
 className="w-full text-xl md:text-2xl font-bold text-[var(--foreground)] bg-transparent outline-none placeholder:text-secondary/30 resize-none h-full min-h-[600px] leading-relaxed selection:bg-hig-blue/10 whitespace-pre-wrap body-serif"
 />
 </div>
 </div>
 </div>

 {/* Floating Unified Toolbar */}
 <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
 <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-full p-2 pr-6 shadow-2xl flex items-center justify-between gap-8">
 <div className="flex items-center gap-3">
 <Link href="/" className="p-3 rounded-full hover:bg-rose-500 text-secondary hover:text-white transition-all">
 <X className="w-5 h-5" />
 </Link>

 <div className="flex items-center gap-1 bg-[var(--muted)] p-1 rounded-full">
 <button
 onClick={() => applyFormat("**","**")}
 className="p-3 rounded-full hover:bg-[var(--card-bg-solid)] text-secondary hover:text-hig-blue transition-all" title="Bold">
 <Bold className="w-4 h-4" />
 </button>
 <button
 onClick={() => applyFormat("_","_")}
 className="p-3 rounded-full hover:bg-[var(--card-bg-solid)] text-secondary hover:text-hig-blue transition-all" title="Italic">
 <Italic className="w-4 h-4" />
 </button>
 <button
 onClick={() => applyFormat(">","")}
 className="p-3 rounded-full hover:bg-[var(--card-bg-solid)] text-secondary hover:text-hig-blue transition-all" title="Quote">
 <Quote className="w-4 h-4" />
 </button>
 <button
 onClick={() => applyFormat("[","](https://)")}
 className="p-3 rounded-full hover:bg-[var(--card-bg-solid)] text-secondary hover:text-hig-blue transition-all" title="Link">
 <LinkIcon className="w-4 h-4" />
 </button>
 </div>

 <div className="flex items-center gap-1 bg-hig-blue/10 p-1 rounded-full">
 <button
 onClick={() => {
 if (!content) return;
 setContent(prev => prev +"\n\nAI Analysis: This section could benefit from more data-driven examples.");
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
 setTimeout(() => setContent(content +"\n\n(AI Rewrite complete)"), 1000);
}}
 className="p-3 rounded-full hover:bg-hig-blue hover:text-white text-hig-blue transition-all" title="AI Rewrite">
 <Sparkles className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="flex items-center gap-10 flex-1 justify-center px-10">
 <div className="flex flex-col items-center">
 <span className="text-[10px] font-bold uppercase tracking-tighter text-hig-blue">Editing</span>
 <span className="text-[10px] font-bold text-tertiary">Saved 12:42</span>
 </div>
 <div className="flex flex-col items-center pl-10">
 <span className="text-[10px] font-bold uppercase text-secondary leading-none">Words</span>
 <span className="text-sm font-bold text-[var(--foreground)] mt-1">{content.split(/\s+/).filter(Boolean).length}</span>
 </div>
 <div className="flex flex-col items-center pl-10">
 <span className="text-[10px] font-bold uppercase text-secondary leading-none">Read</span>
 <span className="text-sm font-bold text-[var(--foreground)] mt-1">{Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)}m</span>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button className="p-3 rounded-full text-secondary hover:text-hig-blue transition-all">
 <Eye className="w-5 h-5" />
 </button>
 <button
 onClick={handlePublish}
 disabled={isPublishing}
 className="hig-button-primary px-8 flex items-center gap-3"
 >
 {isPublishing ?"..." :"Publish Now"} <Send className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
