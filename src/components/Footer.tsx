import Link from "next/link";
import { Clock, Globe, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-black dark:text-white">
            rusability
          </Link>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
            The intelligent magazine for marketing, PR, and industry professionals. Empowering decisions through data and AI.
          </p>
          <div className="flex gap-4">
            <button className="p-2 text-zinc-400 hover:text-hig-blue transition-colors">
              <Clock className="w-5 h-5" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-hig-blue transition-colors">
              <Globe className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-6 uppercase tracking-wider text-xs text-zinc-400">Magazine</h4>
          <ul className="space-y-4 text-sm font-medium text-zinc-500">
            <li><Link href="/news" className="hover:text-foreground">Daily News</Link></li>
            <li><Link href="/news" className="hover:text-foreground">Case Studies</Link></li>
            <li><Link href="/news" className="hover:text-foreground">Interviews</Link></li>
            <li><Link href="/news" className="hover:text-foreground">Opinion</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6 uppercase tracking-wider text-xs text-zinc-400">Industry</h4>
          <ul className="space-y-4 text-sm font-medium text-zinc-500">
            <li><Link href="/events" className="hover:text-foreground">Events Directory</Link></li>
            <li><Link href="/tools" className="hover:text-foreground">Marketing Tools</Link></li>
            <li><Link href="/tools" className="hover:text-foreground">PR Resources</Link></li>
            <li><Link href="/events" className="hover:text-foreground">Webinars</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6 uppercase tracking-wider text-xs text-zinc-400">Connect</h4>
          <ul className="space-y-4 text-sm font-medium text-zinc-500">
            <li><Link href="/profile/jdoe" className="hover:text-foreground">Personal Feed</Link></li>
            <li><button className="flex items-center gap-2 hover:text-foreground">Newsletter <ExternalLink className="w-3.5 h-3.5" /></button></li>
            <li><button className="hover:text-foreground">Submit Article</button></li>
            <li><button className="hover:text-foreground">Privacy Policy</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-zinc-200 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[12px] text-zinc-400">
          © {new Date().getFullYear()} Rusability Intelligence. All rights reserved.
        </p>
        <div className="flex gap-8 text-[12px] text-zinc-400">
          <button className="hover:text-foreground">Terms</button>
          <button className="hover:text-foreground">Cookies</button>
          <button className="hover:text-foreground">Legal</button>
        </div>
      </div>
    </footer>
  );
};
