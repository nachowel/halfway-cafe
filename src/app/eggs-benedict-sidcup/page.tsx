import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=176+Halfway+Street+Sidcup+DA15+8DJ";

export const metadata: Metadata = {
  title: "Eggs Benedict in Sidcup | Halfway Cafe DA15",
  description:
    "Eggs benedict, eggs royale and eggs florentine at Halfway Cafe in Sidcup. Freshly poached eggs with hollandaise sauce on Halfway Street DA15 — open 7 days, no booking needed.",
  alternates: { canonical: "https://halfwaycafe.co.uk/eggs-benedict-sidcup" },
  openGraph: {
    title: "Eggs Benedict in Sidcup | Halfway Cafe DA15",
    description:
      "Eggs benedict, eggs royale and eggs florentine at Halfway Cafe in Sidcup. Freshly poached eggs with hollandaise sauce on Halfway Street DA15 — open 7 days, no booking needed.",
    url: "https://halfwaycafe.co.uk/eggs-benedict-sidcup",
  },
};

const eggDishes = [
  {
    emoji: "🍳",
    title: "Eggs Benedict",
    description:
      "Two poached eggs with ham or bacon on a toasted muffin, finished with hollandaise sauce. The classic, done right.",
  },
  {
    emoji: "🍳",
    title: "Eggs Royale",
    description:
      "Two poached eggs on a toasted muffin with hollandaise sauce and salad. Light and fresh — a popular choice.",
  },
  {
    emoji: "🌿",
    title: "Eggs Florentine",
    description:
      "Two poached eggs with spinach on a toasted muffin, hollandaise sauce and salad. A great vegetarian option that doesn&apos;t compromise on flavour.",
  },
];

const faqs = [
  {
    question: "Does Halfway Cafe serve eggs benedict?",
    answer:
      "Yes. We serve eggs benedict, eggs royale and eggs florentine — all made with freshly poached eggs on a toasted muffin with hollandaise sauce, cooked to order.",
  },
  {
    question: "Where can I get eggs benedict in Sidcup?",
    answer:
      "Halfway Cafe at 176 Halfway Street, Sidcup DA15 8DJ. Open Monday to Saturday from 7am, Sunday from 9am. No booking needed — just walk in.",
  },
  {
    question: "What is the difference between eggs benedict, royale and florentine?",
    answer:
      "Eggs benedict comes with ham or bacon, eggs royale comes with hollandaise sauce and salad, and eggs florentine comes with spinach — making it a great vegetarian option. All are served on a toasted muffin with freshly poached eggs.",
  },
  {
    question: "Can I get eggs benedict as takeaway in Sidcup?",
    answer:
      "Yes, all our egg dishes including eggs benedict, royale and florentine are available to take away. Order at the counter and it will be made fresh to order.",
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
          name: "Eggs Benedict in Sidcup",
          item: "https://halfwaycafe.co.uk/eggs-benedict-sidcup",
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

export default function EggsBenedictSidcupPage() {
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
              Eggs Benedict in Sidcup
            </h1>
            <p className="mt-5 font-inter text-[17px] leading-8 text-text-mid md:text-lg md:leading-9">
              Freshly poached eggs, hollandaise sauce and a toasted muffin —
              eggs benedict, royale and florentine made to order at Halfway
              Cafe on Halfway Street. Open 7 days a week, no booking needed.
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
              alt="Eggs benedict and poached egg dishes at Halfway Cafe in Sidcup"
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
          Three Ways to Have Your Eggs
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3 md:[grid-auto-rows:1fr]">
          {eggDishes.map((item) => (
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
            Proper Poached Eggs in Sidcup, Every Day
          </h2>
          <p className="mt-6 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            Halfway Cafe on Halfway Street has been a Sidcup institution for
            over 20 years — and while most people know us for our{" "}
            <Link href="/breakfast-sidcup" className="text-accent underline hover:text-accent-dark">breakfast menu in Sidcup</Link>,
            our eggs benedict, royale and florentine have their own quiet
            following. Freshly poached eggs, proper hollandaise, toasted muffin
            — cooked to order every morning. Whether it&apos;s a weekday treat
            before work or a slower Sunday brunch in DA15, walk in and
            we&apos;ll have it ready for you.
          </p>
          <ul className="mt-7 space-y-2 font-inter text-[15px] leading-7 text-text-mid">
            <li>• Eggs benedict, royale and florentine on the menu daily</li>
            <li>• Freshly poached eggs, cooked to order every time</li>
            <li>• Vegetarian option available (eggs florentine)</li>
            <li>• Open Monday to Saturday from 7am, Sunday from 9am</li>
            <li>• Available to eat in or take away</li>
            <li>• Free street parking on Halfway Street</li>
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
                href="/pancakes-sidcup"
                className="font-playfair text-2xl font-bold text-accent no-underline transition-colors duration-200 hover:text-accent-dark"
              >
                Pancakes in Sidcup
              </Link>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
                Pancake breakfasts and egg dishes made fresh to order.
              </p>
            </article>
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
        <div className="rounded-xl bg-accent p-7 text-center shadow-sm md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
            Fancy eggs benedict in Sidcup?
          </h2>
          <p className="mx-auto mt-5 max-w-[48rem] font-inter text-base leading-8 text-white/90 md:text-lg">
            Walk in any time — open 7 days, no booking needed.
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
