import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";

const BUILDERS_BREAKFAST_IMAGE_URL =
  "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/sign/set%20breakfast/Buildersbreakfast.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OGQzYzNmMC0zZmQ4LTRkNTAtYmE4My0xZjJlOTQzMDczMzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzZXQgYnJlYWtmYXN0L0J1aWxkZXJzYnJlYWtmYXN0LnBuZyIsImlhdCI6MTc3Mzg4MzkzNywiZXhwIjoyMDU3NzA3OTM3fQ.EAVbSYQdzOVzuWe7Y4iLpjTL95EunDouCk6ESzKhwkA";

export const metadata: Metadata = {
  title: "Full English Breakfast in Sidcup | Halfway Cafe",
  description:
    "Enjoy a proper full English breakfast in Sidcup at Halfway Cafe. Eggs, sausage, bacon, beans and more – freshly prepared and served hot.",
  alternates: {
    canonical: "https://halfwaycafe.co.uk/full-english-breakfast-sidcup",
  },
  openGraph: {
    title: "Full English Breakfast in Sidcup | Halfway Cafe",
    description:
      "Enjoy a proper full English breakfast in Sidcup at Halfway Cafe. Eggs, sausage, bacon, beans and more – freshly prepared and served hot.",
    url: "https://halfwaycafe.co.uk/full-english-breakfast-sidcup",
  },
};

const faqs = [
  {
    question: "Do you serve full English breakfast every day?",
    answer:
      "Yes, we serve full English breakfast Monday to Saturday from 7am to 3pm. Sunday: Closed.",
  },
  {
    question: "Where are you located?",
    answer: "We're at 176 Halfway Street, Sidcup, DA15 8DJ, just off the A211.",
  },
  {
    question: "Do I need to book?",
    answer: "No booking needed. Just walk in and we\u2019ll seat you.",
  },
  {
    question: "Do you offer takeaway?",
    answer: "Yes, all our breakfast items are available for takeaway.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/full-english-breakfast-sidcup#webpage",
      name: "Full English Breakfast in Sidcup | Halfway Cafe",
      url: "https://halfwaycafe.co.uk/full-english-breakfast-sidcup",
      about: "Full English breakfast in Sidcup",
      isPartOf: {
        "@type": "WebSite",
        name: "Halfway Cafe",
        url: "https://halfwaycafe.co.uk",
      },
      primaryImageOfPage:
        "https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/public/set%20breakfast/Buildersbreakfast.png",
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
          name: "Full English Breakfast",
          item: "https://halfwaycafe.co.uk/full-english-breakfast-sidcup",
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

export default function FullEnglishBreakfastSidcupPage() {
  return (
    <main className="bg-[#FAF8F5] pb-20 pt-10 md:pb-28 md:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-[84rem] px-4 md:px-8">
        <div className="grid items-center gap-8 rounded-xl border border-border bg-white p-7 shadow-[0_14px_34px_rgba(26,26,26,0.08)] md:p-12 lg:grid-cols-2">
          <div>
            <h1 className="font-playfair text-4xl font-bold leading-tight text-ink md:text-5xl">
              Full English Breakfast in Sidcup
            </h1>
            <p className="mt-5 font-inter text-[17px] leading-8 text-text-mid md:text-lg md:leading-9">
              A proper plate of eggs, bacon, sausage, baked beans and toast, cooked fresh
              and served hot. Some people come in before work for a quick bite, others sit
              down for a full breakfast in Sidcup and take their time.
            </p>
            <p className="mt-3 font-inter text-sm font-semibold text-ink">
              No shortcuts. Just a proper fry-up.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Menu
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

          <div className="relative min-h-[320px] overflow-hidden rounded-xl md:min-h-[360px]">
            <Image
              src={BUILDERS_BREAKFAST_IMAGE_URL}
              alt="Full English breakfast with eggs, bacon, sausage and beans"
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
          What&apos;s in a Full English Breakfast?
        </h2>
        <p className="mt-3 max-w-3xl font-inter text-[15px] leading-7 text-text-mid">
          The classic plate, done simply and cooked to order.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-6 shadow-[0_10px_24px_rgba(26,26,26,0.06)] md:p-7">
            <p className="font-inter text-[17px] font-semibold leading-7 text-ink">Eggs (fried or scrambled)</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-[0_10px_24px_rgba(26,26,26,0.06)] md:p-7">
            <p className="font-inter text-[17px] font-semibold leading-7 text-ink">Bacon</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-[0_10px_24px_rgba(26,26,26,0.06)] md:p-7">
            <p className="font-inter text-[17px] font-semibold leading-7 text-ink">Sausages</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-[0_10px_24px_rgba(26,26,26,0.06)] md:p-7">
            <p className="font-inter text-[17px] font-semibold leading-7 text-ink">Baked beans</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-[0_10px_24px_rgba(26,26,26,0.06)] md:p-7">
            <p className="font-inter text-[17px] font-semibold leading-7 text-ink">Toast</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-[0_10px_24px_rgba(26,26,26,0.06)] md:p-7">
            <p className="font-inter text-[17px] font-semibold leading-7 text-ink">Optional extras (tomato, mushrooms)</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Why People Come Here For It
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-3 md:[grid-auto-rows:1fr]">
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <h3 className="font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Cooked Fresh to Order
            </h3>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Eggs go on the pan when you order. Nothing sits waiting under heat lamps.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <h3 className="font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Proper Portions
            </h3>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              A full plate that actually fills you up, whether it&apos;s breakfast before work
              or a late morning sit-down.
            </p>
          </article>
          <article className="h-full rounded-xl border border-border bg-white p-7 shadow-[0_12px_30px_rgba(26,26,26,0.08)] md:p-8">
            <h3 className="font-playfair text-[1.65rem] font-bold leading-tight text-ink">
              Local Favourite
            </h3>
            <p className="mt-4 font-inter text-[15px] leading-7 text-text-mid">
              Regulars from around Sidcup know this as one of the best full english sidcup
              spots for a proper fry-up.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl border border-border bg-white p-4 shadow-[0_14px_32px_rgba(26,26,26,0.08)] md:p-6">
          <div className="grid gap-5 md:grid-cols-[1.3fr_1fr] md:items-stretch">
            <div className="relative h-[260px] overflow-hidden rounded-xl md:h-[340px]">
              <Image
                src={BUILDERS_BREAKFAST_IMAGE_URL}
                alt="Traditional full English breakfast plate at our Sidcup cafe"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
            <div className="flex flex-col justify-center rounded-xl bg-parchment-dark p-6 md:p-7">
              <p className="font-playfair text-3xl font-bold leading-tight text-ink md:text-4xl">
                Hot. Filling. Classic.
              </p>
              <p className="mt-4 font-inter text-base leading-7 text-text-mid">
                Served hot from the pan.
              </p>
              <p className="mt-2 font-inter text-base leading-7 text-text-mid">
                Filling enough to carry you through the day.
              </p>
              <p className="mt-2 font-inter text-base leading-7 text-text-mid">
                The full English breakfast Sidcup regulars come back for.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-[84rem] px-4 md:mt-20 md:px-8">
        <div className="rounded-xl border border-border bg-white p-7 shadow-[0_14px_36px_rgba(26,26,26,0.08)] md:p-12">
          <h2 className="font-playfair text-3xl font-bold leading-tight text-ink md:text-5xl">
            A Proper Full English in Sidcup
          </h2>
          <p className="mt-6 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            Halfway Cafe on Halfway Street, DA15 is where people come for a full English
            before work, for a late breakfast, or when they just want a proper plate done
            right. You&apos;ll see regulars in most mornings and plenty of locals dropping in
            when they search for full english near me.
          </p>
          <p className="mt-9 font-inter text-[17px] leading-9 text-text-mid md:text-[18px]">
            Just off the A211, it&apos;s easy to reach from Bexley, Eltham and Welling, whether
            you&apos;re passing through or heading into Sidcup town. If you want breakfast Sidcup
            locals trust, this is the straightforward caff option: hot food, quick service,
            no fuss.
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
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">Frequently Asked Questions</h2>
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
            Come In For a Proper Full English
          </h2>
          <p className="mx-auto mt-5 max-w-[48rem] font-inter text-base leading-8 text-white/90 md:text-lg">
            Hot breakfast, proper portions, quick service when you need it.
          </p>
          <p className="mx-auto mt-2 max-w-2xl font-inter text-sm text-white/80">
            Most people just walk in — no booking needed.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-center md:gap-5">
            <Link
              href="/menu"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-7 py-4 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-[#FFF0E8] md:min-w-[200px] md:w-auto"
            >
              View Menu
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
