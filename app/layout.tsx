import type { Metadata, Viewport } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const caprasimo = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caprasimo",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrashDex - Scan it. Sort it.",
  description:
    "Photograph a waste item. TrashDex identifies the material, sorts the stream, and shows you how to dispose of it.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5ead8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${caprasimo.variable} ${figtree.variable}`}>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="brand" aria-label="TrashDex home">
              <span className="brand-mark" aria-hidden="true">
                T
              </span>
              <span>TrashDex</span>
            </Link>
            <nav className="site-nav" aria-label="Main">
              <Link href="/">Scanner</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/insights">Insights</Link>
            </nav>
          </header>

          {children}

          <footer className="site-footer">
            <p>TrashDex is a school project. AI results can be wrong.</p>
            <p>
              Photos are sent to Google Gemini for analysis and are not stored by TrashDex. On the
              free tier, Google may use them to improve its products.
            </p>
            <p>Disposal guidance is general. Check your school or local waste service.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
