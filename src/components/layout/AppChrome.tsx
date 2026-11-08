"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import StickyContactBar from "@/components/layout/StickyContactBar";
import type { ResolvedPublicImage } from "@/types/public-image";

export default function AppChrome({
  children,
  desktopFooter,
  logoImage,
}: {
  children: React.ReactNode;
  desktopFooter: React.ReactNode;
  logoImage: ResolvedPublicImage;
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
        <Navbar logoImage={logoImage} />
      </div>
      <main className="overflow-x-hidden">{children}</main>
      <div className="hidden md:block">{desktopFooter}</div>
      {showStickyContactBar ? <StickyContactBar /> : null}
    </>
  );
}
