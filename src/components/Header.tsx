"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, User, Menu, X, Command, Edit3, Shield } from "lucide-react";
import { SpotlightSearch } from "./SpotlightSearch";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { CURRENT_USER } from "@/lib/data";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const logoSrc = resolvedTheme === "dark" ? "/branding/logo-white.png" : "/branding/logo-black.png";
  const isAdmin = CURRENT_USER.membership === "pro"; // For demo purposes, Pro is superadmin

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "hig-glass py-2" : "bg-transparent py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          <Link href="/" className="relative h-6 w-32 md:w-40 shrink-0">
             {mounted ? (
               <Image
                src={logoSrc}
                alt="Rusability"
                fill
                className="object-contain"
                priority
               />
             ) : (
               <span className="text-2xl font-bold tracking-tight text-black dark:text-white">rusability</span>
             )}
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-hig-gray-400">
            <Link href="/" className="flex items-center gap-2 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/news" className="flex items-center gap-2 hover:text-foreground transition-colors">
              News
            </Link>
            <Link href="/events" className="flex items-center gap-2 hover:text-foreground transition-colors">
              Events
            </Link>
            <Link href="/tools" className="flex items-center gap-2 hover:text-foreground transition-colors">
              Tools
            </Link>
          </nav>

          <div className="flex-1 max-w-md hidden lg:flex items-center relative group">
            <Search className="absolute left-3 w-4 h-4 text-zinc-300 dark:text-zinc-500" />
            <input
              onClick={() => setIsSearchOpen(true)}
              readOnly
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl py-2 pl-10 pr-12 text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer focus:ring-2 focus:ring-hig-blue/10 transition-all"
              placeholder="Search anything..."
            />
            <div className="absolute right-3 flex items-center gap-1 px-1.5 py-0.5 border border-zinc-100 dark:border-zinc-700 rounded-md bg-white dark:bg-black">
               <Command className="w-2.5 h-2.5 text-zinc-300 dark:text-zinc-500" />
               <span className="text-[10px] text-zinc-400">K</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <Link href="/admin" className="p-2.5 rounded-full bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-white transition-all border border-amber-400/20" title="Admin Dashboard">
                <Shield className="w-5 h-5" />
              </Link>
            )}

            <ThemeToggle />

            <Link href="/editor" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-hig-blue text-white text-xs font-black uppercase tracking-widest hover:bg-hig-blue-dark transition-all shadow-lg hover:shadow-hig-blue/20 group">
              <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Write
            </Link>

            <button className="p-2 text-hig-gray-400 hover:text-foreground transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
            </button>
            <Link href="/profile/jdoe" className="p-2 text-hig-gray-400 hover:text-foreground transition-colors">
              <User className="w-5 h-5 border border-zinc-200 dark:border-zinc-800 rounded-full" />
            </Link>
            <button className="md:hidden p-2 text-hig-gray-400 hover:text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
             <Link href="/" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
             <Link href="/news" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
             <Link href="/events" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Events</Link>
             <Link href="/tools" className="text-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Tools</Link>
             {isAdmin && <Link href="/admin" className="text-lg font-semibold text-amber-500" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>}
             <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />
             <Link href="/editor" className="text-lg font-semibold flex items-center gap-2 text-hig-blue" onClick={() => setIsMobileMenuOpen(false)}>
                <Edit3 className="w-5 h-5" /> Write Article
             </Link>
          </div>
        )}
      </header>

      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
