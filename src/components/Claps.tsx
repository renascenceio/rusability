"use client";

import { useState} from"react";
import { Heart} from"lucide-react";
import { motion, AnimatePresence} from"framer-motion";

export const Claps = () => {
 const [claps, setClaps] = useState(1242);
 const [isClapping, setIsClapping] = useState(false);
 const [bursts, setBursts] = useState<{ id: number; x: number; y: number}[]>([]);

 const handleClap = () => {
 setClaps(prev => prev + 1);
 setIsClapping(true);

 const id = Date.now();
 setBursts(prev => [...prev, { id, x: Math.random() * 40 - 20, y: -40 - Math.random() * 20}]);

 setTimeout(() => {
 setBursts(prev => prev.filter(b => b.id !== id));
}, 800);

 setTimeout(() => setIsClapping(false), 300);
};

 return (
 <div className="flex flex-col items-center gap-2 relative">
 <AnimatePresence>
 {bursts.map(burst => (
 <motion.div
 key={burst.id}
 initial={{ opacity: 1, y: 0, scale: 0.5}}
 animate={{ opacity: 0, y: burst.y, scale: 1.5}}
 exit={{ opacity: 0}}
 className="absolute text-rose-500 font-bold pointer-events-none z-20"
 >
 +1
 </motion.div>
 ))}
 </AnimatePresence>

 <motion.button
 whileTap={{ scale: 0.8}}
 onClick={handleClap}
 className={`p-4 rounded-full bg-[var(--card-bg-solid)] shadow-sm group transition-all ${isClapping ?' text-rose-500' :'text-secondary hover:text-rose-500'}`}
 >
 <Heart className={`w-6 h-6 transition-all ${isClapping ?'fill-rose-500 scale-125' :'group-hover:fill-rose-500'}`} />
 </motion.button>
 <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
 {claps.toLocaleString()}
 </span>
 </div>
 );
};
