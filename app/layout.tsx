import type { Metadata, Viewport } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locale";
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

const siteUrl = "https://trashdex.vercel.app";
const siteDescription =
  "Photograph one waste item and get the material, waste stream, and Indonesia disposal guidance. Built to reduce wrong sorting and contamination.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TrashDex - Scan it. Sort it.",
  description: siteDescription,
  applicationName: "TrashDex",
  openGraph: {
    title: "TrashDex - Scan it. Sort it.",
    description: siteDescription,
    url: siteUrl,
    siteName: "TrashDex",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrashDex - Scan it. Sort it.",
    description: siteDescription,
  },
  appleWebApp: {
    capable: true,
    title: "TrashDex",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5ead8",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <html lang={locale} className={`${caprasimo.variable} ${figtree.variable}`}>
      <body>
        <LanguageProvider initialLocale={locale}>
          <div className="site-shell">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
