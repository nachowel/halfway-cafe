import type { Metadata } from "next";
import DesktopHome from "@/components/DesktopHome";
import HomeSwitcher from "@/components/HomeSwitcher";

export const metadata: Metadata = {
  title: "Halfway Cafe Sidcup | Full English Breakfast & British Caff",
  description:
    "Visit Halfway Cafe at 176 Halfway St, Sidcup DA15 8DJ. Family-run British caff serving full English breakfasts, burgers, sandwiches and proper tea. Popular with locals from Sidcup, Eltham, New Eltham, Bexley, Blackfen and Bexleyheath.",
};

export default function Home() {
  return <HomeSwitcher desktopHome={<DesktopHome />} />;
}
