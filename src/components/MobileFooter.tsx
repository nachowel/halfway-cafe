import Link from "next/link";

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function MobileFooter() {
  return (
    <div className="bg-[#151515] px-4 py-4">
      {/* Page Links — horizontal row */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {pageLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-inter text-xs text-gray-400 no-underline transition-colors duration-200 hover:text-orange-400"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Copyright */}
      <p className="mt-2 text-center font-inter text-xs text-gray-600">
        © 2026 Halfway Cafe · Sidcup DA15
      </p>
    </div>
  );
}
