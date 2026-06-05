import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onsite Interview Qualifier",
  description:
    "Score and compare candidates for your onsite interviews against a curated role.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                Q
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Onsite Interview Qualifier
              </span>
            </Link>
            <span className="hidden text-sm text-slate-500 sm:block">
              Resume + intro call &rarr; fit score
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
