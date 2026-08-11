import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WTI Curve & Spread Terminal",
  description: "Futures term-structure, calendar spreads, and a cost-aware backtest for WTI crude.",
};

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/curve", label: "Curve" },
  { href: "/spreads", label: "Spreads" },
  { href: "/backtest", label: "Backtest" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header
          className="border-b sticky top-0 z-10"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
        >
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="font-semibold tracking-tight">WTI Curve &amp; Spread Terminal</span>
            <nav className="flex gap-5 text-sm text-secondary">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-current">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">{children}</main>
        <footer className="text-xs text-muted text-center py-6">
          Research project, not investment advice. Data: EIA, Yahoo Finance.
        </footer>
      </body>
    </html>
  );
}
