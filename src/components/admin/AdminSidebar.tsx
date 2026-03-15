/* AdminSidebar — client component with navigation + sign out */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClientComponentClient } from "@/lib/supabase";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/menu", icon: "🍳", label: "Menu Items" },
  { href: "/admin/categories", icon: "🏷️", label: "Categories" },
  { href: "/admin/opening-hours", icon: "🕐", label: "Opening Hours" },
  { href: "/admin/gallery", icon: "🖼️", label: "Gallery" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClientComponentClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClientComponentClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const navigationContent = (
    <>
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-3 md:block">
          <div>
            <h1 className="font-playfair text-lg font-bold text-white">
              Halfway Cafe
            </h1>
            <span className="mt-0.5 inline-block rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              ADMIN
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-gray-300 md:hidden"
            aria-label="Close admin navigation"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm no-underline transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        {userEmail && (
          <p className="mb-3 truncate text-xs text-gray-400">
            {userEmail}
          </p>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="min-h-11 w-full rounded-lg border border-white/10 px-3 text-left text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#1a1a1a] md:flex">
        {navigationContent}
      </aside>

      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[min(82vw,320px)] flex-col bg-[#1a1a1a] shadow-2xl transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navigationContent}
      </aside>
    </>
  );
}
