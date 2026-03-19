import type { Metadata } from "next";
import DesktopHome from "@/components/DesktopHome";
import HomeSwitcher from "@/components/HomeSwitcher";

export const metadata: Metadata = {
  title: "Best Breakfast in Sidcup | Full English & Cafe – Halfway Cafe",
  description:
    "Looking for the best breakfast in Sidcup? Enjoy full English breakfast, fresh sandwiches and quality coffee at Halfway Cafe. Family-run, quick service, no booking needed.",
};

export default function Home() {
  return <HomeSwitcher desktopHome={<DesktopHome />} />;
}
