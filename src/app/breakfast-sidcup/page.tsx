import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Breakfast in Sidcup | Halfway Cafe – Full English & More",
  description:
    "Looking for breakfast in Sidcup? Halfway Cafe on Halfway Street serves full English breakfasts, bacon sandwiches, tea and coffee in DA15. Open Monday to Saturday from 7am to 3pm. Sunday closed.",
  alternates: { canonical: "https://halfwaycafe.co.uk/breakfast-sidcup" },
  openGraph: {
    title: "Breakfast in Sidcup | Halfway Cafe",
    description:
      "A proper British caff on Halfway Street, Sidcup DA15. Full English, bacon sandwiches, builder's tea. Open Monday to Saturday from 7am to 3pm. Sunday closed.",
    url: "https://halfwaycafe.co.uk/breakfast-sidcup",
  },
};

const breakfastItems = [
  {
    name: "Full English Breakfast",
    description:
      "Two eggs, back bacon and sausage with beans, grilled tomato and toast, cooked to order and plated hot.",
    alt: "Full English breakfast in Sidcup cafe",
    image:
      "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/set%20breakfast/Buildersbreakfast.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzZXQgYnJlYWtmYXN0L0J1aWxkZXJzYnJlYWtmYXN0LnBuZyIsImlhdCI6MTc3Mzg4MzkzNywiZXhwIjoyMDU3NzA3OTM3fQ.EAVbSYQdzOVzuWe7Y4iLpjTL95EunDouCk6ESzKhwkA",
  },
  {
    name: "Bacon Sandwich",
    description:
      "Thick-cut back bacon, hot off the grill, stacked into fresh white or brown bread with your choice of sauce.",
    alt: "Bacon sandwich at Halfway Cafe Sidcup",
    image:
      "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/sandwiches/bacon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzYW5kd2ljaGVzL2JhY29uLnBuZyIsImlhdCI6MTc3Mzg4Mzk4MiwiZXhwIjoyMDU3NzA3OTgyfQ.yZdX9HfPuL8_QbbE3FmS-n-nkTBs8BzxK4mn-uJ8BhY",
  },
  {
    name: "Eggs Florentine",
    description:
      "Two poached eggs, spinach and hollandaise on a toasted muffin, served with salad.",
    alt: "Eggs Florentine at Halfway Cafe Sidcup",
    image:
      "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/pancakes/eggfroentine.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwYW5jYWtlcy9lZ2dmcm9lbnRpbmUucG5nIiwiaWF0IjoxNzczODg0MTI1LCJleHAiOjIwNTc3MDgxMjV9.vufN2W1wPROEP8EEKpB-8xlzEQR4j1Q0F2yMhHH_oc8",
  },
  {
    name: "Builder's Tea & Coffee",
    description:
      "Strong builder's tea or fresh coffee, served hot and poured the way you like it.",
    alt: "Tea and coffee at Halfway Cafe Sidcup",
    image:
      "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/drinks/tea.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkcmlua3MvdGVhLnBuZyIsImlhdCI6MTc3Mzg4NDAzNSwiZXhwIjoyMDU3NzA4MDM1fQ.8YrIRBpVvsoeVd2vKlQQ2sOx7llnjm1RQN_2WmgrVuc",
  },
];

const faqs = [
  {
    question: "Do you serve full English breakfast every day?",
    answer:
      "Yes — we serve full English breakfast Monday to Saturday from 7am to 3pm. Sunday: Closed.",
  },
  {
    question: "Where exactly is Halfway Cafe in Sidcup?",
    answer:
      "We're at 176 Halfway Street, Sidcup, DA15 8DJ — just off the A211. Street parking is available nearby.",
  },
  {
    question: "Do I need to book a table?",
    answer:
      "No booking needed. We welcome walk-ins every day. Just come in and we'll seat you.",
  },
  {
    question: "Do you offer takeaway?",
    answer:
      "Yes, we offer takeaway on all our breakfast items. Perfect if you're on the go.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We're based in Sidcup DA15 and welcome customers from across Bexley, Eltham, Blackfen, Welling and surrounding areas.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CafeOrCoffeeShop",
      name: "Halfway Cafe",
      url: "https://halfwaycafe.co.uk",
      telephone: "020 3343 5303",
      address: {
        "@type": "PostalAddress",
        streetAddress: "176 Halfway Street",
        addressLocality: "Sidcup",
        postalCode: "DA15 8DJ",
        addressCountry: "GB",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 51.4285,
        longitude: 0.1056,
      },
      servesCuisine: "British",
      priceRange: "£",
      openingHours: ["Mo-Sa 07:00-15:00"],
      sameAs: [
        "https://instagram.com/halfwaycafesidcup",
        "https://facebook.com/profile.php?id=61580807168670",
        "https://tiktok.com/@halfwaycafesidcup",
      ],
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
              Halfway Cafe is a proper local breakfast spot on Halfway Street in DA15,
              where regulars pop in before work and locals meet for breakfast in Sidcup.
              Full English plates, thick-cut bacon sandwiches, eggs cooked your way, tea
              and coffee, all cooked to order and served hot.
            </p>
            <p className="mt-4 font-inter text-[15px] font-semibold text-ink">
              No booking needed. Just walk in.
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
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-xl">
            <Image
              src={BREAKFAST_HERO_IMAGE_URL}
              alt="Full English breakfast at Halfway Cafe in Sidcup DA15"
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
              Every dish is cooked to order from scratch. No shortcuts, no batch
              cooking, no reheating.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              📍
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              A Sidcup Favourite
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              A well-known local spot for locals, commuters and visitors alike. We&apos;ve
              been serving the DA15 community from Halfway Street for years.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-parchment-dark text-2xl">
              ☕
            </span>
            <p className="mt-4 font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Proper British Portions
            </p>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Full English the way it should be: hot plate, generous portions, and a mug
              of builder&apos;s tea that means business.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Breakfast Favourites
        </h2>
        <div className="mt-7 grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
          {breakfastItems.map((item) => (
            <article
              key={item.name}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-parchment-dark">
                <Image
                  src={item.image}
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
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl border border-border bg-white p-7 shadow-[0_14px_36px_rgba(26,26,26,0.08)] md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-ink md:text-5xl">
            A Proper Breakfast Spot in the Heart of DA15
          </h2>
          <p className="mt-6 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            Halfway Cafe is a family-run spot on Halfway Street and has served Sidcup for
            over 20 years. People come in before work, grab a quick breakfast between
            errands, or sit down for 10 minutes for a full English, a bacon sandwich, or
            eggs on toast, with everything cooked fresh to order and sent out hot.
          </p>
          <p className="mt-9 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            Right in DA15, just off the A211, this Sidcup cafe is an easy stop from
            Bexley, Eltham, Blackfen and Welling, with street parking nearby and plenty of
            regulars passing through morning and lunch. Walk-ins are always welcome, and
            you can{" "}
            <Link href="/" className="font-semibold text-accent no-underline hover:text-accent-dark">
              find out more about us
            </Link>{" "}
            before your next visit.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-white p-7 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">Opening Hours</h2>
          <div className="mt-5 space-y-3 font-inter text-base text-text-mid">
            <p>Mon – Sat: 7:00am – 3:00pm</p>
            <p>Sunday: Closed</p>
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
              <article key={faq.question} className="rounded-xl border border-border bg-parchment-dark p-5 md:p-6">
                <h3 className="font-playfair text-2xl font-bold leading-tight text-ink">{faq.question}</h3>
                <p className="mt-3 font-inter text-base leading-8 text-text-mid">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl bg-accent p-7 text-center shadow-sm md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-white md:text-5xl">
            Come In For Breakfast Tomorrow
          </h2>
          <p className="mx-auto mt-5 max-w-[48rem] font-inter text-base leading-8 text-white/90 md:text-lg">
            Walk-ins welcome every day. Fresh food, familiar faces, proper portions.
          </p>
          <p className="mx-auto mt-2 max-w-2xl font-inter text-sm text-white/80">
            Quick stop or sit down for a bit, both work.
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
              href="tel:02033435303"
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
