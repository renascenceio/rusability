import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-center px-6 py-6">
        <Link href="/" className="inline-flex items-center" aria-label="Rusability">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rusability-logo-black.png"
            alt="Rusability"
            className="h-6 w-auto dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rusability-logo-white.png"
            alt="Rusability"
            className="hidden h-6 w-auto dark:block"
          />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
