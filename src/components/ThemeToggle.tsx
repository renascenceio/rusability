"use client";

import { useTheme} from"next-themes";
import { useEffect, useState} from"react";
import { Moon, Sun} from"lucide-react";

export const ThemeToggle = () => {
 const { theme, setTheme} = useTheme();
 const [mounted, setMounted] = useState(false);

 // Avoid hydration mismatch
 useEffect(() => setMounted(true), []);

 if (!mounted) return <div className="w-10 h-10" />;

 return (
 <button
 onClick={() => setTheme(theme ==="dark" ?"light" :"dark")}
 className="p-2.5 rounded-full bg-amber-400/10 text-[var(--foreground)] hover:text-hig-blue transition-all active:scale-90"
 aria-label="Toggle Theme"
 >
 {theme ==="dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
 </button>
 );
};
