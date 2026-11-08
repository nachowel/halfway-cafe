"use client";

import type { ReactNode } from "react";

export default function HomeSwitcher({
  desktopHome,
  mobileHome,
}: {
  desktopHome: ReactNode;
  mobileHome: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">{desktopHome}</div>
      <div className="block md:hidden">{mobileHome}</div>
    </>
  );
}
