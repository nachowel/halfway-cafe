import Link from "next/link";
import { notFound } from "next/navigation";

import MenuItemForm from "@/components/admin/MenuItemForm";
import { getAdminMenuItem } from "@/app/admin/actions";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAdminMenuItem(id);
  if (!item) notFound();

  return (
    <div>
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 no-underline hover:text-orange-500"
      >
        <span aria-hidden="true">←</span>
        <span>Back to Menu Items</span>
      </Link>
      <h1 className="mt-3 font-playfair text-2xl font-bold text-neutral-900">Edit Item</h1>
      <div className="mt-6">
        <MenuItemForm
          itemId={item.id}
          currentImage={item.image}
          initial={{
            name: item.name,
            description: item.description ?? "",
            price: String(item.price),
            price_roll: item.price_roll === null ? "" : String(item.price_roll),
            price_sandwich: item.price_sandwich === null ? "" : String(item.price_sandwich),
            price_baguette: item.price_baguette === null ? "" : String(item.price_baguette),
            category: item.category,
            available: item.available,
            active: item.active,
            featured: item.featured,
            dietary: item.dietary,
          }}
        />
      </div>
    </div>
  );
}
