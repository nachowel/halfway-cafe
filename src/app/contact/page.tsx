/* Halfway Cafe — Contact page */

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LocationSection from "@/components/sections/LocationSection";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Halfway Cafe — find our address, opening hours, phone number, or send us a message. 123 High Street, London EC1A 1BB.",
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
      {/* Page hero */}
      <section className="bg-parchment-dark pb-12 pt-32">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 font-lora text-sm text-ink-light">
            <Link href="/" className="text-ink-light no-underline hover:text-red">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span className="text-ink">Contact</span>
          </nav>

          <h1 className="font-playfair text-4xl font-bold text-ink md:text-5xl">
            Get In Touch
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-lora text-base italic text-ink-light">
            Whether it&apos;s a question, a booking, or just to say hello — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Location section */}
      <Suspense fallback={<SectionLoader />}>
        <LocationSection />
      </Suspense>

      {/* Contact form */}
      <section className="bg-parchment py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <div className="border border-border bg-white p-6 md:p-8">
            <h2 className="font-playfair text-2xl font-bold text-ink">
              Send Us a Message
            </h2>
            <p className="mt-2 font-lora text-sm italic text-ink-light">
              We&apos;ll get back to you as soon as we can.
            </p>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
