import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80";

const bulletPoints = [
  "Family-run for over 20 years — proudly serving Sidcup, DA15",
  "Fresh, quality ingredients prepared every single day",
  "Full English breakfast, lunch plates, burgers & more",
  "Cooked to order, every time, no shortcuts",
  "Customer satisfaction is always our first priority",
  "A warm welcome for locals, families, and first-timers alike",
];

const stats = [
  { value: "Over 20 years", label: "Established" },
  { value: "176 Halfway St", label: "Sidcup DA15 8DJ" },
  { value: "Family Run", label: "Local Cafe" },
];

export default function AboutSection() {
  return (
    <section className="bg-[#1a1a1a] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <ScrollReveal duration={800}>
            <div className="relative">
              <div className="absolute -left-4 -top-4 bottom-4 right-4 rounded-2xl border border-orange-400/50" />
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src={ABOUT_IMAGE}
                  alt="Cafe team serving breakfast at Halfway Cafe in Sidcup"
                  width={720}
                  height={840}
                  sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 64px), (max-width: 1279px) calc(48.78vw - 62px), 562px"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute bottom-4 right-4 rounded-2xl bg-orange-500 px-5 py-4 text-center shadow-lg">
                <span className="block font-playfair text-3xl font-black text-white md:text-4xl">
                  Over 20
                </span>
                <span className="mt-1 block font-inter text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
                  Years Serving Sidcup
                </span>
              </div>
            </div>
          </ScrollReveal>

          <div className="max-w-2xl space-y-8">
            <ScrollReveal duration={750} delay={0}>
              <div>
                <p className="font-inter text-sm font-bold uppercase tracking-[0.24em] text-orange-400">
                  Our Story
                </p>

                <h2 className="mt-4 font-playfair text-4xl font-bold leading-tight md:text-5xl">
                  <span className="text-white">A Proper </span>
                  <span className="italic text-orange-400">London Caff</span>
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal duration={750} delay={100}>
              <div className="space-y-4">
                <p className="font-inter text-base leading-7 text-gray-300">
                  Halfway Cafe has served Sidcup and the wider DA15 area for over
                  20 years, and we&apos;re still the spot many locals choose for
                  breakfast in Sidcup before work or on slower mornings. From full
                  English breakfast plates to fresh sandwiches and strong tea, this
                  is a Sidcup cafe built around proper portions and quick service.
                </p>
                <p className="font-inter text-base leading-7 text-gray-300">
                  We&apos;re a family-run{" "}
                  <Link href="/cafe-sidcup">cafe in Sidcup</Link>, so we keep things
                  straightforward: fresh ingredients, food cooked to order, and a
                  warm local service style that regulars know well. If you&apos;re after
                  a full English or a reliable{" "}
                  <Link href="/breakfast-sidcup">breakfast in Sidcup</Link>, you&apos;ll
                  find it here on Halfway Street.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal duration={750} delay={200}>
              <ul className="space-y-3">
                {bulletPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-2 block h-px w-8 shrink-0 bg-orange-400" />
                    <span className="font-inter text-sm leading-6 text-gray-300">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal duration={750} delay={300}>
              <div className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
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
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

