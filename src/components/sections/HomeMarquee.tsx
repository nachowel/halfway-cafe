const marqueeText =
  "HALFWAY CAFE · SIDCUP DA15 · FULL ENGLISH · FRESH COFFEE · FAMILY RUN · NO BOOKING NEEDED";

export default function HomeMarquee() {
  return (
    <div className="overflow-hidden border-y border-rule bg-bg text-text">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {[0, 1].map((item) => (
          <p
            key={item}
            className="whitespace-nowrap px-6 py-3 font-mono text-[12px] font-medium uppercase leading-none tracking-[0.24em] text-text-mid"
          >
            {marqueeText}
            <span className="px-6" aria-hidden="true">
              ·
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}
