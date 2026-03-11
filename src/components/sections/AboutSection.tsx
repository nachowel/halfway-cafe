/* AboutSection — Our story with photo, text, bullet points & stats */

import Image from "next/image";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80";

const bulletPoints = [
  "Locally sourced ingredients, every single day",
  "Everything cooked fresh to order",
  "Regulars welcomed like family",
  "Open 7 days a week, rain or shine",
];

const stats = [
  { value: "16+", label: "Years Open" },
  { value: "4.8★", label: "Google Rating" },
  { value: "100%", label: "Fresh Daily" },
];

export default function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-24">
      {/* Subtle dot texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #f2ebe0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — Photo */}
          <div className="relative min-h-[480px] lg:min-h-[560px]">
            {/* Red offset frame */}
            <div className="absolute -left-4 -top-4 bottom-4 right-4 border-2 border-red" />

            {/* Photo */}
            <div className="relative z-10 overflow-hidden">
              <Image
                src={ABOUT_IMAGE}
                alt="Halfway Cafe kitchen and counter"
                width={600}
                height={560}
                className="h-auto w-full object-cover"
              />
            </div>

            {/* Est. 2008 ribbon */}
            <div className="absolute -bottom-2 -right-2 z-20 bg-red px-5 py-4 text-center md:-bottom-3 md:-right-3 md:px-6 md:py-5">
              <span className="block font-playfair text-3xl font-black text-white md:text-4xl">
                2008
              </span>
              <span className="block font-baskerville text-[10px] uppercase tracking-widest text-white/70">
                Est. London
              </span>
            </div>
          </div>

          {/* Right — Text */}
          <div>
            {/* Kicker */}
            <span className="font-baskerville text-sm uppercase tracking-widest text-gold">
              Our Story
            </span>

            {/* Gold diamond divider */}
            <div className="my-3 flex items-center gap-3">
              <span className="block h-px w-8 bg-gold" />
              <span className="text-sm text-gold">◆</span>
              <span className="block h-px w-8 bg-gold" />
            </div>

            {/* Title */}
            <h2 className="font-playfair text-3xl font-bold text-parchment md:text-4xl lg:text-5xl">
              A Proper{" "}
              <span className="italic text-gold-light">London Caff</span>
            </h2>

            {/* Paragraphs */}
            <p
              className="mt-6 font-lora text-sm leading-relaxed md:text-base"
              style={{ color: "rgba(242, 235, 224, 0.7)" }}
            >
              Halfway Cafe has been serving the good people of London since 2008.
              What started as a tiny kitchen and a handful of tables has grown into
              one of the city&apos;s most loved greasy spoons — a place where builders
              sit next to bankers, and everyone gets the same warm welcome.
            </p>
            <p
              className="mt-4 font-lora text-sm leading-relaxed md:text-base"
              style={{ color: "rgba(242, 235, 224, 0.7)" }}
            >
              We don&apos;t do fancy. We do proper. Thick toast, strong tea, eggs done
              any way you like, and a full English that&apos;ll set you up for the day.
              Every plate is cooked fresh, every customer is a regular in the making.
            </p>

            {/* Bullet list */}
            <ul className="mt-6 flex flex-col gap-3">
              {bulletPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="block h-px w-6 shrink-0 bg-red" />
                  <span
                    className="font-lora text-sm"
                    style={{ color: "rgba(242, 235, 224, 0.8)" }}
                  >
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            {/* Stats grid */}
            <div
              className="mt-10 grid grid-cols-3 divide-x"
              style={{ borderColor: "rgba(242, 235, 224, 0.1)" }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 text-center first:pl-0 last:pr-0">
                  <span className="block font-playfair text-3xl font-black text-white md:text-4xl">
                    {stat.value}
                  </span>
                  <span
                    className="mt-1 block font-lora text-xs"
                    style={{ color: "rgba(242, 235, 224, 0.55)" }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
