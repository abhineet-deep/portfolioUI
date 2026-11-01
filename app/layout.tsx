import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import clsx from "clsx";
import { site } from "@/lib/content";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Toast } from "@/components/Toast";
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
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    url: site.url,
  },
  twitter: { card: "summary", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#0F1522",
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
          <Toast />
          <div className="grain" aria-hidden="true" />
        </ThemeProvider>
      </body>
    </html>
  );
}
