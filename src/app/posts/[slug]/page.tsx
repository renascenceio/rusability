import { Clock, User, Share2, MessageCircle, Bookmark, ArrowUpRight, Sparkles, ChevronRight} from"lucide-react";
import Link from"next/link";
import Image from"next/image";
import { ARTICLES, INDUSTRY_TOOLS, type Article, INDUSTRY_NEWS} from"@/lib/data";
import { notFound} from"next/navigation";
import { ArticlePlugin} from"@/components/ArticlePlugin";
import { Metadata} from'next';
import { ReadingProgress} from"@/components/ReadingProgress";
import { Claps} from"@/components/Claps";

export async function generateMetadata(
 props: { params: Promise<{ slug: string}>}
): Promise<Metadata> {
 const { slug} = await props.params;
 const article = ARTICLES.find(a => a.id.toString() === slug);

 const title = article ? `${article.title} | Rusability Magazine` :'The Future of Marketing | Rusability Magazine';
 const description = article ? article.excerpt :'Exploring the next frontier of digital marketing.';
 const image = article ? article.image :'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200';

 return {
 title,
 description,
 openGraph: {
 title,
 description,
 images: [image],
 type:'article',
},
 twitter: {
 card:'summary_large_image',
 title,
 description,
 images: [image],
},
};
}

export default async function PostPage(props: { params: Promise<{ slug: string}>}) {
 const { slug} = await props.params;

 const article = ARTICLES.find(a => a.id.toString() === slug);

 if (!article) {
 if (slug !=="future-of-marketing-ai") {
 notFound();
}
}

 const displayData: Article = article || {
 id: 0,
 title:"The Future of Marketing: How AI is Redefining Personalization",
 excerpt:"Exploring the next frontier of digital marketing.",
 category:"Search Strategy",
 time:"8 min read",
 author:"Elena Rossi",
 image:"https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
 isProAuthor: true
};

 const isProPost = displayData.isProAuthor;
 const authorArticles = ARTICLES.filter(a => a.author === displayData.author && a.id !== displayData.id);
 const relatedNews = INDUSTRY_NEWS.slice(0, 3);

 return (
 <div className={`max-w-7xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-500 ${isProPost ?'pro-editorial' :''}`}>
 <ReadingProgress />
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
"@context":"https://schema.org",
"@type":"Article",
"headline": displayData.title,
"description": displayData.excerpt,
"image": displayData.image,
"author": {
"@type":"Person",
"name": displayData.author
},
"publisher": {
"@type":"Organization",
"name":"Rusability Intelligence",
"logo": {
"@type":"ImageObject",
"url":"https://rusability.vercel.app/logo.png"
}
},
"datePublished":"2024-01-20"
})
}}
 />
 {isProPost && (
 <div className="flex justify-center mb-8">
 <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
 <Sparkles className="w-3 h-3 fill-white" />
 Premium Perspective
 </span>
 </div>
 )}
 <header className="mb-16 text-left max-w-5xl mx-auto lg:mx-0">
 <div className="flex items-center gap-4 mb-10 text-hig-blue font-bold text-xs uppercase tracking-widest">
 <span className="bg-hig-blue/10 px-3 py-1.5 rounded-full">{displayData.category}</span>
 <span className="text-tertiary">•</span>
 <span className="flex items-center gap-2 text-secondary"><Clock className="w-4 h-4 text-hig-blue" /> {displayData.time}</span>
 </div>

 <h1 className="text-3xl md:text-7xl font-bold mb-12 leading-tight tracking-tight text-[var(--foreground)]">
 {displayData.title}
 </h1>

 <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-full bg-[var(--muted)] flex items-center justify-center shadow-sm">
 <User className="w-7 h-7 text-tertiary" />
 </div>
 <div className="space-y-0.5">
 <p className="text-lg font-bold text-[var(--foreground)] leading-none">{displayData.author}</p>
 <p className="text-sm text-secondary font-medium tracking-tight">Chief Content Strategist</p>
 </div>
 </div>

 <div className="hidden md:block h-10 w-px bg-[var(--" />

 <div className="flex items-center gap-4">
 <button className="hig-button-primary py-2 px-6 text-sm flex items-center gap-2">Follow</button>
 <div className="flex gap-2">
 <button className="p-3 text-secondary hover:text-hig-blue transition-colors rounded-full hover:bg-[var(--muted)]"><Share2 className="w-5 h-5" /></button>
 <button className="p-3 text-secondary hover:text-hig-blue transition-colors rounded-full hover:bg-[var(--muted)]"><Bookmark className="w-5 h-5" /></button>
 </div>
 </div>
 </div>
 </header>

 <div className="relative mb-20 rounded-[40px] overflow-hidden shadow-2xl h-[400px] md:h-[600px] dark:">
 <Image
 src={displayData.image}
 alt={displayData.title}
 fill
 priority
 className="object-cover"
 />
 </div>

 <div className="flex flex-col lg:grid lg:grid-cols-[120px,1fr,320px] gap-10 md:gap-20">
 {/* Left Side: Actions */}
 <aside className="hidden lg:block sticky top-32 h-fit space-y-8">
 <div className="flex flex-col items-start gap-8">
 <Claps />

 <div className="flex flex-col items-center gap-2">
 <button className="p-4 text-secondary hover:text-hig-blue transition-colors rounded-full bg-[var(--card-bg-solid)] shadow-sm group">
 <MessageCircle className="w-6 h-6" />
 </button>
 <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">48</span>
 </div>
 </div>
 </aside>

 {/* Middle: Content */}
 <article className="flex-1 space-y-10 max-w-2xl mx-auto lg:mx-0">
 <p className="text-xl md:text-2xl font-medium leading-relaxed text-[var(--foreground)] italic pl-8 py-2">
 The era of mass marketing is ending. AI is not just another tool; it&apos;s the bridge between raw data and hyper-personalized customer experiences.
 </p>

 <p className="text-[var(--foreground)] body-serif">
 In the rapidly evolving landscape of digital marketing, the integration of artificial intelligence (AI) has shifted from a futuristic concept to a present-day necessity. The ability of machine learning algorithms to process vast datasets in real-time is enabling brands to deliver content that resonates on a deeply individual level.
 </p>

 {/* Contextual Injected Content */}
 <ArticlePlugin
 type="tool"
 data={{
 id: INDUSTRY_TOOLS[0].id,
 name: INDUSTRY_TOOLS[0].name,
 description: INDUSTRY_TOOLS[0].description,
 image: INDUSTRY_TOOLS[0].image,
 category: INDUSTRY_TOOLS[0].category,
 link: INDUSTRY_TOOLS[0].link
}}
 />

 <h2 className="text-3xl font-bold tracking-tight pt-10 text-[var(--foreground)]">The Algorithmic Approach to Empathy</h2>

 <p className="text-[var(--foreground)] body-serif">
 One of the most profound impacts of AI in marketing is its role in sentiment analysis and emotional intelligence. By monitoring social signals and engagement patterns, AI engines can now predict the emotional state of a user and adjust the tone of the messaging accordingly. This &quot;algorithmic empathy&quot; is what separates modern personalization from the basic &quot;First Name&quot; tags of the past decade.
 </p>

 <div className="bg-[var(--card-bg-solid)] p-12 rounded-[32px] space-y-6">
 <h3 className="text-xl font-bold uppercase tracking-widest text-hig-blue">Key Insights for 2024</h3>
 <ul className="space-y-4">
 {[
"Zero-Click Searches: Why optimization for the snippet is the new SEO.",
"Voice-to-Task: The rise of invisible interfaces and AI agents.",
"Privacy-First Data: Leveraging first-party data without cross-site tracking."
 ].map((item, i) => (
 <li key={i} className="flex gap-4 items-start">
 <span className="w-6 h-6 rounded-full bg-hig-blue text-white flex items-center justify-center shrink-0 font-bold text-[10px]">{i+1}</span>
 <span className="text-lg font-medium text-[var(--foreground)] dark:text-[var(--foreground)] leading-tight">{item}</span>
 </li>
 ))}
 </ul>
 </div>

 {/* Another Injected Content: Multi-article suggest */}
 <div className="space-y-6 pt-12">
 <h4 className="text-xs font-bold uppercase tracking-widest text-secondary">Related Briefings</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {ARTICLES.slice(1, 3).map(a => (
 <ArticlePlugin
 key={a.id}
 type="article"
 layout="mini"
 data={{
 id: a.id,
 title: a.title,
 description: a.excerpt,
 image: a.image,
 category: a.category
}}
 />
 ))}
 </div>
 </div>

 <p className="text-[var(--foreground)] body-serif">
 As we move further into 2024, the challenge for marketers will be balancing the efficiency of AI with the authenticity that human oversight provides. The brands that succeed will be those that use AI to enhance human creativity, not replace it.
 </p>

 <div className="pt-20 space-y-12">
 <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">More from {displayData.author}</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {(authorArticles.length > 0 ? authorArticles : ARTICLES.slice(3, 5)).map(a => (
 <Link key={a.id} href={`/posts/${a.id}`} className="hig-card p-8 group">
 <div className="space-y-4">
 <div className="flex items-center gap-3 text-xs text-hig-blue font-bold uppercase tracking-widest">
 <span>{a.category}</span>
 <span className="text-tertiary">•</span>
 <span className="text-secondary">{a.time}</span>
 </div>
 <h4 className="text-xl font-bold group-hover:text-hig-blue transition-colors leading-tight text-[var(--foreground)]">{a.title}</h4>
 <p className="text-sm text-secondary font-medium leading-relaxed line-clamp-2">{a.excerpt}</p>
 <div className="inline-flex items-center gap-2 text-sm font-bold text-hig-blue pt-4">Read Now <ArrowUpRight className="w-4 h-4" /></div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </article>

 {/* Right Side: Pulse / Contextual news */}
 <aside className="space-y-12 sticky top-32 h-fit">
 <div className="hig-card p-8">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-8 pb-4 flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
 Live Industry Pulse
 </h4>
 <div className="space-y-6">
 {relatedNews.map(news => (
 <div key={news.id} className="group cursor-pointer">
 <span className="text-[9px] font-bold uppercase text-hig-blue tracking-tighter mb-1 block">{news.category}</span>
 <h5 className="text-sm font-bold leading-tight group-hover:text-hig-blue transition-colors line-clamp-2 text-[var(--foreground)]">{news.title}</h5>
 <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="text-[10px] text-secondary font-bold uppercase">Briefing</span>
 <ChevronRight className="w-4 h-4 text-hig-blue" />
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="hig-card p-8 bg-hig-blue text-white relative overflow-hidden shadow-lg shadow-hig-blue/20">
 <div className="relative z-10 space-y-4">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Pro Perspective</h4>
 <p className="font-bold text-sm leading-relaxed">
 Get the full analysis on how privacy tracking will impact your Q4 ROI.
 </p>
 <button className="bg-white text-hig-blue text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full w-full">Unlock Now</button>
 </div>
 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
 </div>
 </aside>
 </div>
 </div>
 );
}
