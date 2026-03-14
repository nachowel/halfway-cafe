import type { Metadata } from "next";
import DesktopMenuPage from "@/components/DesktopMenuPage";
import MenuPageSwitcher from "@/components/MenuPageSwitcher";

export const metadata: Metadata = {
  title: "Menu | Halfway Cafe",
  description:
    "Browse the Halfway Cafe menu by category, from breakfast and sandwiches to burgers, panini, extras, and drinks.",
};

export default function MenuPage() {
  return <MenuPageSwitcher desktopMenu={<DesktopMenuPage />} />;
}
