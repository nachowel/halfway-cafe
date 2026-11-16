/* Halfway Cafe — FAQ page (one responsive tree, server-rendered) */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Phone, MapPin } from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileFooter from "@/components/MobileFooter";

const faqs = [
  {
    question: "Where is Halfway Cafe located?",
    answer:
      "We're at 176 Halfway Street, Sidcup, DA15 8DJ — right in the heart of Sidcup, easily accessible from Eltham, Bexley, Blackfen, and surrounding areas.",
  },
  {
    question: "What are your opening hours?",
    answer:
      "Monday – Friday: 7:00am – 3:00pm. Saturday: 8:00am – 3:00pm. Sunday: 9:00am – 2:00pm.",
  },
  {
    question: "Is there parking near Halfway Cafe?",
    answer:
      "Yes — there is street parking available on Halfway Street and nearby roads. We're also a short walk from local bus stops, making us easy to reach by public transport.",
  },
  {
    question: "Do you serve breakfast all day?",
    answer:
      "Yes — we serve our full menu from opening until close every day. Whether you're after a weekday Full English at 7am or a late breakfast around 2pm, we've got you covered.",
  },
  {
    question: "Do you offer takeaway?",
    answer:
      "Yes, we offer takeaway on all menu items. Simply ask at the counter and we'll have everything packed and ready for you.",
  },
  {
    question: "Do you cater for vegetarians?",
    answer:
      "Yes — we have vegetarian options on our menu, including vegetarian breakfasts and light bites. Just let us know when ordering and we'll be happy to help.",
  },
  {
    question: "Do you cater for food allergies?",
    answer:
      "We take allergies seriously. Please speak to a member of staff before ordering and we will do our best to accommodate your needs. Our kitchen handles common allergens including gluten, dairy, and eggs.",
  },
  {
    question: "Do you accept card payments?",
    answer:
      "Yes, we accept all major debit and credit cards as well as cash. Contactless payments are welcome.",
  },
  {
    question: "Can I book a table?",
    answer:
      "Halfway Cafe operates on a walk-in basis — no reservation needed. We do get busy during peak breakfast hours (8am–11am on weekends), so arriving a little earlier is always a good idea.",
  },
  {
    question: "Is Halfway Cafe family-friendly?",
    answer:
      "Absolutely. Halfway Cafe has been a welcoming family-run caff for over 20 years. Families and children are always welcome, and our portions are generous enough for even the biggest appetites!",
  },
  {
    question: "How do I contact Halfway Cafe?",
    answer:
      "You can call us on 020 3343 5303. You can also find us on Instagram and Facebook — links are in the footer of our website.",
  },
  {
    question: "Is Halfway Cafe on Uber Eats or Deliveroo?",
    answer:
      "Yes — you can also order through delivery platforms. Check our homepage for current delivery options and links.",
  },
];

export default function FaqContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#E8E2D9] bg-[#FAF8F5] px-4 md:hidden">
        <Link href="/" className="flex w-9 items-center justify-start no-underline">
          <span className="font-inter text-xl leading-none text-gray-500">←</span>
        </Link>

        <div className="text-center">
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "20px",
              letterSpacing: "-0.2px",
              color: "#1A1A1A",
            }}
          >
            FAQ
          </p>
          <p
            className="text-[#9CA3AF]"
            style={{ fontSize: "12px", fontWeight: 500, marginTop: "1px", opacity: 0.85 }}
          >
            Common questions answered
          </p>
        </div>

        <div className="w-9" />
      </header>

      <div className="pb-[calc(58px+env(safe-area-inset-bottom,0px)+16px)] md:pb-0">
        {/* Hero */}
        <section className="bg-[#FAF8F5] pb-4 pt-5 md:pb-12 md:pt-32">
          <div className="px-4 md:mx-auto md:max-w-7xl md:px-8">
            <nav className="mb-6 hidden font-inter text-sm text-[#666666] md:block">
              <Link href="/" className="text-[#666666] no-underline hover:text-[#FF6B35]">
                Home
              </Link>
              <span className="mx-2">→</span>
              <span className="text-[#1A1A1A]">FAQ</span>
            </nav>

            <div className="max-w-2xl">
              <h1 className="font-playfair text-[26px] font-bold leading-[1.25] text-[#1A1A1A] md:text-[48px] md:leading-[1.25]">
                Frequently Asked Questions
              </h1>
              <div className="mt-2 h-1 w-12 rounded-full bg-[#FF6B35] md:mt-3 md:w-16" />
              <p className="mt-3 font-inter text-sm leading-relaxed text-[#666666] md:mt-5 md:text-lg">
                Everything you need to know before visiting Halfway Cafe in Sidcup, DA15.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="bg-[#FAF8F5] md:pb-16">
          <div className="px-4 md:mx-auto md:max-w-3xl md:px-8">
            <div className="flex flex-col gap-2.5 md:gap-3">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] md:shadow-sm md:transition-all md:duration-200"
                    style={{
                      borderLeft: isOpen ? "4px solid #FF6B35" : "4px solid transparent",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:gap-4 md:px-6 md:py-5"
                      aria-expanded={isOpen}
                      style={{ minHeight: "56px" }}
                    >
                      <span className="font-inter text-sm font-semibold text-[#1A1A1A] md:text-base">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-[#FF6B35] transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        strokeWidth={2}
                      />
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? "500px" : "0px" }}
                    >
                      <p className="px-4 pb-4 font-inter text-sm leading-relaxed text-[#666666] md:px-6 md:pb-5">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mobile CTA */}
        <div className="mx-4 mt-6 rounded-2xl bg-[#FF6B35] px-5 py-6 text-center md:hidden">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "#FFFFFF",
              lineHeight: 1.3,
            }}
          >
            Still have questions?
          </h2>
          <p className="mt-1 font-inter text-sm text-white/80">We&apos;d love to hear from you.</p>
          <div className="mt-4 flex flex-col gap-3">
            <a
              href="tel:02033435303"
              className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-inter text-sm font-bold text-[#FF6B35] no-underline"
            >
              <Phone className="h-4 w-4" strokeWidth={2} />
              Call Us
            </a>
            <a
              href="https://maps.google.com/?q=176+Halfway+Street+Sidcup+DA15+8DJ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-3 font-inter text-sm font-bold text-white no-underline"
            >
              <MapPin className="h-4 w-4" strokeWidth={2} />
              Get Directions
            </a>
          </div>
        </div>

        {/* Desktop CTA Banner */}
        <section className="hidden bg-[#FF6B35] py-14 md:block">
          <div className="mx-auto max-w-7xl px-8 text-center">
            <h2 className="font-playfair text-3xl font-bold text-white">
              Still have questions? We&apos;d love to hear from you.
            </h2>
            <p className="mt-3 font-inter text-white/80">
              Pop in, give us a call, or find us on the map.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:02033435303"
                className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-inter text-sm font-bold text-[#FF6B35] no-underline transition-colors duration-200 hover:bg-[#FFF3EE]"
              >
                <Phone className="h-4 w-4" strokeWidth={2} />
                Call Us
              </a>
              <a
                href="https://maps.google.com/?q=176+Halfway+Street+Sidcup+DA15+8DJ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border-2 border-white px-7 py-3.5 font-inter text-sm font-bold text-white no-underline transition-colors duration-200 hover:bg-white/10"
              >
                <MapPin className="h-4 w-4" strokeWidth={2} />
                Get Directions
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <MobileFooter />
      </div>
      <MobileBottomNav />
    </div>
  );
}
