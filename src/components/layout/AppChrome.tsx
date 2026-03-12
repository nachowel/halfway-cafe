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

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer openingHours={openingHours} />
      <StickyContactBar />
    </>
  );
}
