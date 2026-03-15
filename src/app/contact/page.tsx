/* Halfway Cafe — Contact page */

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import ContactActionBar from "@/components/ContactActionBar";
import LocationSection from "@/components/sections/LocationSection";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact & Find Us",
  description:
    "Find Halfway Cafe at 176 Halfway St, Sidcup DA15 8DJ. Opening hours, phone number and directions. Easily reachable from Eltham, New Eltham, Bexley, Blackfen and Bexleyheath.",
};

function SectionLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center bg-parchment">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border/70 bg-parchment-dark px-4 md:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 font-inter text-base font-semibold text-ink no-underline"
        >
          <ChevronLeft size={20} strokeWidth={1.5} className="text-ink-light" />
          <span>Contact</span>
        </Link>
      </header>

      <section className="bg-parchment-dark pb-4 pt-6 md:pb-12 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          <nav className="mb-6 hidden font-lora text-sm text-ink-light md:block">
            <Link href="/" className="text-ink-light no-underline hover:text-red">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span className="text-ink">Contact</span>
          </nav>

          <h1 className="font-playfair text-4xl font-bold text-ink md:text-5xl">
            Get In Touch
          </h1>
          <p className="mx-auto mt-3 max-w-lg font-lora text-sm italic text-ink-light md:mt-4 md:text-base">
            Whether it&apos;s a question, a booking, or just to say hello — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <Suspense fallback={<SectionLoader />}>
        <LocationSection />
      </Suspense>

      <section className="bg-parchment pb-12 pt-6 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <div
            className="rounded-[16px] border border-border bg-white p-6 md:rounded-none md:p-8"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
          >
            <h2 className="font-playfair text-2xl font-bold text-ink">
              Send Us a Message
            </h2>
            <p className="mt-2 font-lora text-sm italic text-ink-light">
              Have a question or want to make a booking? Send us a message and we&apos;ll get back to you shortly.
            </p>

            <ContactForm />
          </div>

          <div className="mt-8 md:hidden">
            <ContactActionBar />
          </div>
        </div>
      </section>
    </>
  );
}
