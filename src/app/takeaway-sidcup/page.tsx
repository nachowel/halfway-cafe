import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";

const TAKEAWAY_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=176+Halfway+Street+Sidcup+DA15+8DJ";

export const metadata: Metadata = {
  title: "Takeaway in Sidcup | Halfway Cafe DA15",
  description:
    "Order takeaway from Halfway Cafe in Sidcup. Full English breakfast, bacon sandwiches, burgers and hot drinks — ready to go from 176 Halfway Street, DA15.",
  alternates: { canonical: "https://halfwaycafe.co.uk/takeaway-sidcup" },
  openGraph: {
    title: "Takeaway in Sidcup | Halfway Cafe DA15",
    description:
      "Order takeaway from Halfway Cafe in Sidcup. Full English breakfast, bacon sandwiches, burgers and hot drinks — ready to go from 176 Halfway Street, DA15.",
    url: "https://halfwaycafe.co.uk/takeaway-sidcup",
  },
};

const takeawayItems = [
  {
    emoji: "🍳",
    title: "Full English Breakfast",
    description:
      "The full works — eggs, bacon, sausage, beans, toast and grilled tomato. Our most popular takeaway order, packed hot and ready fast.",
  },
  {
    emoji: "🥪",
    title: "Sandwiches & Bacon Rolls",
    description:
      "Thick-cut bacon, sausage, egg or cheese — packed into fresh white or brown bread. Perfect before work or on the go.",
  },
  {
    emoji: "🍔",
    title: "Burgers & Hot Food",
    description:
      "Made-to-order burgers, jacket potatoes, paninis and lunch plates — all available to take away throughout the day.",
  },
  {
    emoji: "☕",
    title: "Hot Drinks & Cold Drinks",
    description:
      "Builder's tea, coffee and cold drinks. Grab one with your food or just a quick cup on the way.",
  },
];

const faqs = [
  {
    question: "Does Halfway Cafe offer takeaway?",
    answer:
      "Yes, everything on our menu is available to take away — full English breakfast, bacon sandwiches, burgers, paninis, jacket potatoes, hot drinks and more.",
  },
  {
    question: "Where can I get takeaway breakfast in Sidcup?",
    answer:
      "Halfway Cafe at 176 Halfway Street, Sidcup DA15 8DJ. We're open Monday to Saturday from 7am, Sunday from 9am. No pre-ordering needed — just walk in.",
  },
  {
    question: "What takeaway food does Halfway Cafe serve?",
    answer:
      "Our full menu is available as takeaway: full English breakfast, bacon sandwiches, burgers, omelettes, pancakes, jacket potatoes, paninis, sides and hot and cold drinks.",
  },
  {
    question: "Do I need to order in advance for takeaway?",
    answer:
      "No. Just walk in and order at the counter. Everything is cooked fresh to order.",
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
          name: "Takeaway in Sidcup",
          item: "https://halfwaycafe.co.uk/takeaway-sidcup",
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

export default function TakeawaySidcupPage() {
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
              Takeaway in Sidcup
            </h1>
            <p className="mt-5 font-inter text-[17px] leading-8 text-text-mid md:text-lg md:leading-9">
              Hot food ready to go from Halfway Cafe on Halfway Street — full
              English, sandwiches, burgers and proper coffee. No pre-ordering,
              just walk in.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Our Menu
              </Link>
              <a
                href={TAKEAWAY_DIRECTIONS_URL}
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
              alt="Takeaway breakfast and coffee from Halfway Cafe in Sidcup"
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
          Everything on the Menu, Ready to Go
        </h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {takeawayItems.map((item) => (
            <article key={item.title} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-2xl">{item.emoji}</p>
              <p className="mt-3 font-playfair text-2xl font-bold text-ink">
                {item.title}
              </p>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Takeaway from a Proper Sidcup Cafe
          </h2>
          <p className="mt-4 font-inter text-base leading-8 text-text-mid">
            Halfway Cafe has been serving Sidcup and the DA15 area for over 20
            years. Everything on our menu is available to take away — just walk
            in, order at the counter, and your food will be cooked fresh to
            order. We&apos;re on Halfway Street just off the A211, with free street
            parking nearby. Open Monday to Saturday from 7am, Sunday from 9am.
          </p>
          <ul className="mt-5 space-y-2 font-inter text-sm text-text-mid">
            <li>• Full menu available as takeaway every day</li>
            <li>• Cooked fresh to order — no reheated food</li>
            <li>• Free street parking on Halfway Street</li>
            <li>• Open from 7am Monday to Saturday</li>
            <li>• No pre-ordering needed — walk in and order</li>
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
                Full English, bacon sandwiches and morning favourites.
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
                The full works cooked fresh to order every morning.
              </p>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <Link
                href="/cafe-sidcup"
                className="font-playfair text-2xl font-bold text-accent no-underline transition-colors duration-200 hover:text-accent-dark"
              >
                Cafe in Sidcup
              </Link>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
                A proper local cafe on Halfway Street, open every day.
              </p>
            </article>
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

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-accent p-7 text-center shadow-sm md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
            Ready for a proper takeaway from Sidcup&apos;s favourite cafe?
          </h2>
          <p className="mx-auto mt-5 max-w-[48rem] font-inter text-base leading-8 text-white/90 md:text-lg">
            Walk in any time — no booking, no pre-ordering needed.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-center md:gap-5">
            <Link
              href="/menu"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-[#FFF0E8] md:min-w-[200px] md:w-auto"
            >
              View Full Menu
            </Link>
            <a
              href={TAKEAWAY_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10 md:min-w-[200px] md:w-auto"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
