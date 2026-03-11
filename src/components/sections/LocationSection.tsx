/* LocationSection — Find us with info cards & map placeholder */

import SectionHeader from "@/components/ui/SectionHeader";

const infoCards = [
  { label: "Address", value: "123 High Street\nLondon EC1A 1BB" },
  { label: "Phone", value: "+44 1234 567890" },
  { label: "Mon–Fri", value: "07:00 – 21:00" },
  { label: "Sat–Sun", value: "08:00 – 22:00" },
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
              5 min walk from Oxford Circus · Buses: 7, 23, 55
            </p>
          </div>

          {/* Right — Map placeholder */}
          {/* TODO: Replace with Google Maps embed (<iframe>) when API key is available */}
          <div
            className="relative flex h-[380px] items-center justify-center overflow-hidden border border-border md:h-[460px]"
            style={{
              backgroundColor: "var(--color-parchment)",
              backgroundImage:
                "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          >
            <div className="relative z-10 text-center">
              <span className="block text-5xl">📍</span>
              <h3 className="mt-3 font-playfair text-2xl font-bold text-ink">
                Halfway Cafe
              </h3>
              <p className="mt-1 font-lora text-sm italic text-ink-light">
                123 High Street, London EC1A 1BB
              </p>
              <a
                href="https://maps.google.com/?q=123+High+Street+London+EC1A+1BB"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block bg-ink px-6 py-3 font-baskerville text-xs uppercase tracking-wider text-parchment no-underline transition-colors duration-200 hover:bg-red"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
