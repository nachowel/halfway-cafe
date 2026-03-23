import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { HALFWAY_CAFE_PHONE_DISPLAY, HALFWAY_CAFE_PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Cafe Near Sidcup Station | Breakfast & Coffee in DA15 | Halfway Cafe",
  description:
    "Looking for a cafe near Sidcup Station? Halfway Cafe serves full English breakfast, sandwiches and fresh coffee daily in DA15. Walk in or takeaway.",
  alternates: { canonical: "https://halfwaycafe.co.uk/cafe-near-sidcup-station" },
  openGraph: {
    title: "Cafe Near Sidcup Station | Breakfast & Coffee in DA15 | Halfway Cafe",
    description:
      "Family-run British caff near Sidcup Station with fast service, big portions, and no booking needed.",
    url: "https://halfwaycafe.co.uk/cafe-near-sidcup-station",
  },
};

const faqs = [
  {
    question: "Is Halfway Cafe near Sidcup Station?",
    answer:
      "Yes - we're located on Halfway Street in Sidcup (DA15), just a short drive or quick bus ride from Sidcup Station.",
  },
  {
    question: "Do you offer takeaway coffee and breakfast?",
    answer:
      "Yes, everything on our menu is available for takeaway - perfect for commuters.",
  },
  {
    question: "Do I need to book?",
    answer: "No booking needed. We're a walk-in cafe.",
  },
  {
    question: "What time do you open?",
    answer: "We open from 7:00am Monday to Saturday, and 9:00am on Sundays.",
  },
  {
    question: "Is there parking nearby?",
    answer: "Yes - free street parking is available close to the cafe.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/cafe-near-sidcup-station#webpage",
      name: "Cafe Near Sidcup Station | Breakfast & Coffee in DA15 | Halfway Cafe",
      url: "https://halfwaycafe.co.uk/cafe-near-sidcup-station",
      about: "Cafe near Sidcup Station",
      isPartOf: {
        "@type": "WebSite",
        name: "Halfway Cafe",
        url: "https://halfwaycafe.co.uk",
      },
      mainEntity: {
        "@id": "https://halfwaycafe.co.uk/#business",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://halfwaycafe.co.uk",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cafe Near Sidcup Station",
          item: "https://halfwaycafe.co.uk/cafe-near-sidcup-station",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function CafeNearSidcupStationPage() {
  return (
    <main className="bg-[#FAF8F5] pb-16 pt-8 md:pb-24 md:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-8 rounded-xl bg-white p-6 shadow-sm md:p-10 lg:grid-cols-2">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-ink md:text-5xl">
              Cafe Near Sidcup Station
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-text-mid md:text-lg">
              Looking for a cafe near Sidcup Station for a quick breakfast or coffee?
            </p>
            <p className="mt-3 font-inter text-base leading-7 text-text-mid md:text-lg">
              Halfway Cafe is a family-run British caff on Halfway Street (DA15), serving
              full English breakfast, sandwiches, and fresh coffee every day. Whether
              you&apos;re heading to work or just arrived in Sidcup, we&apos;re a reliable stop
              for fast service, big portions, and no booking needed.
            </p>
            <p className="mt-3 font-inter text-sm font-semibold text-ink">
              Walk in, grab a table, or takeaway - whatever suits your morning. Looking
              for more drink options? See our{" "}
              <Link href="/coffee-shop-sidcup" className="text-accent no-underline hover:text-accent-dark">
                coffee shop in Sidcup
              </Link>{" "}
              page.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                Browse Menu
              </Link>
              <a
                href={HALFWAY_CAFE_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-accent hover:text-white"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-xl">
            <Image
              src={BREAKFAST_HERO_IMAGE_URL}
              alt="Breakfast and coffee at Halfway Cafe near Sidcup Station"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Quick Info
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3 font-inter text-base leading-7 text-text-mid">
              <p>
                <strong>Address:</strong> 176 Halfway Street, Sidcup, DA15 8DJ
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${HALFWAY_CAFE_PHONE_TEL}`} className="text-accent">
                  {HALFWAY_CAFE_PHONE_DISPLAY}
                </a>
              </p>
              <p>
                <strong>Opening Hours:</strong>
              </p>
              <p>Mon-Sat: 7:00am - 3:00pm</p>
              <p>Sunday: 9:00am - 2:00pm</p>
            </div>
            <div className="space-y-3 font-inter text-base leading-7 text-text-mid">
              <p>
                <strong>From Sidcup Station:</strong>
              </p>
              <p>Around 5-10 minutes by car</p>
              <p>Short bus ride or quick stop on your way through Sidcup</p>
              <p>
                <strong>Parking:</strong> Free street parking available nearby
              </p>
              <p className="font-semibold text-ink">
                No bookings needed - just walk in.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Why Choose Us
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              A Proper Local Cafe - Not a Chain
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              We&apos;ve been running{" "}
              <Link href="/cafe-sidcup" className="text-accent no-underline hover:text-accent-dark">
                our main cafe in Sidcup
              </Link>{" "}
              for over 20 years. No gimmicks - just good food, done properly.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              Fast Service for Busy Mornings
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Need something quick before work or after your commute? We keep things
              moving without cutting corners.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">Big Portions, Fair Prices</p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              From a full English to a simple bacon sandwich, you&apos;ll leave full - not
              disappointed.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            What To Order
          </h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            If you&apos;re stopping by from Sidcup Station, here are some local favourites — or{" "}
            <Link href="/breakfast-sidcup" className="font-semibold text-accent no-underline hover:text-accent-dark">
              see our breakfast in Sidcup page
            </Link>{" "}
            for the full picture:
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Full English Breakfast</p>
              <Link href="/full-english-breakfast-sidcup" className="mt-2 inline-block text-accent">
                See full details
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Bacon Sandwich (quick &amp; classic)</p>
              <Link href="/bacon-sandwich-sidcup" className="mt-2 inline-block text-accent">
                View
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Pancakes &amp; Eggs (great for late mornings)</p>
              <Link href="/pancakes-sidcup" className="mt-2 inline-block text-accent">
                Explore
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Coffee, Tea &amp; Hot Drinks</p>
              <Link href="/menu/drinks" className="mt-2 inline-block text-accent">
                See drinks
              </Link>
            </article>
          </div>
          <p className="mt-6 font-inter text-sm font-semibold text-ink">
            Or browse everything here:{" "}
            <Link href="/menu" className="text-accent">
              /menu
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Takeaway For Commuters
          </h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">In a rush?</p>
          <p className="mt-3 font-inter text-base leading-7 text-text-mid">
            We offer full takeaway across the menu, so you can grab:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-inter text-base leading-7 text-text-mid">
            <li>Coffee on the go</li>
            <li>Breakfast sandwiches</li>
            <li>Full meals packed to takeaway</li>
          </ul>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            <Link href="/takeaway-sidcup" className="font-semibold text-accent">
              View takeaway options
            </Link>
          </p>
          <p className="mt-2 font-inter text-base leading-7 text-text-mid">
            Perfect if you&apos;re heading to the station or just passing through.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">Local Area</h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            We serve customers from:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-inter text-base leading-7 text-text-mid">
            <li>Sidcup Station area</li>
            <li>DA15</li>
            <li>Blackfen</li>
            <li>Welling</li>
            <li>Bexley</li>
          </ul>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            If you&apos;re searching for a cafe near Sidcup Station, Halfway Cafe is a
            reliable local choice just minutes away.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <article key={faq.question}>
                <h3 className="font-playfair text-2xl font-bold text-ink">{faq.question}</h3>
                <p className="mt-2 font-inter text-base leading-7 text-text-mid">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-accent p-6 text-center shadow-sm md:p-10">
          <h2 className="font-playfair text-3xl font-bold text-white md:text-4xl">
            Looking for a cafe near Sidcup Station you can rely on?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-base text-white/90">
            Walk in today or call us on {HALFWAY_CAFE_PHONE_DISPLAY}.
          </p>
          <p className="mx-auto mt-2 max-w-xl font-inter text-sm text-white/80">
            Or get directions and visit us at 176 Halfway Street, Sidcup.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-center">
            <a
              href={`tel:${HALFWAY_CAFE_PHONE_TEL}`}
              className="rounded-full bg-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-[#FFF0E8]"
            >
              Call Us
            </a>
            <a
              href={HALFWAY_CAFE_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
