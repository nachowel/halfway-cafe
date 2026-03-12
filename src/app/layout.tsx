/* Halfway Cafe — Root layout with fonts, metadata & JSON-LD */

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import AppChrome from "@/components/layout/AppChrome";
import { openingHours as fallbackHours } from "@/data/opening-hours";
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
  title: {
    default: "Halfway Cafe — London's Favourite Greasy Spoon",
    template: "%s | Halfway Cafe",
  },
  description:
    "Full English breakfasts, proper burgers & builder's tea since 2008. A genuine London caff on High Street, EC1.",
  keywords: [
    "Halfway Cafe",
    "greasy spoon",
    "London cafe",
    "full English breakfast",
    "British caff",
    "EC1",
  ],
  openGraph: {
    title: "Halfway Cafe — London's Favourite Greasy Spoon",
    description:
      "Full English breakfasts, proper burgers & builder's tea since 2008.",
    url: "https://halfwaycafe.co.uk",
    siteName: "Halfway Cafe",
    locale: "en_GB",
    type: "website",
  },
};

// ─── JSON-LD Restaurant Schema ───

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Halfway Cafe",
  description:
    "London greasy spoon serving full English breakfasts, burgers & classic British cafe food since 2008.",
  url: "https://halfwaycafe.co.uk",
  telephone: "+441234567890",
  address: {
    "@type": "PostalAddress",
    streetAddress: "123 High Street",
    addressLocality: "London",
    postalCode: "EC1A 1BB",
    addressCountry: "GB",
  },
  servesCuisine: ["British", "Breakfast", "Cafe"],
  priceRange: "£",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "21:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "08:00",
      closes: "22:00",
    },
  ],
  foundingDate: "2008",
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
      <body>
        <AppChrome openingHours={openingHours}>{children}</AppChrome>
      </body>
    </html>
  );
}
