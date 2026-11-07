/* MenuItemForm — shared form for creating & editing menu items */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AdminImageField from "@/components/admin/AdminImageField";
import {
  deleteAdminMenuItem,
  listAdminCategoryOptions,
  saveAdminMenuItem,
} from "@/app/admin/actions";
import type { AdminImageIntent, SafeAdminImage } from "@/types/admin-image";

interface FormData {
  name: string;
  description: string;
  price: string;
  price_roll: string;
  price_sandwich: string;
  price_baguette: string;
  category: string;
  available: string;
  active: boolean;
  featured: boolean;
  dietary: string[];
}

interface MenuItemFormProps {
  /** null → create mode, string → edit mode */
  itemId: string | null;
  initial?: Partial<FormData>;
  currentImage?: SafeAdminImage;
}

interface CategoryOption {
  value: string;
  label: string;
}

const fallbackCategories: CategoryOption[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "omelettes", label: "Omelettes" },
  { value: "pancakes-eggs", label: "Pancakes & Eggs" },
  { value: "lunch", label: "Lunch" },
  { value: "sandwiches", label: "Sandwiches" },
  { value: "burgers", label: "Burgers" },
  { value: "jacket-potatoes", label: "Jacket Potatoes" },
  { value: "panini", label: "Panini" },
  { value: "extras", label: "Sides & Extras" },
  { value: "desserts", label: "Desserts" },
  { value: "drinks", label: "Drinks" },
];

const availabilityOptions = [
  { value: "all-day", label: "All Day" },
  { value: "breakfast-only", label: "Breakfast Only" },
  { value: "lunch-only", label: "Lunch Only" },
];

const dietaryOptions = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
];

const defaultForm: FormData = {
  name: "",
  description: "",
  price: "",
  price_roll: "",
  price_sandwich: "",
  price_baguette: "",
  category: "breakfast",
  available: "all-day",
  active: true,
  featured: false,
  dietary: [],
};

const emptyImage: SafeAdminImage = { hasImage: false, label: "No image", provider: null, preview: null };

export default function MenuItemForm({ itemId, initial, currentImage = emptyImage }: MenuItemFormProps) {
  const router = useRouter();
  const isEdit = itemId !== null;

  const [form, setForm] = useState<FormData>({ ...defaultForm, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(fallbackCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imageIntent, setImageIntent] = useState<AdminImageIntent>({ kind: "unchanged" });

  // Fetch categories from Supabase
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await listAdminCategoryOptions();
        if (data.length > 0) setCategoryOptions(data);
      } catch {
        // Keep fallback categories
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  }

  function toggleDietary(tag: string) {
    setForm((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(tag)
        ? prev.dietary.filter((t) => t !== tag)
        : [...prev.dietary, tag],
    }));
  }

  function parseOptionalPrice(value: string) {
    if (!value.trim()) {
      return null;
    }

    const parsedValue = parseFloat(value);
    return Number.isNaN(parsedValue) ? null : parseFloat(parsedValue.toFixed(2));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.name.trim()) return setError("Name is required.");
    const parsedPrice = parseFloat(form.price);
    if (!form.price || isNaN(parsedPrice) || parsedPrice <= 0) return setError("Price must be a valid number greater than 0.");
    if (!form.category.trim()) return setError("Category is required.");
    if (!form.available.trim()) return setError("Availability is required.");

    setSaving(true);

    try {
      await saveAdminMenuItem({
        id: itemId,
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(parsedPrice.toFixed(2)),
        price_roll: parseOptionalPrice(form.price_roll),
        price_sandwich: parseOptionalPrice(form.price_sandwich),
        price_baguette: parseOptionalPrice(form.price_baguette),
        category: form.category.trim(),
        available: form.available.trim() || "all-day",
        active: Boolean(form.active),
        featured: Boolean(form.featured),
        dietary: Array.isArray(form.dietary) ? form.dietary : [],
        imageIntent,
      });

      if (isEdit) {
        setSuccess("Changes saved successfully.");
        router.push("/admin/menu");
        router.refresh();
      } else {
        router.push("/admin/menu");
        router.refresh();
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!window.confirm("Are you sure you want to delete this item? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteAdminMenuItem(itemId);
      router.push("/admin/menu");
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete.");
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent";
  const labelClass =
    "mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-600";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="space-y-5 rounded-xl border border-neutral-200 border-t-4 border-t-accent bg-white p-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className={labelClass}>Name *</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
            placeholder="e.g. The Full English"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Short description of the dish..."
          />
        </div>

        {/* Price + Category row */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={labelClass}>Price (£) *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className={inputClass}
              placeholder="9.50"
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>Category *</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              disabled={categoriesLoading}
              className={inputClass}
            >
              {categoriesLoading ? (
                <option>Loading…</option>
              ) : (
                categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="price_roll" className={labelClass}>Roll Price</label>
            <input
              id="price_roll"
              type="number"
              step="0.01"
              min="0"
              value={form.price_roll}
              onChange={(e) => set("price_roll", e.target.value)}
              className={inputClass}
              placeholder="2.20"
            />
          </div>
          <div>
            <label htmlFor="price_sandwich" className={labelClass}>Sandwich Price</label>
            <input
              id="price_sandwich"
              type="number"
              step="0.01"
              min="0"
              value={form.price_sandwich}
              onChange={(e) => set("price_sandwich", e.target.value)}
              className={inputClass}
              placeholder="3.00"
            />
          </div>
          <div>
            <label htmlFor="price_baguette" className={labelClass}>Baguette Price</label>
            <input
              id="price_baguette"
              type="number"
              step="0.01"
              min="0"
              value={form.price_baguette}
              onChange={(e) => set("price_baguette", e.target.value)}
              className={inputClass}
              placeholder="3.80"
            />
          </div>
        </div>

        <AdminImageField
          id="menu-item-image"
          label="Image"
          current={currentImage}
          intent={imageIntent}
          onChange={setImageIntent}
          helper="Upload a new verified image or choose one of the 101 migrated assets."
        />

        {/* Available */}
        <div>
          <label htmlFor="available" className={labelClass}>Available</label>
          <select
            id="available"
            value={form.available}
            onChange={(e) => set("available", e.target.value)}
            className={inputClass}
          >
            {availabilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Toggles row */}
        <div className="flex gap-8">
          <label className="flex items-center gap-2.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
               className="h-4 w-4 rounded border-neutral-300 text-accent focus:ring-accent"
            />
            Active
          </label>
          <label className="flex items-center gap-2.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
               className="h-4 w-4 rounded border-neutral-300 text-accent focus:ring-accent"
            />
            Featured
          </label>
        </div>

        {/* Dietary */}
        <div>
          <span className={labelClass}>Dietary Tags</span>
          <div className="mt-1 flex flex-wrap gap-3">
            {dietaryOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-neutral-700"
              >
                <input
                  type="checkbox"
                  checked={form.dietary.includes(opt.value)}
                  onChange={() => toggleDietary(opt.value)}
                  className="h-4 w-4 rounded border-neutral-300 text-accent focus:ring-accent"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {saving && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isEdit ? (saving ? "Saving…" : "Save Changes") : (saving ? "Creating…" : "Create Item")}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border border-red-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-accent transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete Item"}
          </button>
        )}
      </div>
    </form>
  );
}
