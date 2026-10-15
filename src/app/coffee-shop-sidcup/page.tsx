import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { HALFWAY_CAFE_PHONE_DISPLAY, HALFWAY_CAFE_PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Coffee Shop in Sidcup | Fresh Coffee, Tea & Morning Drinks | Halfway Cafe",
  description:
    "Looking for a coffee shop in Sidcup? Halfway Cafe serves fresh coffee, builder's tea, and morning drinks in DA15. Walk in or takeaway.",
  alternates: { canonical: "https://halfwaycafe.co.uk/coffee-shop-sidcup" },
  openGraph: {
    title: "Coffee Shop in Sidcup | Fresh Coffee, Tea & Morning Drinks | Halfway Cafe",
    description:
      "Fresh coffee, tea, and morning drinks at Halfway Cafe in Sidcup DA15. Family-run local caff with walk-ins welcome.",
    url: "https://halfwaycafe.co.uk/coffee-shop-sidcup",
  },
};

const faqs = [
  {
    question: "Do you offer takeaway coffee in Sidcup?",
    answer:
      "Yes - all drinks are available for takeaway, including coffee, tea, and hot chocolate.",
  },
  {
    question: "What time do you open?",
    answer: "We open from 7:00am Monday to Saturday, and 9:00am on Sundays.",
  },
  {
    question: "Where is Halfway Cafe located?",
    answer:
      "We're at 176 Halfway Street, Sidcup, DA15 8DJ with free street parking nearby.",
  },
  {
    question: "Can I get breakfast with coffee?",
    answer:
      "Yes - we serve full English breakfast, sandwiches, and pancake dishes with coffee all day during opening hours.",
  },
  {
    question: "Do I need to book?",
    answer: "No booking needed. We're a walk-in local cafe.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/coffee-shop-sidcup#webpage",
      name: "Coffee Shop in Sidcup | Fresh Coffee, Tea & Morning Drinks | Halfway Cafe",
      url: "https://halfwaycafe.co.uk/coffee-shop-sidcup",
      about: "Coffee shop in Sidcup",
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
          name: "Coffee Shop in Sidcup",
          item: "https://halfwaycafe.co.uk/coffee-shop-sidcup",
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

export default function CoffeeShopSidcupPage() {
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
              Coffee Shop in Sidcup
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-text-mid md:text-lg">
              Looking for a proper coffee shop in Sidcup, DA15?
            </p>
            <p className="mt-3 font-inter text-base leading-7 text-text-mid md:text-lg">
              Halfway Cafe is a family-run local caff on Halfway Street, serving fresh
              coffee, builder&apos;s tea, and morning drinks every day. Whether you need a
              quick takeaway before work or a sit-down cup with breakfast, we keep it
              simple: hot drinks, quick service, and no booking needed.
            </p>
            <p className="mt-3 font-inter text-sm font-semibold text-ink">
              Walk in, grab a table, or take your coffee to go.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu/drinks"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Drinks
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
              alt="Fresh coffee and breakfast at Halfway Cafe in Sidcup"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 767px) calc(100vw - 88px), (max-width: 1023px) calc(100vw - 160px), (max-width: 1343px) calc(50vw - 96px), 576px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Quick Local Info
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
                <strong>Walk-ins:</strong> Always welcome
              </p>
              <p>
                <strong>Takeaway drinks:</strong> Available all day
              </p>
              <p>
                <strong>Parking:</strong> Free street parking nearby
              </p>
              <p className="font-semibold text-ink">No booking needed - just come in.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Why Choose Halfway Cafe For Coffee
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              Proper Coffee, No Fuss
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Freshly made coffee and tea served hot, fast, and exactly when you need it.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              Great With Breakfast
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Pair your morning drink with a full English, bacon sandwich, or pancake
              dish — perfect for <Link href="/brunch-sidcup">brunch in Sidcup</Link> from our breakfast menu.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              Local, Reliable, Family-Run
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              We&apos;ve served Sidcup and DA15 for over 20 years with quick service and
              straightforward quality.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Drinks Highlights
          </h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            Start your morning with one of these:
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Full Drinks Menu</p>
              <Link href="/menu/drinks" className="mt-2 inline-block text-accent">
                See all drinks
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Cafe in Sidcup</p>
              <Link href="/cafe-sidcup" className="mt-2 inline-block text-accent">
                Explore cafe page
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Breakfast in Sidcup</p>
              <Link href="/breakfast-sidcup" className="mt-2 inline-block text-accent">
                Pair coffee with breakfast
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">
                Cafe Near Sidcup Station
              </p>
              <Link href="/cafe-near-sidcup-station" className="mt-2 inline-block text-accent">
                Perfect for commuters
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Morning Takeaway For Commuters
          </h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            In a rush? Order at the counter and grab your drink on the go:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-inter text-base leading-7 text-text-mid">
            <li>Fresh <Link href="/takeaway-sidcup">takeaway coffee and food in Sidcup</Link></li>
            <li>Hot drinks with breakfast sandwiches</li>
            <li>Quick service before work or after the school run</li>
          </ul>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            Ideal if you&apos;re heading through Sidcup Station, DA15, or nearby roads.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Local Coffee Spot in Sidcup, DA15
          </h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            Halfway Cafe is based on Halfway Street in Sidcup DA15 and serves customers
            from Blackfen, Welling, Bexley, and nearby areas. If you&apos;re looking for a
            reliable local coffee shop in Sidcup, we&apos;re here daily with hot drinks and
            breakfast options ready to go.
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
            Need a proper coffee in Sidcup?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-base text-white/90">
            Walk in today, call {HALFWAY_CAFE_PHONE_DISPLAY}, or get directions to
            Halfway Street.
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
            <Link
              href="/menu/drinks"
              className="rounded-full border border-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              View Drinks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
