import { Calendar, MapPin, Search, Filter, ArrowUpRight, Clock, Star} from"lucide-react";
import Image from"next/image";
import { EVENTS} from"@/lib/data";

export default function EventsPage() {
 return (
 <div className="max-w-7xl mx-auto px-6 py-12">
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
"@context":"https://schema.org",
"@type":"ItemList",
"itemListElement": EVENTS.map((e, i) => ({
"@type":"ListItem",
"position": i + 1,
"item": {
"@type":"Event",
"name": e.title,
"description": e.description,
"startDate": e.date,
"location": {
"@type":"Place",
"name": e.location
},
"image": e.image
}
}))
})
}}
 />
 <header className="mb-16 flex flex-col md:flex-row items-end justify-between gap-8 md:gap-12">
 <div className="space-y-6 max-w-2xl">
 <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight">Industry Events</h1>
 <p className="text-xl text-secondary leading-relaxed font-medium">
 The most significant marketing, PR, and advertising events worldwide, gathered in one place.
 </p>
 <div className="relative group max-w-md">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
 <input
 className="w-full bg-[var(--muted)] rounded-2xl py-4 pl-12 pr-6 text-[var(--foreground)] placeholder:text-secondary focus:ring-2 focus:ring-hig-blue/20 transition-all font-medium"
 placeholder="Search for events, cities or topics..."
 />
 </div>
 </div>

 <div className="flex gap-4">
 <button className="flex items-center gap-2 hig-button-secondary py-4 px-6">
 <Filter className="w-4 h-4" />
 Filters
 </button>
 <button className="hig-button-primary py-4 px-8">Add Event</button>
 </div>
 </header>

 {/* Featured Event */}
 <section className="mb-20">
 <div className="relative h-[480px] rounded-[40px] overflow-hidden group shadow-2xl shadow-black/20">
 <Image
 src={EVENTS[0].image}
 alt={EVENTS[0].title}
 fill
 className="object-cover transition-transform duration-1000 group-hover:scale-105"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

 <div className="absolute bottom-0 left-0 right-0 p-12 space-y-6">
 <div className="flex items-center gap-3">
 <span className="bg-hig-blue text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
 <Star className="w-3.5 h-3.5 fill-white" />
 Featured
 </span>
 <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
 {EVENTS[0].type}
 </span>
 </div>

 <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl leading-tight tracking-tight">{EVENTS[0].title}</h2>

 <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 text-white/80 font-medium">
 <div className="flex items-center gap-2.5">
 <Calendar className="w-5 h-5 text-hig-blue" />
 {EVENTS[0].date}
 </div>
 <div className="flex items-center gap-2.5">
 <MapPin className="w-5 h-5 text-hig-blue" />
 {EVENTS[0].location}
 </div>
 </div>

 <button className="hig-button-primary text-lg px-10 py-4 flex items-center gap-3">
 Register Interest <ArrowUpRight className="w-5 h-5" />
 </button>
 </div>
 </div>
 </section>

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
 {EVENTS.slice(1).map((event) => (
 <div key={event.id} className="hig-card group overflow-hidden flex flex-col">
 <div className="h-[220px] overflow-hidden relative">
 <Image
 src={event.image}
 alt={event.title}
 fill
 className="object-cover transition-transform duration-700 group-hover:scale-105"
 />
 <div className="absolute top-4 left-4">
 <span className="bg-[var(--card-bg)] backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]">
 {event.type}
 </span>
 </div>
 </div>

 <div className="p-8 flex-1 flex flex-col space-y-6">
 <div className="space-y-4 flex-1">
 <h3 className="text-xl font-bold leading-tight text-[var(--foreground)] group-hover:text-hig-blue transition-colors">
 {event.title}
 </h3>
 <p className="text-secondary text-sm leading-relaxed line-clamp-3 font-medium">
 {event.description}
 </p>
 </div>

 <div className="pt-6 space-y-3">
 <div className="flex items-center gap-2.5 text-xs font-bold text-secondary">
 <Clock className="w-4 h-4 text-hig-blue" />
 {event.date}
 </div>
 <div className="flex items-center gap-2.5 text-xs font-bold text-secondary">
 <MapPin className="w-4 h-4 text-hig-blue" />
 {event.location}
 </div>
 </div>

 <button className="w-full text-sm font-bold text-hig-blue py-2 rounded-xl hover:bg-hig-blue hover:text-white transition-all">
 Event Details
 </button>
 </div>
 </div>
 ))}

 {/* Placeholder for more */}
 <div className="hig-card p-8 flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover: transition-colors">
 <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center transition-colors group-hover:bg-hig-blue/5">
 <Calendar className="w-6 h-6 text-tertiary group-hover:text-hig-blue" />
 </div>
 <div className="space-y-2">
 <h4 className="font-bold text-lg text-[var(--foreground)]">Suggest an Event</h4>
 <p className="text-sm text-secondary leading-relaxed font-medium">Know about an upcoming conference or webinar? Let us know.</p>
 </div>
 <button className="text-sm font-bold text-hig-blue">Submit Form</button>
 </div>
 </div>
 </div>
 );
}
