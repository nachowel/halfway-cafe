import type { Metadata } from "next";
import DesktopMenuPage from "@/components/DesktopMenuPage";
import MenuPageSwitcher from "@/components/MenuPageSwitcher";
import MobileMenuPageServer from "@/components/MobileMenuPageServer";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Browse the full Halfway Cafe menu — breakfasts, sandwiches, burgers, panini, extras and drinks. Fresh food served daily in Sidcup DA15.",
  alternates: {
    canonical: "/menu",
  },
};

export default function MenuPage() {
  return <MenuPageSwitcher desktopMenu={<DesktopMenuPage />} mobileMenu={<MobileMenuPageServer />} />;
}
