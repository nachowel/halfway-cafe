export default function CategoryPageSwitcher({
  desktopCategory,
  mobileCategory,
}: {
  desktopCategory: React.ReactNode;
  mobileCategory: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">{desktopCategory}</div>
      <div className="md:hidden">{mobileCategory}</div>
    </>
  );
}
