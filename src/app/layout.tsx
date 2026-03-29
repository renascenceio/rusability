import type { Metadata} from"next";
import { Geist, Geist_Mono, Playfair_Display} from"next/font/google";
import"./globals.css";
import { Header} from"@/components/Header";
import { Footer} from"@/components/Footer";
import { ThemeProvider} from"@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/context";
import { getSiteSettings } from "@/lib/settings";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const isRu = settings.default_language === "ru";

  return {
    title: isRu ? settings.site_title_ru : settings.site_title_en,
    description: isRu ? settings.site_description_ru : settings.site_description_en,
    metadataBase: new URL('https://rusability.vercel.app'),
    openGraph: {
      title: isRu ? settings.site_title_ru : settings.site_title_en,
      description: isRu ? settings.site_description_ru : settings.site_description_en,
      url: 'https://rusability.vercel.app',
      siteName: 'rusability',
      images: [
        {
          url: settings.og_image,
          width: 1200,
          height: 630,
          alt: 'rusability magazine',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isRu ? settings.site_title_ru : settings.site_title_en,
      description: isRu ? settings.site_description_ru : settings.site_description_en,
      images: [settings.og_image],
    },
  };
}

export default async function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

 return (
 <html lang={settings.default_language} suppressHydrationWarning>
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
 <LanguageProvider initialLocale={settings.default_language}>
 <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 <Header />
 <main className="min-h-screen pt-16">
 {children}
 </main>
 <Footer />
 </ThemeProvider>
 </LanguageProvider>
 </body>
 </html>
 );
}
