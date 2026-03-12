/* AboutSection — Dark story section with readable copy and stat row */

import Image from "next/image";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80";

const bulletPoints = [
  "Fresh ingredients prepared every day",
  "Cooked to order from breakfast through dinner",
  "A warm welcome for locals, regulars, and first-timers",
];

const stats = [
  { value: "16+", label: "Years Open" },
  { value: "4.8★", label: "Google Rating" },
  { value: "7 Days", label: "Open Weekly" },
];

export default function AboutSection() {
  return (
    <section className="bg-[#1a1a1a] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="relative">
            <div className="absolute -left-4 -top-4 bottom-4 right-4 rounded-2xl border border-orange-400/50" />
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={ABOUT_IMAGE}
                alt="Halfway Cafe kitchen and counter"
                width={720}
                height={840}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute bottom-4 right-4 rounded-2xl bg-orange-500 px-5 py-4 text-center shadow-lg">
              <span className="block font-playfair text-3xl font-black text-white md:text-4xl">
                2008
              </span>
              <span className="mt-1 block font-inter text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
                Est. London
              </span>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="font-inter text-sm font-bold uppercase tracking-[0.24em] text-orange-400">
              Our Story
            </p>

            <h2 className="mt-4 font-playfair text-4xl font-bold leading-tight md:text-5xl">
              <span className="text-white">A Proper </span>
              <span className="italic text-orange-400">London Caff</span>
            </h2>

            <div className="mt-6 space-y-4">
              <p className="font-inter text-base leading-7 text-gray-300">
                Halfway Cafe has been serving High Street since 2008. What began
                as a compact kitchen and a handful of tables grew into a cafe
                known for honest plates, strong coffee, and the kind of service
                that remembers your order.
              </p>
              <p className="font-inter text-base leading-7 text-gray-300">
                We keep things simple in the right way: breakfast cooked fresh,
                lunch done properly, and a room that feels busy, warm, and lived
                in from the first service to the last cup of tea.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {bulletPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 block h-px w-8 shrink-0 bg-orange-400" />
                  <span className="font-inter text-sm leading-6 text-gray-300">
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/5 px-5 py-5 text-center">
                  <span className="block font-playfair text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="mt-2 block font-inter text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
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
