/* LocationSection — Find us with info cards & map placeholder */

import SectionHeader from "@/components/ui/SectionHeader";

const infoCards = [
  { label: "Address", value: "176 Halfway St\nSidcup DA15 8DJ" },
  { label: "Phone", value: "020 3343 5303" },
  { label: "Mon–Fri", value: "07:00 – 15:00" },
  { label: "Sat", value: "07:00 – 15:00" },
  { label: "Sun", value: "09:00 – 14:00" },
];

export default function LocationSection() {
  return (
    <section className="bg-parchment-dark py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Info */}
          <div>
            <SectionHeader
              kicker="Find Us"
              title="Come In,"
              titleItalic="Sit Down"
              subtitle="We're easy to find and even easier to love. Pop in for a cuppa or stay for the full works."
              centered={false}
            />

            {/* Info cards 2x2 grid */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {infoCards.map((card) => (
                <div
                  key={card.label}
                  className="border border-border bg-white p-4"
                  style={{ borderTopWidth: "3px", borderTopColor: "var(--color-red)" }}
                >
                  <span className="block font-baskerville text-xs uppercase tracking-wider text-red">
                    {card.label}
                  </span>
                  <span className="mt-2 block whitespace-pre-line font-playfair text-base text-ink">
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Transport note */}
            <p className="mt-6 font-lora text-sm italic text-ink-light">
              Located in Sidcup town centre · Easy parking nearby
            </p>
          </div>

          <div className="w-full h-[450px] overflow-hidden rounded-xl border border-border shadow-sm">
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
