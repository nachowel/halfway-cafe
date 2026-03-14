import { MapPin, Phone } from "lucide-react";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";

const cafePhoneNumber = "+442033435303";

export default function ContactActionBar({
  sticky = false,
  className = "",
}: {
  sticky?: boolean;
  className?: string;
}) {
  const wrapperClassName = sticky
    ? "fixed inset-x-0 bottom-0 z-50 px-4 pb-4 lg:hidden"
    : className;

  const wrapperStyle = sticky
    ? { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }
    : undefined;

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <div className="mx-auto flex max-w-md overflow-hidden rounded-[14px] border border-black/10 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
        <a
          href={`tel:${cafePhoneNumber}`}
          className="flex h-14 flex-1 items-center justify-center gap-2 bg-[#1b1815] px-4 font-inter text-[13px] font-semibold tracking-[0.02em] text-white no-underline transition-colors duration-200 hover:bg-[#2a2521]"
        >
          <Phone className="h-[14px] w-[14px] shrink-0" strokeWidth={2.2} />
          <span>Call Us</span>
        </a>

        <a
          href={HALFWAY_CAFE_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 flex-1 items-center justify-center gap-2 bg-[#d77a37] px-4 font-inter text-[13px] font-semibold tracking-[0.02em] text-white no-underline transition-colors duration-200 hover:bg-[#c86821]"
        >
          <MapPin className="h-[14px] w-[14px] shrink-0" strokeWidth={2.2} />
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
}
