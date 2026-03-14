"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, MapPin, UtensilsCrossed } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/menu",
    label: "Menu",
    icon: UtensilsCrossed,
    isActive: (pathname: string) => pathname === "/menu" || pathname.startsWith("/menu/"),
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: Images,
    isActive: (pathname: string) => pathname === "/gallery" || pathname.startsWith("/gallery/"),
  },
  {
    href: "/contact",
    label: "Visit Us",
    icon: MapPin,
    isActive: (pathname: string) => pathname === "/contact" || pathname.startsWith("/contact/"),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E8E2D9] bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid h-[58px] grid-cols-4">
        {navItems.map((item) => {
          const isActive = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 no-underline"
            >
              <Icon
                size={22}
                strokeWidth={1.5}
                style={{ color: isActive ? "#FF6B35" : "#B0A898" }}
              />
              <span
                className="font-inter text-[10px] font-medium"
                style={{ color: isActive ? "#FF6B35" : "#B0A898", opacity: isActive ? 1 : 0.6 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
