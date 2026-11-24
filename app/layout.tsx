import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Logo } from "@/components/Logo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Citebot: support answers with receipts",
  description: "A RAG support bot that cites its sources, hands off to a human when unsure, and publishes its own accuracy numbers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 text-sm">
            <Link href="/"><Logo /></Link>
            <div className="flex items-center gap-5 text-muted">
              <Link className="hover:text-ink" href="/#how">How it works</Link>
              <Link className="hover:text-ink" href="/evals">Evals</Link>
              <a className="hover:text-ink" href="https://github.com/Lakshay85/citebot" target="_blank" rel="noreferrer">GitHub</a>
              <Link className="rounded-full bg-accent px-4 py-1.5 font-medium text-black hover:brightness-110" href="/demo">Try the demo</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-24 border-t border-line py-10 text-center text-xs text-muted">
          Citebot is a portfolio case study by Lakshay Rohilla. Sample companies (Lumen, Parcelo, Fernwood) are fictional.
        </footer>
      </body>
    </html>
  );
}
