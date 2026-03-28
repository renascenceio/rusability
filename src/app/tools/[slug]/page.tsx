import { INDUSTRY_TOOLS } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Sparkles, ShieldCheck, PieChart, MessageSquare } from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-8 h-8 text-hig-blue" />,
  MessageSquare: <MessageSquare className="w-8 h-8 text-hig-blue" />,
  PieChart: <PieChart className="w-8 h-8 text-hig-blue" />,
  ShieldCheck: <ShieldCheck className="w-8 h-8 text-hig-blue" />,
};

export default async function ToolDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const tool = INDUSTRY_TOOLS.find(t => t.link.includes(slug));

  if (!tool) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col lg:flex-row items-start gap-12 border-b border-[var(--border)] pb-16">
        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-[32px] overflow-hidden shadow-2xl border border-[var(--border)]">
          <Image src={tool.image} alt={tool.name} fill className="object-cover" />
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-hig-blue/5 border border-hig-blue/10">
                {tool.icon ? ICON_MAP[tool.icon] : <Sparkles className="w-8 h-8 text-hig-blue" />}
             </div>
             <div className="bg-hig-blue text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
               {tool.category}
             </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{tool.name}</h1>
          <p className="text-xl md:text-2xl text-[var(--foreground)] leading-relaxed font-medium max-w-3xl">
            {tool.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
             <button className="w-full sm:w-auto hig-button-primary px-12 py-5 text-base flex items-center justify-center gap-3">
               Connect Now <ExternalLink className="w-5 h-5" />
             </button>
             <button className="w-full sm:w-auto hig-button-secondary px-12 py-5 text-base border-none text-[var(--foreground)]">
               View Community Review
             </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
         <div className="lg:col-span-2 space-y-12">
            <h2 className="text-3xl font-bold tracking-tight">Why marketing professionals love {tool.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { t: "AI Precision", d: "Next-gen machine learning that adapts to your unique brand voice and audience." },
                 { t: "Real-time Metrics", d: "Zero-latency data synchronization across all your connected marketing platforms." },
                 { t: "Collaborative Intelligence", d: "Shared workspaces designed for multi-disciplinary PR and Search teams." },
                 { t: "Deep Personalization", d: "Leverage advanced heuristics to tailor content at an individual scale." }
               ].map((feat, i) => (
                 <div key={i} className="hig-card p-10 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-hig-blue/5 flex items-center justify-center text-hig-blue font-bold">
                       {i+1}
                    </div>
                    <h4 className="font-black text-xl italic">{feat.t}</h4>
                    <p className="text-[var(--foreground)] font-medium leading-relaxed">{feat.d}</p>
                 </div>
               ))}
            </div>
         </div>

         <aside className="space-y-10">
            <div className="hig-card p-10 bg-[var(--muted)]/50 border-[var(--border)]">
               <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--foreground)] mb-8 pb-4 border-b border-[var(--border)]">Pricing Context</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="font-bold text-[var(--foreground)]">Basic Tier</span>
                     <span className="text-sm font-black text-[var(--foreground)]">Free</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--background)] border border-hig-blue/20 shadow-lg shadow-hig-blue/10">
                     <span className="font-bold text-hig-blue">Pro Edition</span>
                     <span className="text-sm font-black text-hig-blue">$49/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="font-bold text-[var(--foreground)]">Enterprise</span>
                     <span className="text-sm font-black text-[var(--foreground)]">Contact Sales</span>
                  </div>
               </div>
            </div>

            <div className="hig-card p-10 bg-hig-blue text-white relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                  <h3 className="font-black italic text-2xl">Want to master {tool.name}?</h3>
                  <p className="text-sm font-medium opacity-80 leading-relaxed">Join our upcoming webinar on June 22nd to learn how to increase your ROI by 40%.</p>
                  <button className="w-full bg-white text-hig-blue font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl group-hover:scale-105 transition-transform">Register Now</button>
               </div>
               <Sparkles className="absolute -bottom-10 -right-10 w-40 h-40 text-white/10 -rotate-12 group-hover:scale-125 transition-transform duration-700" />
            </div>
         </aside>
      </div>
    </div>
  );
}
