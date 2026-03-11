/* MenuItemForm — shared form for creating & editing menu items */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  available: string;
  active: boolean;
  featured: boolean;
  dietary: string[];
}

interface MenuItemFormProps {
  /** null → create mode, string → edit mode */
  itemId: string | null;
  initial?: Partial<FormData>;
}

interface CategoryOption {
  value: string;
  label: string;
}

const fallbackCategories: CategoryOption[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "burgers", label: "Burgers" },
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
  category: "breakfast",
  image_url: "",
  available: "all-day",
  active: true,
  featured: false,
  dietary: [],
};

export default function MenuItemForm({ itemId, initial }: MenuItemFormProps) {
  const router = useRouter();
  const isEdit = itemId !== null;

  const [form, setForm] = useState<FormData>({ ...defaultForm, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(fallbackCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from Supabase
  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClientComponentClient();
        const { data, error: err } = await supabase
          .from("categories")
          .select("name, slug")
          .eq("active", true)
          .order("sort_order", { ascending: true });

        if (err) throw err;
        if (data && data.length > 0) {
          setCategoryOptions(
            data.map((c) => ({ value: c.slug, label: c.name }))
          );
        }
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
      const supabase = createClientComponentClient();
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(parsedPrice.toFixed(2)),
        category: form.category.trim(),
        image_url: form.image_url.trim() || null,
        available: form.available.trim() || "all-day",
        active: Boolean(form.active),
        featured: Boolean(form.featured),
        dietary: Array.isArray(form.dietary) ? form.dietary : [],
      };

      // DEBUG: log payload to diagnose 400 errors — remove after fix confirmed
      console.log("[MenuItemForm] payload:", JSON.stringify(payload, null, 2));

      if (isEdit) {
        const { error: err } = await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", itemId);
        if (err) {
          console.error("[MenuItemForm] update error:", err);
          throw err;
        }
        setSuccess("Changes saved successfully.");
      } else {
        const { error: err } = await supabase
          .from("menu_items")
          .insert(payload);
        if (err) {
          console.error("[MenuItemForm] insert error:", err);
          throw err;
        }
        router.push("/admin/menu");
      }
    } catch (e: any) {
      console.error("[MenuItemForm] caught error:", e);
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
      const supabase = createClientComponentClient();
      const { error: err } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);
      if (err) throw err;
      router.push("/admin/menu");
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete.");
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500";
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

      <div className="space-y-5 rounded-sm border border-neutral-200 bg-white p-6">
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

        {/* Image URL + preview */}
        <div>
          <label htmlFor="image_url" className={labelClass}>Image URL</label>
          <input
            id="image_url"
            type="text"
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            className={inputClass}
            placeholder="https://images.unsplash.com/..."
          />
          {form.image_url && (
            <div className="mt-3 relative h-40 w-full overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50">
              <Image
                src={form.image_url}
                alt="Preview"
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
          )}
        </div>

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
              className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            Active
          </label>
          <label className="flex items-center gap-2.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
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
                  className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500"
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
          className="flex items-center gap-2 rounded-sm bg-red-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
            className="rounded-sm border border-red-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete Item"}
          </button>
        )}
      </div>
    </form>
  );
}
