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
      <span className="font-inter text-sm font-bold uppercase tracking-[0.2em] text-accent">
        {kicker}
      </span>

      {/* Accent divider */}
      <div className={`my-3 flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <span className="block h-px w-8 bg-yellow" />
        <span className="text-sm text-yellow">◆</span>
        <span className="block h-px w-8 bg-yellow" />
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
        <p className="mt-4 font-inter text-base text-text-mid md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
