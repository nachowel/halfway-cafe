"use client";

import { useEffect, useState } from "react";
export default function MenuPageSwitcher({
  desktopMenu,
  mobileMenu,
}: {
  desktopMenu: React.ReactNode;
  mobileMenu: React.ReactNode;
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

  return isMobile ? <>{mobileMenu}</> : <>{desktopMenu}</>;
}
