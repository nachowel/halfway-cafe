import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=176+Halfway+Street+Sidcup+DA15+8DJ";

export const metadata: Metadata = {
  title: "Bacon Sandwich in Sidcup | Halfway Cafe DA15",
  description:
    "Thick-cut back bacon on fresh bread, hot off the grill. Halfway Cafe on Halfway Street, Sidcup DA15 — open from 7am, no booking needed.",
  alternates: { canonical: "https://halfwaycafe.co.uk/bacon-sandwich-sidcup" },
  openGraph: {
    title: "Bacon Sandwich in Sidcup | Halfway Cafe DA15",
    description:
      "Thick-cut back bacon on fresh bread, hot off the grill. Halfway Cafe on Halfway Street, Sidcup DA15 — open from 7am, no booking needed.",
    url: "https://halfwaycafe.co.uk/bacon-sandwich-sidcup",
  },
};

const baconHighlights = [
  {
    emoji: "🥓",
    title: "Thick-Cut Back Bacon",
    description:
      "We use proper back bacon, not the thin stuff. Grilled to order every time — crispy or soft, just say the word.",
  },
  {
    emoji: "🍞",
    title: "Fresh Bread, Your Choice",
    description:
      "White or brown, it's your call. Fresh bread every morning, nothing pre-made or sitting around.",
  },
  {
    emoji: "⚡",
    title: "Ready in Minutes",
    description:
      "No long waits. Walk in, order, and your sandwich is ready fast — ideal before work or on a quick break.",
  },
];

const faqs = [
  {
    question: "Where can I get a bacon sandwich in Sidcup?",
    answer:
      "Halfway Cafe at 176 Halfway Street, Sidcup DA15 8DJ. We serve thick-cut back bacon sandwiches from 7am Monday to Saturday, and from 9am on Sundays.",
  },
  {
    question: "What bread do you use for bacon sandwiches?",
    answer:
      "We use fresh white or brown bread. Just let us know your preference when you order.",
  },
  {
    question: "Can I get a bacon sandwich as takeaway in Sidcup?",
    answer:
      "Yes. Everything at Halfway Cafe is available to take away. Order at the counter and your sandwich will be ready in minutes.",
  },
  {
    question: "How much is a bacon sandwich at Halfway Cafe?",
    answer:
      "Our bacon sandwich is freshly made to order. Visit us or call 020 3343 5303 for current pricing.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CafeOrCoffeeShop",
      "@id": "https://halfwaycafe.co.uk/#business",
      name: "Halfway Cafe",
      url: "https://halfwaycafe.co.uk",
      telephone: "02033435303",
      address: {
        "@type": "PostalAddress",
        streetAddress: "176 Halfway Street",
        addressLocality: "Sidcup",
        postalCode: "DA15 8DJ",
        addressCountry: "GB",
      },
      openingHours: ["Mo-Sa 07:00-15:00", "Su 09:00-14:00"],
      servesCuisine: "British",
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
          name: "Bacon Sandwich in Sidcup",
          item: "https://halfwaycafe.co.uk/bacon-sandwich-sidcup",
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

export default function BaconSandwichSidcupPage() {
  return (
    <main className="bg-[#FAF8F5] pb-20 pt-10 md:pb-28 md:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-[84rem] px-4 md:px-8">
        <div className="grid items-center gap-8 rounded-xl bg-white p-7 shadow-sm md:p-12 lg:grid-cols-2">
          <div>
            <h1 className="font-playfair text-4xl font-bold leading-tight text-ink md:text-5xl">
              Bacon Sandwich in Sidcup
            </h1>
            <p className="mt-5 font-inter text-[17px] leading-8 text-text-mid md:text-lg md:leading-9">
              Thick-cut back bacon, hot off the grill, packed into fresh white
              or brown bread. Ready in minutes at Halfway Cafe on Halfway
              Street — open from 7am Monday to Saturday, 9am on Sundays.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Our Menu
              </Link>
              <a
                href={DIRECTIONS_URL}
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
              alt="Thick-cut bacon sandwich at Halfway Cafe in Sidcup"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          A Proper Bacon Sandwich, Done Right
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3 md:[grid-auto-rows:1fr]">
          {baconHighlights.map((item) => (
            <article
              key={item.title}
              className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8"
            >
              <p className="text-2xl">{item.emoji}</p>
              <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
                {item.title}
              </p>
              <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl border border-border bg-white p-7 shadow-[0_14px_36px_rgba(26,26,26,0.08)] md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-ink md:text-5xl">
            The Bacon Sandwich Sidcup Workers Come Back For
          </h2>
          <p className="mt-6 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            At Halfway Cafe on Halfway Street, the bacon sandwich has been a
            staple order for over 20 years. Early starters, tradespeople,
            commuters heading through Sidcup DA15 — this is the sandwich they
            stop for before the day begins. Thick-cut back bacon, fresh bread,
            cooked to order. Nothing complicated. Just a proper bacon sandwich
            in Sidcup, made the right way.
          </p>
          <ul className="mt-7 space-y-2 font-inter text-[15px] leading-7 text-text-mid">
            <li>• Thick-cut back bacon, grilled fresh to order</li>
            <li>• White or brown bread — your choice</li>
            <li>• Available to eat in or take away</li>
            <li>• Open from 7am Monday to Saturday, 9am on Sundays</li>
            <li>• Free street parking on Halfway Street</li>
            <li>• No booking needed — walk in and order</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Opening Hours
          </h2>
          <div className="mt-5 space-y-3 font-inter text-base text-text-mid">
            <p>Mon – Sat: 7:00am – 3:00pm</p>
            <p>Sunday: 9:00am – 2:00pm</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-5">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-xl border border-border bg-parchment-dark p-5 md:p-6"
              >
                <h3 className="font-playfair text-2xl font-bold leading-tight text-ink">
                  {faq.question}
                </h3>
                <p className="mt-3 font-inter text-base leading-8 text-text-mid">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            More from Halfway Cafe
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
            <article className="rounded-xl bg-parchment-dark p-5">
              <Link
                href="/breakfast-sidcup"
                className="font-playfair text-2xl font-bold text-accent no-underline transition-colors duration-200 hover:text-accent-dark"
              >
                Breakfast in Sidcup
              </Link>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
                Full English, eggs, pancakes and morning favourites.
              </p>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <Link
                href="/takeaway-sidcup"
                className="font-playfair text-2xl font-bold text-accent no-underline transition-colors duration-200 hover:text-accent-dark"
              >
                Takeaway in Sidcup
              </Link>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
                Everything on the menu available to take away.
              </p>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <Link
                href="/full-english-breakfast-sidcup"
                className="font-playfair text-2xl font-bold text-accent no-underline transition-colors duration-200 hover:text-accent-dark"
              >
                Full English Breakfast in Sidcup
              </Link>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
                The full works — cooked fresh to order every morning.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-accent p-7 text-center shadow-sm md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
            Fancy a proper bacon sandwich in Sidcup?
          </h2>
          <p className="mx-auto mt-5 max-w-[48rem] font-inter text-base leading-8 text-white/90 md:text-lg">
            Walk in any time — no booking needed.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-center md:gap-5">
            <Link
              href="/menu"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-[#FFF0E8] md:min-w-[200px] md:w-auto"
            >
              View Full Menu
            </Link>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10 md:min-w-[200px] md:w-auto"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 text-center shadow-sm md:p-10">
          <p className="font-inter text-sm text-text-mid">
            We handle allergens in our kitchen. Please speak to a member of
            staff if you have any dietary requirements or allergies before
            ordering.
          </p>
        </div>
      </section>
    </main>
  );
}
