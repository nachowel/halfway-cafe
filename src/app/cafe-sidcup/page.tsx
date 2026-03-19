import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Cafe in Sidcup | Breakfast, Sandwiches & Coffee – Halfway Cafe",
  description:
    "Visit Halfway Cafe in Sidcup for breakfast, sandwiches and fresh coffee. A local favourite on Halfway Street, serving quality food with quick service.",
  alternates: { canonical: "https://halfwaycafe.co.uk/cafe-sidcup" },
  openGraph: {
    title: "Cafe in Sidcup | Breakfast, Sandwiches & Coffee – Halfway Cafe",
    description:
      "Visit Halfway Cafe in Sidcup for breakfast, sandwiches and fresh coffee. A local favourite on Halfway Street, serving quality food with quick service.",
    url: "https://halfwaycafe.co.uk/cafe-sidcup",
  },
};

const menuHighlights = [
  {
    name: "Full English Breakfast",
    description:
      "Two eggs, bacon, sausage, beans, grilled tomato and toast, cooked to order and served hot.",
    alt: "Full English breakfast with toast and grilled tomato",
    image:
      "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/set%20breakfast/Buildersbreakfast.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzZXQgYnJlYWtmYXN0L0J1aWxkZXJzYnJlYWtmYXN0LnBuZyIsImlhdCI6MTc3Mzg4MzkzNywiZXhwIjoyMDU3NzA3OTM3fQ.EAVbSYQdzOVzuWe7Y4iLpjTL95EunDouCk6ESzKhwkA",
  },
  {
    name: "Bacon Sandwich",
    description: "Thick-cut back bacon, hot from the grill, packed into fresh white or brown bread.",
    alt: "Fresh bacon sandwich filled with thick-cut back bacon",
    image:
      "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/sandwiches/bacon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzYW5kd2ljaGVzL2JhY29uLnBuZyIsImlhdCI6MTc3Mzg4Mzk4MiwiZXhwIjoyMDU3NzA3OTgyfQ.yZdX9HfPuL8_QbbE3FmS-n-nkTBs8BzxK4mn-uJ8BhY",
  },
  {
    name: "Made-to-Order Burger",
    description: "Hot off the grill with a juicy centre, made to order and served fresh.",
    alt: "Freshly made burger with a juicy centre and toasted bun",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  },
  {
    name: "Builder's Tea",
    description: "A strong, proper brew poured hot, just right with breakfast or a quick break.",
    alt: "Strong builder's tea in a mug at the Sidcup cafe",
    image:
      "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/drinks/tea.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkcmlua3MvdGVhLnBuZyIsImlhdCI6MTc3Mzg4NDAzNSwiZXhwIjoyMDU3NzA4MDM1fQ.8YrIRBpVvsoeVd2vKlQQ2sOx7llnjm1RQN_2WmgrVuc",
  },
];

const faqs = [
  {
    question: "What type of food does Halfway Cafe serve?",
    answer:
      "We serve full English breakfasts, bacon sandwiches, eggs on toast, made-to-order burgers, sandwiches, hot drinks and more. Everything is cooked fresh to order.",
  },
  {
    question: "Where is Halfway Cafe in Sidcup?",
    answer:
      "We're at 176 Halfway Street, Sidcup, DA15 8DJ — just off the A211. Street parking is available nearby.",
  },
  {
    question: "What are your opening hours?",
    answer:
      "We're open Monday to Saturday from 7am to 3pm. Sunday: Closed.",
  },
  {
    question: "Do I need to book a table?",
    answer:
      "No booking needed. We welcome walk-ins every day. Just come in and we'll seat you.",
  },
  {
    question: "Do you offer takeaway?",
    answer:
      "Yes, we offer takeaway on all our menu items. Perfect if you're on the go.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We're based in Sidcup DA15 and welcome customers from Bexley, Eltham, Blackfen, Welling and surrounding areas.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/cafe-sidcup#webpage",
      name: "Cafe in Sidcup | Breakfast, Sandwiches & Coffee – Halfway Cafe",
      url: "https://halfwaycafe.co.uk/cafe-sidcup",
      about: "Cafe in Sidcup",
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
              Halfway Cafe is where people in Sidcup come for breakfast, thick-cut bacon
              sandwiches, made-to-order burgers and a proper mug of tea on Halfway Street,
              DA15. Some pop in before work, some stop for a quick bite, and some sit down
              for a full meal, with everything cooked fresh to order.
            </p>
            <p className="mt-3 font-inter text-sm font-semibold text-ink">
              Quick stop or proper sit-down, both work.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Our Menu
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
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          What We Serve
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-2xl">🍳</p>
            <p className="mt-3 font-playfair text-2xl font-bold text-ink">Full English Breakfasts</p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Full English plates, bacon sandwiches, eggs on toast and more, cooked fresh
              every morning. Sit in for breakfast or grab something hot before work.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-2xl">🍔</p>
            <p className="mt-3 font-playfair text-2xl font-bold text-ink">Sandwiches &amp; Burgers</p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Fresh sandwiches and made-to-order burgers are served right through the day.
              Good for a quick lunch, a quick bite, or something filling on the go.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-2xl">☕</p>
            <p className="mt-3 font-playfair text-2xl font-bold text-ink">Hot Drinks &amp; Takeaway</p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Builder&apos;s tea, coffee and cold drinks are ready all day. Grab one for a
              quick stop, or have it with your meal in or to take away.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Menu Highlights
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {menuHighlights.map((item) => (
            <article key={item.name} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="relative h-40">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 25vw"
                />
              </div>
              <div className="p-4">
                <p className="font-playfair text-xl font-bold text-ink">{item.name}</p>
                <p className="mt-2 font-inter text-sm leading-6 text-text-mid">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            A Local Cafe on Halfway Street, Sidcup
          </h2>
          <p className="mt-4 font-inter text-base leading-8 text-text-mid">
            Halfway Cafe is a family-run local cafe in Sidcup that regulars rely on from
            early breakfast through lunch. On this Halfway Street cafe menu you&apos;ll find
            full English plates, sandwiches, made-to-order burgers and hot drinks, all
            cooked fresh to order whether you&apos;re in before work or stopping for a quick
            bite.
          </p>
          <p className="mt-4 font-inter text-base leading-8 text-text-mid">
            As a DA15 cafe on Halfway Street just off the A211, it&apos;s an easy stop if
            you&apos;re on the way through Sidcup from Bexley, Eltham, Blackfen or Welling,
            with street parking nearby. Walk-ins are always welcome, and you can{" "}
            <Link href="/" className="font-semibold text-accent no-underline hover:text-accent-dark">
              find out more about us
            </Link>{" "}
            before your next visit.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Opening Hours
          </h2>
          <div className="mt-5 space-y-3 font-inter text-base text-text-mid">
            <p>Mon – Sat: 7:00am – 3:00pm</p>
            <p>Sunday: Closed</p>
          </div>
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
            Come In Today
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-inter text-base text-white/90">
            Walk-ins welcome every day. Good food, friendly service, no fuss.
          </p>
          <p className="mx-auto mt-2 max-w-xl font-inter text-sm text-white/80">
            Most people just walk in, no booking needed.
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
              href="tel:02033435303"
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
