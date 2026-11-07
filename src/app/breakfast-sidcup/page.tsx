import type { Metadata } from "next";
import ServerPublicImage from "@/components/ui/ServerPublicImage";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { HALFWAY_CAFE_PHONE_DISPLAY, HALFWAY_CAFE_PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Breakfast in Sidcup | DA15 Breakfast Near Sidcup Station | Halfway Cafe",
  description:
    "Looking for breakfast in Sidcup or DA15? Halfway Cafe serves full English breakfast, bacon sandwiches, and fresh coffee near Sidcup Station. Walk in or takeaway.",
  alternates: { canonical: "https://halfwaycafe.co.uk/breakfast-sidcup" },
  openGraph: {
    title: "Breakfast in Sidcup | DA15 Breakfast Near Sidcup Station | Halfway Cafe",
    description:
      "Family-run breakfast cafe in Sidcup DA15 near Sidcup Station. Full English, brunch favourites, takeaway, and no booking needed.",
    url: "https://halfwaycafe.co.uk/breakfast-sidcup",
  },
};

const featuredBreakfastItems = [
  {
    name: "Full English Breakfast",
    description:
      "A proper hot plate with eggs, bacon, sausage and all the essentials - cooked fresh to order.",
    href: "/full-english-breakfast-sidcup",
    cta: "View full English details",
    image:
      "set breakfast/Buildersbreakfast.png",
    alt: "Cooked breakfast platter at Halfway Cafe in Sidcup",
  },
  {
    name: "Bacon Sandwich",
    description:
      "Thick-cut back bacon on fresh bread - quick, reliable, and ideal before work.",
    href: "/bacon-sandwich-sidcup",
    cta: "See bacon sandwich page",
    image:
      "sandwiches/bacon.png",
    alt: "Thick-cut bacon sandwich on fresh white or brown bread",
  },
  {
    name: "Brunch Favourites",
    description:
      "Pancakes, eggs benedict, eggs royale and more for later mornings in Sidcup.",
    href: "/brunch-sidcup",
    cta: "Explore brunch in Sidcup",
    image:
      "pancakes/eggfroentine.png",
    alt: "Poached eggs and brunch dish at Halfway Cafe",
  },
  {
    name: "Breakfast Takeaway",
    description:
      "Coffee, sandwiches and full breakfast options packed to go when you are short on time.",
    href: "/takeaway-sidcup",
    cta: "View takeaway options",
    image:
      "drinks/tea.png",
    alt: "Morning tea and takeaway breakfast at Halfway Cafe",
  },
];

const faqs = [
  {
    question: "Do you serve breakfast every day in Sidcup?",
    answer:
      "Yes. We serve breakfast Monday to Saturday from 7:00am to 3:00pm, and Sunday from 9:00am to 2:00pm.",
  },
  {
    question: "Is Halfway Cafe good for breakfast before work?",
    answer:
      "Yes - many customers stop by before work for quick breakfast sandwiches, full English plates, and coffee to go.",
  },
  {
    question: "Are you near Sidcup Station?",
    answer:
      "Yes. We're on Halfway Street in DA15, a short drive or quick bus route from Sidcup Station.",
  },
  {
    question: "Do you offer takeaway breakfast in DA15?",
    answer:
      "Yes. We offer takeaway across the breakfast menu, including drinks, sandwiches, and full hot meals.",
  },
  {
    question: "Can I come in for weekend breakfast in Sidcup?",
    answer:
      "Yes, walk-ins are welcome on weekends. Sunday opening is 9:00am to 2:00pm.",
  },
  {
    question: "Do I need to book a table?",
    answer: "No booking needed. We are a walk-in local cafe.",
  },
  {
    question: "Is there parking nearby?",
    answer: "Yes - free street parking is available near the cafe.",
  },
  {
    question: "Which nearby areas do you serve?",
    answer:
      "We welcome customers from Sidcup, DA15, Blackfen, Welling, Bexley, and surrounding areas.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/breakfast-sidcup#webpage",
      name: "Breakfast in Sidcup | DA15 Breakfast Near Sidcup Station | Halfway Cafe",
      url: "https://halfwaycafe.co.uk/breakfast-sidcup",
      about: "Breakfast in Sidcup and DA15",
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
          name: "Breakfast in Sidcup",
          item: "https://halfwaycafe.co.uk/breakfast-sidcup",
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

export default function BreakfastSidcupPage() {
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
              Breakfast in Sidcup
            </h1>
            <p className="mt-5 font-inter text-[17px] leading-8 text-text-mid md:text-lg md:leading-9">
              Looking for breakfast in Sidcup, DA15, or near Sidcup Station? Halfway
              Cafe is a family-run local caff on Halfway Street serving full English
              breakfast, bacon sandwiches, eggs dishes, and proper coffee every day — a{" "}
              <Link href="/coffee-shop-sidcup" className="text-accent underline hover:text-accent/80">
                coffee shop in Sidcup
              </Link>{" "}
              worth stopping at.
            </p>
            <p className="mt-4 font-inter text-[15px] font-semibold text-ink">
              Walk in any time - quick stop before work or a slower sit-down breakfast.
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
              alt="Breakfast plate and tea at Halfway Cafe in Sidcup DA15"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 767px) calc(100vw - 88px), (max-width: 1023px) calc(100vw - 160px), (max-width: 1343px) calc(50vw - 96px), 576px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 shadow-sm md:p-8">
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
              <strong>Hours:</strong> Mon-Sat 7:00am - 3:00pm, Sunday 9:00am - 2:00pm
            </p>
            <p className="font-semibold text-ink">
              No booking needed - just walk in.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Why Locals Choose Us
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3 md:[grid-auto-rows:1fr]">
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              🍳
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Made Fresh Every Morning
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Every breakfast dish is cooked to order from scratch with no shortcuts.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              📍
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Local Sidcup Favourite
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              A known DA15 breakfast stop for locals, commuters, and regular morning
              customers.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              ☕
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Proper Portions, Quick Service
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Big plates, fair pricing, and coffee served fast when mornings are busy.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
              Breakfast Before Work
            </h2>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Need a quick{" "}
              <Link href="/cafe-near-sidcup-station" className="text-accent underline hover:text-accent/80">
                breakfast near Sidcup Station
              </Link>{" "}
              before your commute? We open
              from 7:00am Monday to Saturday, with hot food and takeaway drinks ready fast.
            </p>
            <p className="mt-3 font-inter text-[15px] leading-7 text-text-mid">
              Ideal for workers, school runs, and early starts across Sidcup and DA15.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
              Weekend Breakfast in Sidcup
            </h2>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Slower morning? Sit down for a full breakfast with coffee and proper
              portions. Sunday opening starts at 9:00am, and walk-ins are always welcome.
            </p>
            <p className="mt-3 font-inter text-[15px] leading-7 text-text-mid">
              Perfect for families and local catch-ups across Sidcup, Bexley, and Welling.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Featured Breakfast Picks
        </h2>
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
                <Link href={item.href} className="mt-4 font-inter text-sm font-semibold text-accent">
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl border border-border bg-white p-7 shadow-[0_14px_36px_rgba(26,26,26,0.08)] md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-ink md:text-5xl">
            Local Breakfast Hub for Sidcup and DA15
          </h2>
          <p className="mt-6 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            Halfway Cafe is on Halfway Street in Sidcup DA15, close to main local routes
            and an easy stop from Sidcup Station, Blackfen, Bexley, Eltham, and Welling.
            We serve customers looking for breakfast before work, a late breakfast, or a
            dependable local takeaway. Searching by postcode? See our{" "}
            <Link href="/breakfast-da15" className="text-accent underline hover:text-accent/80">
              breakfast in DA15
            </Link>{" "}
            page.
          </p>
          <p className="mt-8 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            If you want breakfast in Sidcup that is cooked fresh, served quickly, and
            easy to get to, this is the straightforward local option.
          </p>
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
        <div className="rounded-xl bg-accent p-7 text-center shadow-sm md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
            Ready for breakfast in Sidcup?
          </h2>
          <p className="mx-auto mt-5 max-w-[48rem] font-inter text-base leading-8 text-white/90 md:text-lg">
            Walk in today, call us on {HALFWAY_CAFE_PHONE_DISPLAY}, or head to Halfway
            Street for proper breakfast in DA15.
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
