/* Halfway Cafe — Root layout with fonts, metadata & JSON-LD */

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import AppChrome from "@/components/layout/AppChrome";
import Footer from "@/components/layout/Footer";
import { openingHours as fallbackHours } from "@/data/opening-hours";
import { HALFWAY_CAFE_PHONE_E164 } from "@/lib/contact";
import { getOpeningHours } from "@/lib/queries";
import type { OpeningHours } from "@/types";

// ─── Fonts ───

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ─── Metadata ───

export const metadata: Metadata = {
  metadataBase: new URL("https://halfwaycafe.co.uk"),
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  title: {
    default: "Halfway Cafe Sidcup | Full English Breakfast & British Caff",
    template: "%s | Halfway Cafe Sidcup",
  },
  alternates: {
    canonical: "/",
  },
  description:
    "Halfway Cafe is a family-run British caff in Sidcup DA15, serving full English breakfasts, burgers, sandwiches and builder's tea. Proudly serving Sidcup, Eltham, Bexley and surrounding areas since 2003.",
  keywords: [
    "Halfway Cafe",
    "cafe Sidcup",
    "breakfast Sidcup",
    "full English breakfast Sidcup",
    "British caff DA15",
    "greasy spoon Sidcup",
    "cafe Eltham",
    "breakfast Eltham",
    "cafe Bexley",
    "cafe Blackfen",
    "cafe Bexleyheath",
    "New Eltham cafe",
    "DA15 cafe",
  ],
  openGraph: {
    title: "Halfway Cafe Sidcup | Full English Breakfast & British Caff",
    description:
      "Family-run British caff in Sidcup DA15. Full English breakfasts, burgers & builder's tea. Serving Sidcup, Eltham, Bexley and surrounding areas.",
    url: "/",
    siteName: "Halfway Cafe",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "https://halfwaycafe.co.uk/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Halfway Cafe Sidcup — Full English Breakfast & British Caff",
      },
    ],
  },
  other: {
    "theme-color": "#FF6B35",
  },
};

// ─── JSON-LD Restaurant Schema ───

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Halfway Cafe",
  description:
    "Family-run British caff in Sidcup DA15, serving full English breakfasts, burgers, sandwiches and builder's tea. Proudly serving Sidcup, Eltham, New Eltham, Bexley, Blackfen and Bexleyheath.",
  image: "https://halfwaycafe.co.uk/og-image.jpg",
  url: "https://halfwaycafe.co.uk",
  telephone: HALFWAY_CAFE_PHONE_E164,
  address: {
    "@type": "PostalAddress",
    streetAddress: "176 Halfway St",
    addressLocality: "Sidcup",
    postalCode: "DA15 8DJ",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.4285,
    longitude: 0.1056,
  },
  hasMap: "https://maps.google.com/?q=176+Halfway+St+Sidcup+DA15+8DJ",
  hasMenu: "https://halfwaycafe.co.uk/menu",
  sameAs: [
    "https://instagram.com/halfwaycafesidcup",
    "https://facebook.com/profile.php?id=61580807168670",
    "https://tiktok.com/@halfwaycafesidcup",
  ],
  servesCuisine: ["British", "Breakfast", "Cafe"],
  priceRange: "£",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:00",
      closes: "15:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "09:00",
      closes: "14:00",
    },
  ],
};

// ─── Layout ───

function toOpeningHours(row: Record<string, unknown>): OpeningHours {
  return {
    day: typeof row.day_name === "string" ? row.day_name : "Day",
    open: typeof row.open_time === "string" ? row.open_time.slice(0, 5) : "00:00",
    close: typeof row.close_time === "string" ? row.close_time.slice(0, 5) : "00:00",
    closed: row.is_closed === true,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dbHours = await getOpeningHours();
  const openingHours =
    dbHours.length > 0 ? dbHours.map(toOpeningHours) : fallbackHours;

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="overflow-x-hidden">
        <AppChrome desktopFooter={<Footer openingHours={openingHours} />}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
