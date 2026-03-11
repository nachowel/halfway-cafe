/* OpenStatus — Live open/closed indicator with animated dot */

"use client";

import { useState, useEffect } from "react";
import { isOpenNow } from "@/data/opening-hours";
import type { OpenStatus as OpenStatusType } from "@/types";

export default function OpenStatus() {
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

  return (
    <div className="inline-flex items-center gap-2">
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
      <span className="font-lora text-sm">
        {status.message}
      </span>
    </div>
  );
}
