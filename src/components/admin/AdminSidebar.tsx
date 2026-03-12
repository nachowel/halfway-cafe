/* AdminSidebar — client component with navigation + sign out */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/menu", icon: "🍳", label: "Menu Items" },
  { href: "/admin/categories", icon: "🏷️", label: "Categories" },
  { href: "/admin/opening-hours", icon: "🕐", label: "Opening Hours" },
  { href: "/admin/gallery", icon: "🖼️", label: "Gallery" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

export default function AdminSidebar() {
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

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#1a1a1a]">
      {/* Logo area */}
      <div className="border-b border-white/10 px-6 py-5">
        <h1 className="font-playfair text-lg font-bold text-white">
          Halfway Cafe
        </h1>
        <span className="mt-0.5 inline-block rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          ADMIN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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

      {/* User section */}
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
          className="w-full text-left text-xs text-gray-400 transition-colors hover:text-red-400 disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
