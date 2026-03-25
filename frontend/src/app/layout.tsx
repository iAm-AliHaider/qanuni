import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";

export const metadata: Metadata = {
  title: "Qanuni — قانوني",
  description: "Law Firm Management Platform for Saudi Arabia — streamline cases, contracts, clients, and compliance.",
  manifest: "/manifest.json",
  icons: { apple: "/icon-192.png" },
  openGraph: {
    title: "Qanuni — قانوني",
    description: "Law Firm Management Platform for Saudi Arabia — streamline cases, contracts, clients, and compliance.",
    url: "https://qanuni.middlemind.ai",
    siteName: "Qanuni",
    type: "website",
    locale: "en",
    images: [
      {
        url: "https://qanuni.middlemind.ai/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Qanuni Law Firm Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MiddleMindAI",
    creator: "@MiddleMindAI",
  },
  alternates: {
    canonical: "https://qanuni.middlemind.ai",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10B981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": "Qanuni",
    "description": "Law firm management platform for case management, contracts, and compliance. Serving Saudi Arabia with Arabic and English support.",
    "url": "https://qanuni.middlemind.ai",
    "provider": {
      "@type": "Organization",
      "name": "MiddleMind",
      "url": "https://middlemind.ai",
    },
    "areaServed": {
      "@type": "Country",
      "name": "Saudi Arabia",
    },
    "serviceType": ["Legal Services", "Law Practice Management", "Compliance"],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
