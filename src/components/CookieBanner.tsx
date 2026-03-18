"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "halfway_cookie_consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg"
      style={{ borderTop: "2px solid #FF6B35" }}
    >
      <div className="px-6 py-4">
        <p className="font-inter text-sm text-[#1A1A1A]">
          We use cookies to understand how visitors use our site. This helps us improve your experience.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={accept}
            className="w-full rounded-lg bg-[#FF6B35] px-5 py-2 font-inter text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#E85E2E] sm:w-auto"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={decline}
            className="w-full rounded-lg border border-gray-300 px-5 py-2 font-inter text-sm font-semibold text-[#666666] transition-colors duration-200 hover:bg-gray-50 sm:w-auto"
          >
            Decline
          </button>
        </div>

        <p className="mt-2 font-inter text-xs text-[#666666]">
          You can change your preference at any time.
        </p>
      </div>
    </div>
  );
}
