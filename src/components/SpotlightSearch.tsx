"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, Command, X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const SpotlightSearch = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (query.length > 2) {
      // Mock AI suggestions
      const timer = setTimeout(() => {
        setSuggestions([
          `AI in ${query} marketing`,
          `Trends for ${query} in 2024`,
          `Best ${query} tools for PR`
        ]);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setSuggestions([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        <div className="flex items-center p-4 gap-3 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            placeholder="Search anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
            <Command className="w-3 h-3 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500">K</span>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-zinc-400 hover:text-zinc-600" />
          </button>
        </div>

        <div className="p-4">
          {query.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Suggestions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {["Marketing Trends 2024", "Social Media ROI", "AI Copywriting Tools", "PR Strategy"].map((item) => (
                  <button key={item} className="flex items-center gap-3 p-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                    <Search className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl group transition-colors">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-hig-blue" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{suggestion}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <p className="text-[10px] text-zinc-400">Press Esc to close</p>
          <div className="flex gap-4">
             <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-500">Powered by Rusability AI</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
