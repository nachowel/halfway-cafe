/* LocationSection — Find us with info cards & map placeholder */

import { MapPin, Phone } from "lucide-react";
import {
  HALFWAY_CAFE_PHONE_DISPLAY,
  HALFWAY_CAFE_PHONE_TEL,
} from "@/lib/contact";
import { HALFWAY_CAFE_PLACE_URL } from "@/lib/maps";
import SectionHeader from "@/components/ui/SectionHeader";
const openingHours = [
  { label: "Mon–Fri", value: "07:00 – 15:00" },
  { label: "Sat", value: "07:00 – 15:00" },
  { label: "Sun", value: "09:00 – 14:00" },
];

export default function LocationSection() {
  return (
    <section className="bg-parchment-dark pb-10 pt-5 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Info */}
          <div>
            <div className="hidden md:block">
              <SectionHeader
                kicker="Find Us"
                title="Come In,"
                titleItalic="Sit Down"
                subtitle="We're easy to find and even easier to love. Pop in for a cuppa or stay for the full works."
                centered={false}
              />
            </div>

            <div className="space-y-4 md:mt-10 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              <a
                href={HALFWAY_CAFE_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full cursor-pointer rounded-[14px] border border-border bg-white p-4 no-underline transition-colors duration-150 hover:bg-parchment active:bg-parchment md:rounded-none"
                style={{ borderTopWidth: "3px", borderTopColor: "var(--color-red)" }}
              >
                <span className="flex items-center gap-2 font-baskerville text-xs uppercase tracking-wider text-red">
                  <MapPin className="h-[14px] w-[14px] shrink-0" strokeWidth={1.8} />
                  <span>Address</span>
                </span>
                <div className="mt-2 whitespace-pre-line font-playfair text-base text-ink">
                  <div>176 Halfway St</div>
                  <div>Sidcup DA15 8DJ</div>
                </div>
              </a>

              <a
                href={`tel:${HALFWAY_CAFE_PHONE_TEL}`}
                className="block w-full cursor-pointer rounded-[14px] border border-border bg-white p-4 no-underline transition-colors duration-150 hover:bg-parchment active:bg-parchment md:rounded-none"
                style={{ borderTopWidth: "3px", borderTopColor: "var(--color-red)" }}
              >
                <span className="flex items-center gap-2 font-baskerville text-xs uppercase tracking-wider text-red">
                  <Phone className="h-[14px] w-[14px] shrink-0" strokeWidth={1.8} />
                  <span>Phone</span>
                </span>
                <span className="mt-2 block font-playfair text-base text-ink">
                  {HALFWAY_CAFE_PHONE_DISPLAY}
                </span>
              </a>

              <div
                className="rounded-[14px] border border-border bg-white p-4 md:col-span-2 md:rounded-none"
                style={{ borderTopWidth: "3px", borderTopColor: "var(--color-red)" }}
              >
                <span className="flex items-center gap-2 font-baskerville text-xs uppercase tracking-wider text-red">
                  <span className="text-[14px] leading-none">🕒</span>
                  <span>Opening Hours</span>
                </span>

                <div className="mt-3 space-y-2">
                  {openingHours.map((entry) => (
                    <div
                      key={entry.label}
                      className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <span className="font-lora text-sm text-ink">{entry.label}</span>
                      <span className="font-playfair text-base text-ink">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-1.5 font-lora text-sm italic text-ink-light">
              <p>📍 Located in Sidcup town centre</p>
              <p>🚗 Easy parking nearby</p>
            </div>
          </div>

          <div className="h-[280px] w-full overflow-hidden rounded-[16px] border border-border shadow-sm md:h-[450px] md:rounded-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1243.8!2d0.09854!3d51.44075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a951f76511e5%3A0x80acf6d03005ae8c!2sHalfWay%20Cafe!5e0!3m2!1sen!2suk!4v1773275560534!5m2!1sen!2suk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Halfway Cafe location map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
