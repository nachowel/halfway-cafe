import DesktopHome from "@/components/DesktopHome";
import HomeSwitcher from "@/components/HomeSwitcher";

export default function Home() {
  return <HomeSwitcher desktopHome={<DesktopHome />} />;
}
