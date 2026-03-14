"use client";

import { useEffect, useState } from "react";
import MobileCategoryPage from "@/components/MobileCategoryPage";

export default function CategoryPageSwitcher({
  categorySlug,
  desktopCategory,
}: {
  categorySlug: string;
  desktopCategory: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    return null;
  }

  return isMobile ? <MobileCategoryPage categorySlug={categorySlug} /> : <>{desktopCategory}</>;
}
