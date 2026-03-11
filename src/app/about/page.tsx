/* Halfway Cafe — About page */

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of Halfway Cafe — a proper London greasy spoon serving the community since 2008. Fresh food, friendly faces, no fuss.",
};

const values = [
  {
    emoji: "🥚",
    title: "Fresh Every Day",
    description:
      "Every ingredient is sourced fresh each morning. Nothing frozen, nothing reheated — just proper food made from scratch.",
  },
  {
    emoji: "🏘️",
    title: "Local Community",
    description:
      "We're not a chain. We're your neighbour. From builders to barristers, everyone's welcome at our table.",
  },
  {
    emoji: "❤️",
    title: "Family Run",
    description:
      "Run by the same family since day one. We put heart into every plate because this isn't just a business — it's home.",
  },
];

function SectionLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center bg-parchment">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Page hero */}
      <section className="bg-parchment-dark pb-12 pt-32">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 font-lora text-sm text-ink-light">
            <Link href="/" className="text-ink-light no-underline hover:text-red">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span className="text-ink">About</span>
          </nav>

          <h1 className="font-playfair text-4xl font-bold text-ink md:text-5xl">
            Our Story
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-lora text-base italic text-ink-light">
            Sixteen years, one kitchen, and a whole lot of bacon.
          </p>
        </div>
      </section>

      {/* About section */}
      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>

      {/* Values / Mission */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
            {values.map((item) => (
              <div key={item.title} className="text-center">
                <span className="block text-5xl">{item.emoji}</span>
                <h3 className="mt-4 font-playfair text-xl font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 font-lora text-sm italic leading-relaxed text-ink-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Suspense fallback={<SectionLoader />}>
        <GallerySection />
      </Suspense>
    </>
  );
}
