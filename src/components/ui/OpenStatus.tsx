/* OpenStatus — Live open/closed indicator with animated dot */

"use client";

import { useState, useEffect } from "react";
import { isOpenNow } from "@/data/opening-hours";
import type { OpenStatus as OpenStatusType } from "@/types";

interface OpenStatusProps {
  variant?: "default" | "hero";
  className?: string;
}

export default function OpenStatus({
  variant = "default",
  className = "",
}: OpenStatusProps) {
  const [status, setStatus] = useState<OpenStatusType | null>(null);

  useEffect(() => {
    // Initial check
    setStatus(isOpenNow());

    // Re-check every minute
    const interval = setInterval(() => {
      setStatus(isOpenNow());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Avoid hydration mismatch — render nothing on server
  if (!status) return null;

  if (variant === "hero") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <span className="rounded-full bg-accent px-4 py-2 font-inter text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-sm">
          {status.isOpen ? "OPEN TODAY" : "CLOSED"}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Animated dot */}
      <span className="relative flex h-2.5 w-2.5">
        {status.isOpen && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            status.isOpen ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </span>

      {/* Status text */}
      <span className="font-inter text-sm text-text">
        {status.message}
      </span>
    </div>
  );
}
