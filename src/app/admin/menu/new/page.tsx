/* Admin — Create New Menu Item */

import Link from "next/link";
import MenuItemForm from "@/components/admin/MenuItemForm";

export default function NewMenuItemPage() {
  return (
    <div>
      <Link href="/admin/menu" className="text-sm text-neutral-500 no-underline hover:text-red-600">
        ← Back to menu
      </Link>
      <h1 className="mt-3 font-playfair text-2xl font-bold text-neutral-900">
        Add New Item
      </h1>
      <div className="mt-6">
        <MenuItemForm itemId={null} />
      </div>
    </div>
  );
}
