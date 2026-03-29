"use client";

import { useEffect, useState} from"react";

export const ReadingProgress = () => {
 const [completion, setCompletion] = useState(0);

 useEffect(() => {
 const updateScrollCompletion = () => {
 const currentProgress = window.scrollY;
 const scrollHeight = document.body.scrollHeight - window.innerHeight;
 if (scrollHeight) {
 setCompletion(
 Number((currentProgress / scrollHeight).toFixed(2)) * 100
 );
}
};

 window.addEventListener("scroll", updateScrollCompletion);
 return () => window.removeEventListener("scroll", updateScrollCompletion);
}, []);

 return (
 <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent">
 <div
 className="h-full bg-hig-blue transition-all duration-150 ease-out"
 style={{ width: `${completion}%`}}
 />
 </div>
 );
};
