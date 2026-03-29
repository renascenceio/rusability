import Link from"next/link";
import { Clock, Globe, ExternalLink} from"lucide-react";

export const Footer = () => {
 return (
 <footer className="bg-[var(--background)] pt-20 pb-12">
 <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
 <div className="space-y-6">
 <Link href="/" className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
 rusability
 </Link>
 <p className="text-sm text-secondary leading-relaxed max-w-xs font-medium">
 The intelligent magazine for marketing, PR, and industry professionals. Empowering decisions through data and AI.
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
 <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-secondary">Magazine</h4>
 <ul className="space-y-4 text-sm font-semibold text-secondary">
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">Daily News</Link></li>
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">Case Studies</Link></li>
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">Interviews</Link></li>
 <li><Link href="/news" className="hover:text-[var(--foreground)] transition-colors">Opinion</Link></li>
 </ul>
 </div>

 <div>
 <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-secondary">Industry</h4>
 <ul className="space-y-4 text-sm font-semibold text-secondary">
 <li><Link href="/events" className="hover:text-[var(--foreground)] transition-colors">Events Directory</Link></li>
 <li><Link href="/tools" className="hover:text-[var(--foreground)] transition-colors">Marketing Tools</Link></li>
 <li><Link href="/tools" className="hover:text-[var(--foreground)] transition-colors">PR Resources</Link></li>
 <li><Link href="/events" className="hover:text-[var(--foreground)] transition-colors">Webinars</Link></li>
 </ul>
 </div>

 <div>
 <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-secondary">Connect</h4>
 <ul className="space-y-4 text-sm font-semibold text-secondary">
 <li><Link href="/profile/jdoe" className="hover:text-[var(--foreground)] transition-colors">Personal Feed</Link></li>
 <li><button className="flex items-center gap-2 hover:text-[var(--foreground)] transition-colors">Newsletter <ExternalLink className="w-3.5 h-3.5" /></button></li>
 <li><button className="hover:text-[var(--foreground)] transition-colors">Submit Article</button></li>
 <li><button className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</button></li>
 </ul>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
 <p className="text-[12px] text-tertiary font-medium">
 © {new Date().getFullYear()} Rusability Intelligence. All rights reserved.
 </p>
 <div className="flex gap-8 text-[12px] text-tertiary font-medium">
 <button className="hover:text-[var(--foreground)] transition-colors">Terms</button>
 <button className="hover:text-[var(--foreground)] transition-colors">Cookies</button>
 <button className="hover:text-[var(--foreground)] transition-colors">Legal</button>
 </div>
 </div>
 </footer>
 );
};
