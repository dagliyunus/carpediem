import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/siteConfig";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { VercelAnalytics } from "@/components/analytics/VercelAnalytics";
import { getPublicSiteRuntime } from "@/lib/cms/runtime";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "optional",
  preload: false,
  weight: ["700"],
});


export async function generateMetadata(): Promise<Metadata> {
  const runtime = await getPublicSiteRuntime();

  const siteName = runtime.site?.siteName || siteConfig.name;
  const siteUrl = runtime.site?.siteUrl || siteConfig.seo.domain;
  const description =
    runtime.seo?.description ||
    runtime.site?.defaultSeoDescription ||
    siteConfig.seo.defaultDescription;
  const ogTitle = runtime.seo?.openGraphTitle || runtime.seo?.title || siteName;
  const ogDescription = runtime.seo?.openGraphDescription || description;
  const ogImageUrl = runtime.seo?.ogImage?.url || `${siteUrl}/images/outside_night.webp`;

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: siteUrl,
      siteName,
      locale: "de_DE",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1536,
          height: 1024,
          alt: runtime.seo?.ogImage?.altText || `${siteName} in Bad Saarow`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
    icons: {
      icon: [
        { url: "/images/icons/favicon-logo.png", type: "image/png", sizes: "1024x1024" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/favicon.ico",
      apple: "/images/icons/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      other: {
        "p:domain_verify": "b059be9c5bf8f0f2aa35ecd9c4e6144e",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtime = await getPublicSiteRuntime();
  const ga4Id = runtime.site?.trackingGa4Id || siteConfig.tracking.ga4Id;

  return (
    <html lang="de" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased selection:bg-primary-500 selection:text-white`}
        suppressHydrationWarning
      >
        <GoogleAnalytics ga4Id={ga4Id} />
        <JsonLd />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <ConsentBanner />
        <VercelAnalytics />
      </body>
    </html>
  );
}
