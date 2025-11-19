import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "alertifyjs/build/css/alertify.css";
import "leaflet/dist/leaflet.css";
import StoreProvider from "@/lib/redux/StoreProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://where-is-this.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Where is this? - Find Movie Filming Locations",
    template: "%s | Where is this?"
  },
  description: "Discover where your favorite movies were filmed! Find exact filming locations on an interactive map. Explore popular movie locations, search by film title, and see where iconic scenes were shot. Your ultimate guide to movie filming locations worldwide.",
  keywords: [
    "movie filming locations",
    "film locations",
    "where was this filmed",
    "movie location finder",
    "filming spots",
    "movie sets",
    "location scouting",
    "movie map",
    "film geography",
    "cinema locations",
    "movie tourism",
    "film destinations"
  ],
  authors: [{ name: "Evren Aktaş", url: "https://github.com/aktasevren" }],
  creator: "Evren Aktaş",
  publisher: "Evren Aktaş",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Where is this?",
    title: "Where is this? - Find Movie Filming Locations",
    description: "Discover where your favorite movies were filmed! Find exact filming locations on an interactive map.",
    images: [
      {
        url: "/assets/film.png",
        width: 1200,
        height: 630,
        alt: "Where is this? - Movie Filming Location Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where is this? - Find Movie Filming Locations",
    description: "Discover where your favorite movies were filmed! Find exact filming locations on an interactive map.",
    images: ["/assets/film.png"],
    creator: "@aktasevren",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: "your-google-verification-code",
  },
  category: "Entertainment",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Where is this?",
    "description": "Discover where your favorite movies were filmed! Find exact filming locations on an interactive map.",
    "url": siteUrl,
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Evren Aktaş",
      "url": "https://github.com/aktasevren",
      "sameAs": [
        "https://www.linkedin.com/in/evren-aktas/",
        "https://github.com/aktasevren"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Where is this?",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/assets/film.png`
      }
    },
    "featureList": [
      "Find movie filming locations",
      "Interactive map with markers",
      "Search movies by title",
      "View popular movies",
      "Detailed location information"
    ]
  };

  return (
    <html lang="en">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@700&display=swap"
          as="style"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
