import type { Metadata } from "next";
import { Alegreya, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rusability — редакционная платформа нового поколения",
    template: "%s — Rusability",
  },
  description:
    "Русскоязычная редакционная платформа: статьи, новости, авторская среда и ИИ-редакция. Digital, маркетинг, технологии и UX.",
  metadataBase: new URL("https://rusability.vercel.app"),
  openGraph: {
    title: "Rusability",
    description: "Русскоязычная редакционная платформа нового поколения",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#14110d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning className="bg-background">
      <body
        className={`${jakarta.variable} ${alegreya.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
