import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { HALFWAY_CAFE_PHONE_DISPLAY, HALFWAY_CAFE_PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Brunch in Sidcup | Pancakes, Eggs Benedict & Coffee | Halfway Cafe",
  description:
    "Enjoy brunch in Sidcup at Halfway Cafe. Pancakes, eggs benedict, fresh coffee, and proper portions in DA15. Walk in anytime or takeaway.",
  alternates: { canonical: "https://halfwaycafe.co.uk/brunch-sidcup" },
  openGraph: {
    title: "Brunch in Sidcup | Pancakes, Eggs Benedict & Coffee | Halfway Cafe",
    description:
      "Brunch favourites in Sidcup DA15 including pancakes, eggs benedict, and coffee. Family-run local cafe, walk-ins welcome.",
    url: "https://halfwaycafe.co.uk/brunch-sidcup",
  },
};

const faqs = [
  {
    question: "What time do you serve brunch in Sidcup?",
    answer:
      "We're open for brunch Monday to Saturday from 7:00am to 3:00pm, and Sunday from 9:00am to 2:00pm.",
  },
  {
    question: "Do I need to book for brunch?",
    answer: "No booking needed. Halfway Cafe is walk-in friendly every day.",
  },
  {
    question: "Can I get brunch as takeaway?",
    answer:
      "Yes. Pancakes, eggs dishes, sandwiches, and drinks are available for takeaway.",
  },
  {
    question: "Do you serve coffee with brunch?",
    answer:
      "Yes - we serve fresh coffee, tea, and hot drinks all day, perfect with our brunch dishes.",
  },
  {
    question: "Where are you located in Sidcup?",
    answer:
      "We're at 176 Halfway Street, Sidcup, DA15 8DJ, with free street parking nearby.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://halfwaycafe.co.uk/brunch-sidcup#webpage",
      name: "Brunch in Sidcup | Pancakes, Eggs Benedict & Coffee | Halfway Cafe",
      url: "https://halfwaycafe.co.uk/brunch-sidcup",
      about: "Brunch in Sidcup",
      isPartOf: {
        "@type": "WebSite",
        name: "Halfway Cafe",
        url: "https://halfwaycafe.co.uk",
      },
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
          name: "Brunch in Sidcup",
          item: "https://halfwaycafe.co.uk/brunch-sidcup",
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

export default function BrunchSidcupPage() {
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
              Brunch in Sidcup
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-text-mid md:text-lg">
              Looking for proper brunch in Sidcup, DA15?
            </p>
            <p className="mt-3 font-inter text-base leading-7 text-text-mid md:text-lg">
              Halfway Cafe is a family-run British caff on Halfway Street serving
              pancakes, eggs benedict, eggs royale, eggs florentine, and fresh coffee
              every day. Whether it&apos;s a weekday catch-up or a weekend late morning stop,
              we keep brunch simple: fresh food, quick service, and no fuss.
            </p>
            <p className="mt-3 font-inter text-sm font-semibold text-ink">
              Walk in, grab a table, or takeaway - whatever suits your day.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu/pancakes-eggs"
                className="rounded-full bg-accent px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
              >
                View Brunch Menu
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
              alt="Brunch dishes and coffee at Halfway Cafe in Sidcup"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 767px) calc(100vw - 88px), (max-width: 1023px) calc(100vw - 160px), (max-width: 1343px) calc(50vw - 96px), 576px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Quick Local Info
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3 font-inter text-base leading-7 text-text-mid">
              <p>
                <strong>Address:</strong> 176 Halfway Street, Sidcup, DA15 8DJ
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${HALFWAY_CAFE_PHONE_TEL}`} className="text-accent">
                  {HALFWAY_CAFE_PHONE_DISPLAY}
                </a>
              </p>
              <p>
                <strong>Opening Hours:</strong>
              </p>
              <p>Mon-Sat: 7:00am - 3:00pm</p>
              <p>Sunday: 9:00am - 2:00pm</p>
            </div>
            <div className="space-y-3 font-inter text-base leading-7 text-text-mid">
              <p>
                <strong>Walk-ins:</strong> Always welcome
              </p>
              <p>
                <strong>Takeaway:</strong> Available across the menu
              </p>
              <p>
                <strong>Parking:</strong> Free street parking nearby
              </p>
              <p className="font-semibold text-ink">No booking needed - just come in.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
          Why Choose Us For Brunch
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              Proper Brunch, Cooked Fresh
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Every brunch dish is cooked to order - from poached eggs to pancake plates.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              Local Sidcup Favourite
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              We&apos;ve served Sidcup and DA15 for over 20 years with reliable food and
              quick service.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <p className="font-playfair text-2xl font-bold text-ink">
              Coffee That Actually Pairs With Brunch
            </p>
            <p className="mt-3 font-inter text-sm leading-7 text-text-mid">
              Fresh coffee, builder&apos;s tea and hot drinks served all day, ready to go
              with any brunch order.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Brunch Favourites
          </h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            Popular choices for late mornings and relaxed catch-ups:
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Pancakes in Sidcup</p>
              <Link href="/pancakes-sidcup" className="mt-2 inline-block text-accent">
                Explore pancakes
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">
                Eggs Benedict in Sidcup
              </p>
              <Link href="/eggs-benedict-sidcup" className="mt-2 inline-block text-accent">
                View eggs dishes
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">
                Pancakes &amp; Eggs Category
              </p>
              <Link href="/menu/pancakes-eggs" className="mt-2 inline-block text-accent">
                Open menu section
              </Link>
            </article>
            <article className="rounded-xl bg-parchment-dark p-5">
              <p className="font-playfair text-2xl font-bold text-ink">Coffee, Tea &amp; Drinks</p>
              <Link href="/menu/drinks" className="mt-2 inline-block text-accent">
                See drinks
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl">
            Brunch in Sidcup, DA15
          </h2>
          <p className="mt-4 font-inter text-base leading-7 text-text-mid">
            <Link href="/cafe-sidcup" className="text-accent">our cafe in Sidcup</Link> is based on Halfway Street in Sidcup DA15, close to local routes
            through Blackfen, Welling, and Bexley. Our brunch menu is designed for people
            who want proper food without the wait - from quick weekday stops to slower
            weekend mornings.
          </p>
          <p className="mt-3 font-inter text-base leading-7 text-text-mid">
            If you&apos;re searching for brunch in Sidcup with walk-ins, fresh coffee, and
            reliable portions, this is your local option.
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
                <p className="mt-2 font-inter text-base leading-7 text-text-mid">
                  {faq.question === "Can I get brunch as takeaway?" ? (
                    <>
                      Yes. You can order{" "}
                      <Link href="/takeaway-sidcup" className="text-accent">
                        brunch takeaway in Sidcup
                      </Link>{" "}
                      — pancakes, eggs dishes, sandwiches, and drinks are all available to take away.
                    </>
                  ) : (
                    faq.answer
                  )}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:mt-16 md:px-8">
        <div className="rounded-xl bg-accent p-6 text-center shadow-sm md:p-10">
          <h2 className="font-playfair text-3xl font-bold text-white md:text-4xl">
            Ready for brunch in Sidcup?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-base text-white/90">
            Walk in today, call us on {HALFWAY_CAFE_PHONE_DISPLAY}, or head straight over
            to Halfway Street.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-center">
            <a
              href={`tel:${HALFWAY_CAFE_PHONE_TEL}`}
              className="rounded-full bg-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-accent no-underline transition-colors duration-200 hover:bg-[#FFF0E8]"
            >
              Call Us
            </a>
            <a
              href={HALFWAY_CAFE_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              Get Directions
            </a>
            <Link
              href="/menu"
              className="rounded-full border border-white px-6 py-3 text-center font-inter text-sm font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
