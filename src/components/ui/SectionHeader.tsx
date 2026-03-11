/* SectionHeader — Reusable section heading with kicker, title & subtitle */

interface SectionHeaderProps {
  kicker: string;
  title: string;
  titleItalic?: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({
  kicker,
  title,
  titleItalic,
  subtitle,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {/* Kicker */}
      <span className="font-baskerville text-sm uppercase tracking-widest text-red">
        {kicker}
      </span>

      {/* Gold diamond divider */}
      <div className={`my-3 flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <span className="block h-px w-8 bg-gold" />
        <span className="text-gold text-sm">◆</span>
        <span className="block h-px w-8 bg-gold" />
      </div>

      {/* Title */}
      <h2 className="font-playfair text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
        {title}
        {titleItalic && (
          <>
            {" "}
            <span className="italic">{titleItalic}</span>
          </>
        )}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-4 font-lora text-base italic text-ink-light md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
