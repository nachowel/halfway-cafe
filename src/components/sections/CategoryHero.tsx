import ServerPublicImage from "@/components/ui/ServerPublicImage";

interface CategoryHeroProps {
  imageUrl?: string | null;
  label: string;
  title: string;
  subtitle: string;
  info: string;
}

export default function CategoryHero({
  imageUrl,
  label,
  title,
  subtitle,
  info,
}: CategoryHeroProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <section className="relative h-[380px] overflow-hidden rounded-2xl">
      <ServerPublicImage
        source={imageUrl}
        role="hero"
        alt={title}
        fill
        className="object-cover object-center"
        sizes="(max-width: 1279px) calc(100vw - 64px), 1216px"
        priority
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.5)_40%,rgba(0,0,0,0.82)_70%,rgba(0,0,0,0.95)_100%)]" />

      <div className="absolute inset-0 flex items-center justify-end px-6 pb-10 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p
            className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-white"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            {label}
          </p>
          <h1
            className="text-center font-playfair text-5xl font-bold text-white"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            {title}
          </h1>
          <p
            className="mt-3 text-center font-inter text-lg font-medium text-white drop-shadow-lg"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            {subtitle}
          </p>
          <p
            className="mt-3 text-sm font-semibold text-white"
            style={{
              textShadow:
                "0 2px 12px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)",
            }}
          >
            {info}
          </p>
        </div>
      </div>
    </section>
  );
}
