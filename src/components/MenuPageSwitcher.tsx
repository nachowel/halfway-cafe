export default function MenuPageSwitcher({
  desktopMenu,
  mobileMenu,
}: {
  desktopMenu: React.ReactNode;
  mobileMenu: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">{desktopMenu}</div>
      <div className="md:hidden">{mobileMenu}</div>
    </>
  );
}
