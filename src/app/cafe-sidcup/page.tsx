import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { HALFWAY_CAFE_PHONE_DISPLAY, HALFWAY_CAFE_PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Cafe in Sidcup | Breakfast, Brunch, Coffee & Takeaway in DA15 | Halfway Cafe",
  description:
    "Halfway Cafe is a family-run cafe in Sidcup DA15 serving breakfast, brunch, coffee and takeaway daily. Walk in, call us, or get directions.",
  alternates: { canonical: "https://halfwaycafe.co.uk/cafe-sidcup" },
  openGraph: {
    title: "Cafe in Sidcup | Breakfast, Brunch, Coffee & Takeaway in DA15 | Halfway Cafe",
    description:
      "Your local Sidcup cafe for breakfast, brunch, coffee and takeaway. Family-run, walk-ins welcome, and easy to reach from DA15 and nearby areas.",
    url: "https://halfwaycafe.co.uk/cafe-sidcup",
  },
};

const serviceCards = [
  {
    icon: "🍳",
    title: "Breakfast",
    body:
      "Full English, bacon sandwiches, eggs, and proper morning plates cooked fresh to order.",
    href: "/breakfast-sidcup",
    cta: "Explore breakfast in Sidcup",
  },
  {
    icon: "🥞",
    title: "Brunch",
    body:
      "Pancakes, eggs benedict, eggs royale and brunch favourites for slower mornings and weekend catch-ups.",
    href: "/brunch-sidcup",
    cta: "See brunch in Sidcup",
  },
  {
    icon: "☕",
    title: "Coffee",
    body:
      "Fresh coffee, builder's tea and hot drinks served all day for sit-downs or quick takeaway.",
    href: "/coffee-shop-sidcup",
    cta: "Visit our coffee page",
  },
  {
    icon: "🥡",
    title: "Takeaway",
    body:
      "Everything from breakfast to drinks is available to take away when you're on the go.",
    href: "/takeaway-sidcup",
    cta: "View takeaway options",
  },
];

const faqs = [
  {
    question: "Where is Halfway Cafe in Sidcup?",
    answer:
      "We're at 176 Halfway Street, Sidcup, DA15 8DJ - just off the A211 with free street parking nearby.",
  },
  {
    question: "What are your opening hours?",
    answer:
      "We're open Monday to Saturday from 7:00am to 3:00pm, and Sunday from 9:00am to 2:00pm.",
  },
  {
    question: "Do I need to book a table?",
    answer: "No booking needed. Halfway Cafe is walk-in friendly every day.",
  },
  {
    question: "Do you serve breakfast and brunch in Sidcup?",
    answer:
      "Yes. We serve breakfast daily and also offer brunch-style dishes including pancakes and eggs benedict.",
  },
  {
    question: "Do you offer takeaway?",
    answer:
      "Yes, we offer takeaway across the menu, including coffee, breakfast items, and hot meals.",
  },
  {
    question: "Are you close to Sidcup Station?",
    answer:
      "Yes, we're a short drive or quick bus route away. See our cafe near station page for details.",
  },
  {
    question: "Which nearby areas do you serve?",
    answer:
      "We welcome customers from Sidcup, DA15, Blackfen, Welling, Bexley, Eltham, and surrounding areas.",
  },
  {
    question: "Can I get coffee with breakfast?",
    answer:
      "Yes - fresh coffee and tea are available all day and pair with any breakfast or brunch order.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/cafe-sidcup#webpage",
      name: "Cafe in Sidcup | Breakfast, Brunch, Coffee & Takeaway in DA15 | Halfway Cafe",
      url: "https://halfwaycafe.co.uk/cafe-sidcup",
      about: "Cafe in Sidcup and DA15",
      isPartOf: {
        "@type": "WebSite",
        name: "Halfway Cafe",
        url: "https://halfwaycafe.co.uk",
      },
      primaryImageOfPage:
        "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/public/Hero/breakfast-hero.webp",
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
          name: "Cafe in Sidcup",
          item: "https://halfwaycafe.co.uk/cafe-sidcup",
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

export default function CafeSidcupPage() {
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
              Cafe in Sidcup
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-text-mid md:text-lg">
              Halfway Cafe is a family-run local cafe in Sidcup DA15 for breakfast,
              brunch, coffee, and takeaway. We serve proper portions, quick service, and
              straightforward food people come back for.
            </p>
            <p className="mt-3 font-inter text-sm font-semibold text-ink">
              Walk in any time - before work, midday, or for a slower weekend stop.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Full Menu
              </Link>
              <a
                href={HALFWAY_CAFE_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-accent hover:text-white"
              >
                Get Directions
              </a>
              <a
                href={`tel:${HALFWAY_CAFE_PHONE_TEL}`}
                className="rounded-full border border-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-accent hover:text-white"
              >
                Call Us
              </a>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-xl">
            <Image
              src={BREAKFAST_HERO_IMAGE_URL}
              alt="Breakfast and coffee on the table at Halfway Cafe in Sidcup"
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
            Quick Local Info
          </h2>
          <div className="mt-5 space-y-2 font-inter text-base leading-7 text-text-mid">
            <p>
              <strong>Address:</strong> 176 Halfway Street, Sidcup, DA15 8DJ
            </p>
            <p>
              <strong>Phone:</strong> {HALFWAY_CAFE_PHONE_DISPLAY}
            </p>
            <p>
              <strong>Opening Hours:</strong> Mon-Sat 7:00am-3:00pm, Sunday 9:00am-2:00pm
            </p>
            <p className="font-semibold text-ink">No booking needed - walk-ins welcome.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          What We Serve in Sidcup
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {serviceCards.map((card) => (
            <article key={card.title} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-2xl">{card.icon}</p>
              <p className="mt-3 font-playfair text-2xl font-bold text-ink">{card.title}</p>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">{card.body}</p>
              <Link href={card.href} className="mt-3 inline-block font-inter text-sm font-semibold text-accent">
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Local Pages Hub
          </h2>
          <p className="mt-4 font-inter text-base leading-8 text-text-mid">
            Use these local pages to find the right option quickly:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-inter text-base leading-7 text-text-mid">
            <li>
              <Link href="/breakfast-sidcup" className="text-accent">
                Breakfast in Sidcup
              </Link>{" "}
              for early starts and full English plates.
            </li>
            <li>
              <Link href="/breakfast-da15" className="text-accent">
                Breakfast in DA15
              </Link>{" "}
              if you&apos;re searching by postcode.
            </li>
            <li>
              <Link href="/brunch-sidcup" className="text-accent">
                Brunch in Sidcup
              </Link>{" "}
              for pancakes and eggs dishes.
            </li>
            <li>
              <Link href="/coffee-shop-sidcup" className="text-accent">
                Coffee Shop in Sidcup
              </Link>{" "}
              for fresh drinks and morning coffee stops.
            </li>
            <li>
              <Link href="/cafe-near-sidcup-station" className="text-accent">
                Cafe Near Sidcup Station
              </Link>{" "}
              for commuter-friendly visits.
            </li>
            <li>
              <Link href="/takeaway-sidcup" className="text-accent">
                Takeaway in Sidcup
              </Link>{" "}
              for fast collection on busy days.
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Local Cafe in Sidcup, DA15
          </h2>
          <p className="mt-4 font-inter text-base leading-8 text-text-mid">
            Halfway Cafe sits on Halfway Street in Sidcup DA15, close to routes serving
            Blackfen, Welling, Bexley, and Eltham. Whether you need breakfast before
            work, brunch with family, a coffee stop, or takeaway, we are a dependable
            local option with walk-in service every day.
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
            Visit Halfway Cafe in Sidcup Today
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-inter text-base text-white/90">
            Breakfast, brunch, coffee, and takeaway - all in one local DA15 spot.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-center">
            <Link
              href="/menu"
              className="rounded-full bg-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-[#FFF0E8]"
            >
              View Full Menu
            </Link>
            <a
              href={HALFWAY_CAFE_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              Get Directions
            </a>
            <a
              href={`tel:${HALFWAY_CAFE_PHONE_TEL}`}
              className="rounded-full border border-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
