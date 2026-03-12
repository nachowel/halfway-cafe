/* StickyContactBar — Mobile-only fixed bottom bar with Call & Directions */

"use client";

export default function StickyContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border lg:hidden">
      <div
        className="flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Call button */}
        <a
          href="tel:+441234567890"
          className="flex flex-1 items-center justify-center gap-2 bg-text py-3 font-inter text-xs font-bold uppercase tracking-[0.15em] text-white no-underline transition-colors duration-200 hover:bg-text-mid"
        >
          <span>📞</span>
          <span>Call Us</span>
        </a>

        {/* Directions button */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=123+High+Street+London+EC1A+1BB"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 bg-accent py-3 font-inter text-xs font-bold uppercase tracking-[0.15em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
        >
          <span>📍</span>
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
}
