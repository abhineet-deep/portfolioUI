import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import clsx from "clsx";
import { site } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { personJsonLdString } from "@/lib/jsonld";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Toast } from "@/components/Toast";
import { ThemeColorMeta } from "@/components/ThemeColorMeta";
import { Cursor } from "@/components/Cursor";
import { SceneLoader } from "@/components/three/SceneLoader";
import { CommandMenu } from "@/components/CommandMenu";
import "./globals.css";

const sans = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    url: siteUrl,
    siteName: site.name,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1522" },
    { media: "(prefers-color-scheme: light)", color: "#F2F4F9" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={clsx(sans.variable, mono.variable)}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="portfolio-theme" themes={["dark", "light"]} disableTransitionOnChange>
          <SmoothScroll />
          {children}
          <CommandMenu />
          <SceneLoader />
          <Cursor />
          <ThemeColorMeta />
          <Toast />
          <div className="grain" aria-hidden="true" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: personJsonLdString() }}
          />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
