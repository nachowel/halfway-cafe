/* Admin — Edit Menu Item */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { createClientComponentClient } from "@/lib/supabase";

export default function EditMenuItemPage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        setInitial({
          name: data.name ?? "",
          description: data.description ?? "",
          price: String(data.price ?? ""),
          price_roll: String(data.price_roll ?? ""),
          price_sandwich: String(data.price_sandwich ?? ""),
          price_baguette: String(data.price_baguette ?? ""),
          category: data.category ?? "breakfast",
          image_url: data.image_url ?? "",
          available: data.available ?? "all-day",
          active: data.active ?? true,
          featured: data.featured ?? false,
          dietary: data.dietary ?? [],
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg text-neutral-500">Item not found.</p>
        <Link href="/admin/menu" className="mt-4 inline-block text-sm text-red-600 no-underline hover:underline">
          ← Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/menu" className="text-sm text-neutral-500 no-underline hover:text-red-600">
        ← Back to menu
      </Link>
      <h1 className="mt-3 font-playfair text-2xl font-bold text-neutral-900">
        Edit Item
      </h1>
      <div className="mt-6">
        <MenuItemForm itemId={id} initial={initial ?? undefined} />
      </div>
    </div>
  );
}
