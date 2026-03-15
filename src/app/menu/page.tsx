import type { Metadata } from "next";
import DesktopMenuPage from "@/components/DesktopMenuPage";
import MenuPageSwitcher from "@/components/MenuPageSwitcher";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Browse the full Halfway Cafe menu — breakfasts, sandwiches, burgers, panini, extras and drinks. Fresh food served daily in Sidcup DA15.",
};

export default function MenuPage() {
  return <MenuPageSwitcher desktopMenu={<DesktopMenuPage />} />;
}
