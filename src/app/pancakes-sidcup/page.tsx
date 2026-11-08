import type { Metadata } from "next";
import ServerPublicImage from "@/components/ui/ServerPublicImage";
import Link from "next/link";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=176+Halfway+Street+Sidcup+DA15+8DJ";

export const metadata: Metadata = {
  title: "Pancakes in Sidcup | Halfway Cafe DA15",
  description:
    "Fresh pancakes, eggs benedict, eggs royale and eggs florentine at Halfway Cafe in Sidcup. On Halfway Street DA15 — open 7 days a week, no booking needed.",
  alternates: { canonical: "https://halfwaycafe.co.uk/pancakes-sidcup" },
  openGraph: {
    title: "Pancakes in Sidcup | Halfway Cafe DA15",
    description:
      "Fresh pancakes, eggs benedict, eggs royale and eggs florentine at Halfway Cafe in Sidcup. On Halfway Street DA15 — open 7 days a week, no booking needed.",
    url: "https://halfwaycafe.co.uk/pancakes-sidcup",
  },
};

const pancakesAndEggsItems = [
  {
    emoji: "🥞",
    title: "Pancake Breakfast 1",
    description:
      "Pancake with scrambled eggs, bacon and sausage. A proper plate to start the day.",
  },
  {
    emoji: "🥞",
    title: "Pancake Breakfast 2",
    description:
      "Pancake with two poached eggs, bacon, sausage and hash brown. The bigger option for bigger appetites.",
  },
  {
    emoji: "🍳",
    title: "Eggs Benedict",
    description:
      "Two poached eggs and ham or bacon on a toasted muffin with hollandaise sauce. A classic, done properly.",
  },
  {
    emoji: "🍳",
    title: "Eggs Royale",
    description:
      "Two poached eggs on a muffin with hollandaise sauce and salad. Light, fresh and satisfying.",
  },
  {
    emoji: "🌿",
    title: "Eggs Florentine",
    description:
      "Two poached eggs with spinach on a muffin with hollandaise sauce and salad. A great vegetarian option.",
  },
];

const faqs = [
  {
    question: "Does Halfway Cafe serve pancakes?",
    answer:
      "Yes. We serve pancake breakfasts with eggs, bacon and sausage, as well as eggs benedict, eggs royale and eggs florentine — all freshly made to order.",
  },
  {
    question: "Where can I get pancakes in Sidcup?",
    answer:
      "Halfway Cafe at 176 Halfway Street, Sidcup DA15 8DJ. Open Monday to Saturday from 7am, Sunday from 9am. No booking needed.",
  },
  {
    question: "What egg dishes does Halfway Cafe serve?",
    answer:
      "We serve eggs benedict, eggs royale and eggs florentine — all made with freshly poached eggs on a toasted muffin with hollandaise sauce.",
  },
  {
    question: "Can I get pancakes as takeaway in Sidcup?",
    answer:
      "Yes, everything on our menu including pancakes and egg dishes is available to take away. Just order at the counter.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
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
          name: "Pancakes in Sidcup",
          item: "https://halfwaycafe.co.uk/pancakes-sidcup",
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

export default function PancakesSidcupPage() {
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
              Pancakes in Sidcup
            </h1>
            <p className="mt-5 font-inter text-[17px] leading-8 text-text-mid md:text-lg md:leading-9">
              Fresh pancake breakfasts, eggs benedict, eggs royale and eggs
              florentine — made to order at Halfway Cafe on Halfway Street.
              Open 7 days a week, no booking needed.
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
            <ServerPublicImage
              source={BREAKFAST_HERO_IMAGE_URL}
              role="hero"
              alt="Fresh pancakes and egg dishes at Halfway Cafe in Sidcup"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 767px) calc(100vw - 88px), (max-width: 1023px) calc(100vw - 160px), (max-width: 1343px) calc(50vw - 96px), 576px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Pancakes &amp; Egg Dishes, Made Fresh to Order
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pancakesAndEggsItems.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8"
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
            Something a Bit Different at Halfway Cafe
          </h2>
          <p className="mt-6 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            Most people know Halfway Cafe for the{" "}
            <Link
              href="/breakfast-sidcup"
              className="text-accent underline hover:text-accent-dark"
            >
              full breakfast in Sidcup
            </Link>
            , but our
            pancakes and egg dishes have their own loyal following. Whether
            it&apos;s a pancake breakfast before work, a relaxed eggs benedict on
            a Sunday morning, or eggs florentine for something lighter —
            it&apos;s all cooked fresh to order on Halfway Street, Sidcup DA15.
            Open seven days a week, walk-ins always welcome.
          </p>
          <ul className="mt-7 space-y-2 font-inter text-[15px] leading-7 text-text-mid">
            <li>• Fresh pancake breakfasts cooked to order</li>
            <li>• Eggs benedict, royale and florentine on the menu</li>
            <li>• Vegetarian options available</li>
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
                The full works — cooked fresh to order every morning.
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
                href="/eggs-benedict-sidcup"
                className="font-playfair text-2xl font-bold text-accent no-underline transition-colors duration-200 hover:text-accent-dark"
              >
                Eggs Benedict in Sidcup
              </Link>
              <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
                Poached eggs, hollandaise sauce — three ways to order.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-accent p-7 text-center shadow-sm md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
            Fancy pancakes or eggs in Sidcup?
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
