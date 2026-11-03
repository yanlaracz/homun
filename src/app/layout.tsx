import type { Metadata } from "next";
import "./globals.css";
import { propertyConfig } from "@/config/property";

export const metadata: Metadata = {
  title: propertyConfig.seo.title,
  description: propertyConfig.seo.description,
  openGraph: { title: propertyConfig.seo.title, description: propertyConfig.seo.description, locale: "es_MX", type: "website", siteName: propertyConfig.brand.fullName },
  twitter: { card: "summary_large_image", title: propertyConfig.seo.title, description: propertyConfig.seo.description },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
