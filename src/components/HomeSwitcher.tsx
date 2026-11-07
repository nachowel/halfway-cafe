"use client";

import type { ReactNode } from "react";
import MobileHome from "@/components/MobileHome";

export default function HomeSwitcher({
  desktopHome,
}: {
  desktopHome: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">{desktopHome}</div>
      <div className="block md:hidden"><MobileHome /></div>
    </>
  );
}
