/* AdminShell — wraps admin pages, hides sidebar on /admin/login */

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Login page: no sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-black/5 bg-[#f8f8f6]/95 px-4 backdrop-blur md:hidden">
        <div>
          <p className="font-playfair text-lg font-bold text-neutral-900">
            Halfway Cafe
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Admin
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-sm"
          aria-label="Open admin navigation"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
      </header>

      <main className="px-4 pb-6 pt-20 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
