"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import StickyContactBar from "@/components/layout/StickyContactBar";
import type { OpeningHours } from "@/types";

export default function AppChrome({
  children,
  openingHours,
}: {
  children: React.ReactNode;
  openingHours: OpeningHours[];
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const showStickyContactBar =
    pathname !== "/" &&
    pathname !== "/menu" &&
    !pathname.startsWith("/menu/") &&
    pathname !== "/gallery" &&
    !pathname.startsWith("/gallery/") &&
    pathname !== "/contact" &&
    !pathname.startsWith("/contact/");

  if (isAdminRoute) {
    return <main className="overflow-x-hidden">{children}</main>;
  }

  return (
    <>
      <div className="hidden md:block">
        <Navbar />
      </div>
      <main className="overflow-x-hidden">{children}</main>
      <div className="hidden md:block">
        <Footer openingHours={openingHours} />
      </div>
      {showStickyContactBar ? <StickyContactBar /> : null}
    </>
  );
}
