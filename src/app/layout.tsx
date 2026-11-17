import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../styles/fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../styles/fonts/inter-latin-ext-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "GC3D — Impression 3D & produits personnalisés",
    template: "%s | GC3D",
  },
  description:
    "Gravure laser, découpe laser, impression UV et impression 3D : créations personnalisées et fabrication sur mesure.",
  applicationName: "GC3D",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "GC3D",
    images: [{ url: "/assets/branding/og-default.png", width: 1200, height: 630, alt: "GC3D" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
