import type { Metadata} from"next";
import { Geist, Geist_Mono, Playfair_Display} from"next/font/google";
import"./globals.css";
import { Header} from"@/components/Header";
import { Footer} from"@/components/Footer";
import { ThemeProvider} from"@/components/providers/ThemeProvider";

const geistSans = Geist({
 variable:"--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable:"--font-geist-mono",
 subsets: ["latin"],
});

const playfair = Playfair_Display({
 variable:"--font-serif",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title:"rusability | Marketing Intelligence",
 description:"Magazine for marketing, PR, and industry professionals. AI-powered insights and tools.",
 metadataBase: new URL('https://rusability.vercel.app'),
 openGraph: {
 title:'rusability | Marketing Intelligence',
 description:'Magazine for marketing, PR, and industry professionals. AI-powered insights and tools.',
 url:'https://rusability.vercel.app',
 siteName:'rusability',
 images: [
 {
 url:'/og-image.jpg',
 width: 1200,
 height: 630,
 alt:'rusability magazine',
},
 ],
 locale:'en_US',
 type:'website',
},
 twitter: {
 card:'summary_large_image',
 title:'rusability | Marketing Intelligence',
 description:'Magazine for marketing, PR, and industry professionals. AI-powered insights and tools.',
 images: ['/og-image.jpg'],
},
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
"@context":"https://schema.org",
"@type":"WebSite",
"name":"rusability",
"url":"https://rusability.vercel.app",
"description":"Marketing Intelligence Magazine",
"potentialAction": {
"@type":"SearchAction",
"target":"https://rusability.vercel.app/search?q={search_term_string}",
"query-input":"required name=search_term_string"
}
})
}}
 />
 </head>
 <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased selection:bg-hig-blue selection:text-white`}>
 <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 <Header />
 <main className="min-h-screen pt-16">
 {children}
 </main>
 <Footer />
 </ThemeProvider>
 </body>
 </html>
 );
}
