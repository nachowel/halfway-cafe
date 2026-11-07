import type { Metadata } from "next";
import ServerPublicImage from "@/components/ui/ServerPublicImage";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { HALFWAY_CAFE_PHONE_DISPLAY, HALFWAY_CAFE_PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Breakfast in DA15 | Halfway Cafe, Sidcup",
  description:
    "Looking for breakfast in DA15? Halfway Cafe on Halfway Street, Sidcup has served proper cooked breakfasts for over 20 years. Dine in or takeaway.",
  alternates: { canonical: "https://halfwaycafe.co.uk/breakfast-da15" },
  openGraph: {
    title: "Breakfast in DA15 | Halfway Cafe, Sidcup",
    description:
      "Looking for breakfast in DA15? Halfway Cafe on Halfway Street, Sidcup has served proper cooked breakfasts for over 20 years. Dine in or takeaway.",
    url: "https://halfwaycafe.co.uk/breakfast-da15",
  },
};

const featuredBreakfastItems = [
  {
    name: "Full English Breakfast",
    description:
      "Eggs, bacon, sausage, beans, toast and all the trimmings — a proper DA15 breakfast cooked fresh to order.",
    href: "/full-english-breakfast-sidcup",
    cta: "Full English breakfast in Sidcup",
    image:
      "set breakfast/Buildersbreakfast.png",
    alt: "Full English breakfast plate at Halfway Cafe in Sidcup DA15",
  },
  {
    name: "Bacon Sandwich",
    description:
      "Back bacon on fresh bread — the reliable DA15 morning staple for when you need something quick.",
    href: "/bacon-sandwich-sidcup",
    cta: "Bacon sandwich in Sidcup",
    image:
      "sandwiches/bacon.png",
    alt: "Bacon sandwich at Halfway Cafe Sidcup",
  },
  {
    name: "Pancakes & Eggs",
    description:
      "Pancake breakfasts, eggs benedict and eggs florentine for a slower DA15 morning.",
    href: "/pancakes-sidcup",
    cta: "Pancakes in Sidcup",
    image:
      "pancakes/eggfroentine.png",
    alt: "Pancakes and eggs dish at Halfway Cafe in Sidcup",
  },
  {
    name: "Takeaway Breakfast",
    description:
      "Hot drinks, sandwiches and full breakfast packed to go — perfect for DA15 commuters on the move.",
    href: "/takeaway-sidcup",
    cta: "Takeaway in Sidcup",
    image:
      "drinks/tea.png",
    alt: "Tea and takeaway breakfast at Halfway Cafe Sidcup",
  },
];

const faqs = [
  {
    question: "Where can I get breakfast in DA15?",
    answer:
      "Halfway Cafe is at 176 Halfway Street, Sidcup DA15 8DJ — open Monday to Saturday from 7:00am and Sunday from 9:00am. No booking needed.",
  },
  {
    question: "Does Halfway Cafe serve a full English breakfast in DA15?",
    answer:
      "Yes. We serve a full cooked breakfast with eggs, bacon, sausage, beans, and toast — made fresh to order every day.",
  },
  {
    question: "Can I get breakfast takeaway in DA15?",
    answer:
      "Yes. Everything on the breakfast menu is available to take away, including hot drinks, bacon sandwiches, and full hot meals.",
  },
  {
    question: "Is Halfway Cafe near Sidcup Station?",
    answer:
      "Yes. We are on Halfway Street in Sidcup DA15, a short distance from Sidcup Station — easy to reach before or after your commute.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/breakfast-da15#webpage",
      name: "Breakfast in DA15 | Halfway Cafe, Sidcup",
      url: "https://halfwaycafe.co.uk/breakfast-da15",
      about: "Breakfast in DA15, Sidcup",
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
          name: "Breakfast in DA15",
          item: "https://halfwaycafe.co.uk/breakfast-da15",
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

export default function BreakfastDA15Page() {
  return (
    <main className="bg-[#FAF8F5] pb-20 pt-10 md:pb-28 md:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-[84rem] px-4 md:px-8">
        <div className="grid items-center gap-8 rounded-xl bg-white p-7 shadow-sm md:p-12 lg:grid-cols-2">
          <div>
            <h1 className="font-playfair text-4xl font-bold leading-tight text-ink md:text-5xl">
              Breakfast in DA15 — Halfway Cafe, Sidcup
            </h1>
            <p className="mt-5 font-inter text-[17px] leading-8 text-text-mid md:text-lg md:leading-9">
              DA15 is Sidcup, and Halfway Cafe has been the postcode&apos;s local
              breakfast spot for over 20 years. We&apos;re on Halfway Street —
              serving proper cooked breakfasts, bacon sandwiches, hot drinks, and
              everything in between. If you want{" "}
              <Link
                href="/breakfast-sidcup"
                className="text-accent underline hover:text-accent/80"
              >
                breakfast in Sidcup
              </Link>{" "}
              without the fuss, this is it.
            </p>
            <p className="mt-4 font-inter text-[15px] font-semibold text-ink">
              Walk in any day — no booking, no waiting list.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Breakfast Menu
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
            <ServerPublicImage
              source={BREAKFAST_HERO_IMAGE_URL}
              role="hero"
              alt="Cooked breakfast at Halfway Cafe, DA15 Sidcup"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 767px) calc(100vw - 88px), (max-width: 1023px) calc(100vw - 160px), (max-width: 1343px) calc(50vw - 96px), 576px"
            />
          </div>
        </div>
      </section>

      {/* Quick local info */}
      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Find Us in DA15
          </h2>
          <div className="mt-5 space-y-2 font-inter text-base leading-7 text-text-mid">
            <p>
              <strong>Address:</strong> 176 Halfway Street, Sidcup, DA15 8DJ
            </p>
            <p>
              <strong>Phone:</strong> {HALFWAY_CAFE_PHONE_DISPLAY}
            </p>
            <p>
              <strong>Hours:</strong> Mon–Sat 7:00am – 3:00pm, Sunday 9:00am – 2:00pm
            </p>
            <p className="font-semibold text-ink">
              Walk-ins welcome — no reservation needed.
            </p>
          </div>
        </div>
      </section>

      {/* Why locals choose us */}
      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          A DA15 Breakfast Cafe Worth Knowing
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3 md:[grid-auto-rows:1fr]">
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              🍳
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Over 20 Years in the Postcode
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Halfway Cafe has been a fixture on Halfway Street for more than two
              decades — a breakfast cafe DA15 regulars have relied on for years.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              📍
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Family-Run, No Shortcuts
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Every plate is cooked to order. You get the same quality whether
              it&apos;s a Monday morning or a Sunday sit-down.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              ☕
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Big Portions, Fair Prices
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Generous DA15 breakfast plates at honest prices — with proper coffee
              and tea to match.
            </p>
          </article>
        </div>
      </section>

      {/* Breakfast menu section */}
      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          What&apos;s on the DA15 Breakfast Menu
        </h2>
        <p className="mt-4 font-inter text-[16px] leading-8 text-text-mid">
          From a{" "}
          <Link
            href="/full-english-breakfast-sidcup"
            className="text-accent underline hover:text-accent/80"
          >
            full English breakfast in Sidcup
          </Link>{" "}
          to a quick bacon roll and a hot drink — the menu covers everything a
          proper morning breakfast in DA15 should.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
          {featuredBreakfastItems.map((item) => (
            <article
              key={item.name}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-parchment-dark">
                <ServerPublicImage
                  source={item.image}
                  role="card"
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 25vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <p className="font-playfair text-[1.32rem] font-bold leading-tight text-ink md:text-[1.42rem]">
                  {item.name}
                </p>
                <p className="mt-3 font-inter text-[15px] leading-7 text-text-mid">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-4 font-inter text-sm font-semibold text-accent"
                >
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Commuter / before work + dine in or takeaway */}
      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
              Breakfast for DA15 Commuters
            </h2>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Heading into London from Sidcup Station? We open at 7:00am Monday
              to Saturday, which means hot food and coffee are ready well before
              most trains. As a{" "}
              <Link
                href="/cafe-near-sidcup-station"
                className="text-accent underline hover:text-accent/80"
              >
                cafe near Sidcup Station
              </Link>
              , we&apos;re a natural stop for DA15 workers grabbing breakfast on
              the way.
            </p>
            <p className="mt-3 font-inter text-[15px] leading-7 text-text-mid">
              Everything is available to eat in or take away — your call.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
              Dine In or Take Away
            </h2>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Whether you want to sit down for a proper breakfast in DA15 or
              grab something on the go, we&apos;ve got you covered. The full
              breakfast menu — including hot drinks, sandwiches, and full cooked
              plates — is available to take away at the counter.
            </p>
            <p className="mt-3 font-inter text-[15px] leading-7 text-text-mid">
              Families, solo diners, and regulars are all welcome. No booking,
              no fuss.
            </p>
          </article>
        </div>
      </section>

      {/* About section */}
      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl border border-border bg-white p-7 shadow-[0_14px_36px_rgba(26,26,26,0.08)] md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-ink md:text-5xl">
            The DA15 Breakfast Cafe That&apos;s Been Here All Along
          </h2>
          <p className="mt-6 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            If you live or work in the DA15 postcode, chances are you&apos;ve
            walked past Halfway Cafe more than once. We&apos;re a family-run
            breakfast cafe on Halfway Street in Sidcup — easy to reach from
            Blackfen, Bexley, Welling, and Eltham — and we&apos;ve been serving
            the same honest cooked breakfast since the day we opened.
          </p>
          <p className="mt-8 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            No reservations, no complicated menus. Just a proper DA15 breakfast
            cafe open seven days a week.
          </p>
          <ul className="mt-7 space-y-2 font-inter text-[15px] leading-7 text-text-mid">
            <li>• Full cooked breakfasts made fresh to order</li>
            <li>• Bacon sandwiches, eggs, toast and hot drinks</li>
            <li>• Dine in or takeaway — open 7 days</li>
            <li>• Free street parking on Halfway Street</li>
            <li>• Cards and contactless accepted</li>
            <li>• Family-friendly, walk-ins always welcome</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-accent p-7 text-center shadow-sm md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
            Ready for breakfast in DA15?
          </h2>
          <p className="mx-auto mt-5 max-w-[48rem] font-inter text-base leading-8 text-white/90 md:text-lg">
            Walk in any day — open 7 days a week on Halfway Street, Sidcup DA15.
            Call us on {HALFWAY_CAFE_PHONE_DISPLAY} or just turn up.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-center md:gap-5">
            <Link
              href="/menu"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-[#FFF0E8] md:min-w-[200px] md:w-auto"
            >
              View Full Menu
            </Link>
            <a
              href={HALFWAY_CAFE_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10 md:min-w-[200px] md:w-auto"
            >
              Get Directions
            </a>
            <a
              href={`tel:${HALFWAY_CAFE_PHONE_TEL}`}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10 md:min-w-[200px] md:w-auto"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
