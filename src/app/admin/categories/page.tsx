/* Admin — Categories management */
"use client";

import { useEffect, useState, useCallback } from "react";
import AdminImageField from "@/components/admin/AdminImageField";
import { deleteAdminCategory, listAdminCategories, saveAdminCategory } from "@/app/admin/actions";
import type { AdminCategoryRow } from "@/types/admin-data";
import type { AdminImageIntent, SafeAdminImage } from "@/types/admin-image";

const emptyImage: SafeAdminImage = { hasImage: false, label: "No image", provider: null, preview: null };

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function CategoryThumbnail({ image, alt, size = 64 }: { image: SafeAdminImage; alt: string; size?: number }) {
  if (!image.preview) {
    return <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image.preview.src} srcSet={image.preview.srcSet} alt={alt} sizes={`${size}px`} width={size} height={size} className="h-full w-full object-cover" />
  );
}

function ToggleSwitch({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New category form
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [newImageIntent, setNewImageIntent] = useState<AdminImageIntent>({ kind: "unchanged" });
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editImageIntent, setEditImageIntent] = useState<AdminImageIntent>({ kind: "unchanged" });

  const fetchCategories = useCallback(async () => {
    try {
      setCategories(await listAdminCategories());
    } catch (error: unknown) {
      setError(errorMessage(error, "Failed to load categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function toSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  async function handleAdd() {
    setError("");
    setSuccess("");
    if (!newName.trim()) return setError("Name is required.");

    setSaving(true);
    try {
      await saveAdminCategory({
        id: null,
        name: newName.trim(),
        slug: toSlug(newName),
        sort_order: newOrder,
        active: true,
        imageIntent: newImageIntent,
      });

      setNewName("");
      setNewOrder(0);
      setNewImageIntent({ kind: "unchanged" });
      setShowForm(false);
      setSuccess("Category added.");
      await fetchCategories();
    } catch (error: unknown) {
      setError(errorMessage(error, "Failed to add category."));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    const category = categories.find((row) => row.id === id);
    if (!category) return;
    setCategories((prev) => prev.map((row) => row.id === id ? { ...row, active: !current } : row));
    try {
      await saveAdminCategory({
        id,
        name: category.name,
        slug: category.slug,
        sort_order: category.sort_order,
        active: !current,
        imageIntent: { kind: "unchanged" },
      });
    } catch (error: unknown) {
      setCategories((prev) => prev.map((row) => row.id === id ? { ...row, active: current } : row));
      setError(errorMessage(error, "Failed to update."));
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSuccess("");

    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteAdminCategory(id);
      setSuccess("Category deleted.");
      await fetchCategories();
    } catch (error: unknown) {
      setError(errorMessage(error, "Failed to delete."));
    }
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return;
    setError("");
    setSuccess("");

    try {
      const category = categories.find((row) => row.id === editId);
      if (!category) throw new Error("Category no longer exists");
      await saveAdminCategory({
        id: editId,
        name: editName.trim(),
        slug: toSlug(editName),
        sort_order: editOrder,
        active: category.active,
        imageIntent: editImageIntent,
      });

      setEditId(null);
      setSuccess("Category updated.");
      await fetchCategories();
    } catch (error: unknown) {
      setError(errorMessage(error, "Failed to update."));
    }
  }

  function startEdit(cat: AdminCategoryRow) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditOrder(cat.sort_order);
    setEditImageIntent({ kind: "unchanged" });
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditOrder(0);
    setEditImageIntent({ kind: "unchanged" });
  }

  const inputClass =
    "rounded-xl border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-playfair text-2xl font-bold text-neutral-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage menu categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-dark"
        >
          {showForm ? "Cancel" : "+ Add Category"}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 border-t-4 border-t-accent bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-neutral-400">
            No categories found.
          </p>
        ) : (
          <>
            <div className="space-y-4 p-4 md:hidden">
              {categories.map((cat) =>
                editId === cat.id ? (
                  <article
                    key={cat.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                          <CategoryThumbnail image={cat.image} alt={`${editName || "Category"} preview`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-600">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={`${inputClass} w-full`}
                          />
                        </div>
                      </div>

                      <AdminImageField
                        id={`category-image-mobile-${cat.id}`}
                        label="Category image"
                        current={cat.image}
                        intent={editImageIntent}
                        onChange={setEditImageIntent}
                      />

                      <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 text-sm">
                        <span className="font-medium text-neutral-600">Slug:</span>
                        <span className="min-w-0 break-all text-neutral-500">
                          {toSlug(editName)}
                        </span>
                        <span className="font-medium text-neutral-600">Order:</span>
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(Number(e.target.value))}
                          className={`${inputClass} w-24`}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </article>
                ) : (
                  <article
                    key={cat.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      {cat.image.preview ? (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                          <CategoryThumbnail image={cat.image} alt={cat.name} />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-2xl">
                          🍽️
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900">{cat.name}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="grid grid-cols-[auto_1fr] gap-3">
                        <span className="font-medium text-neutral-600">Slug:</span>
                        <span className="min-w-0 truncate text-neutral-500" title={cat.slug}>
                          {cat.slug}
                        </span>
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-3">
                        <span className="font-medium text-neutral-600">Order:</span>
                        <span className="text-neutral-500">{cat.sort_order}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Active
                      </span>
                      <ToggleSwitch
                        checked={cat.active}
                        onClick={() => handleToggleActive(cat.id, cat.active)}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-accent hover:text-accent"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-red-300 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>

            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="w-16 px-4 py-3 text-center font-medium text-neutral-600">
                      Order
                    </th>
                    <th className="w-24 px-4 py-3 text-center font-medium text-neutral-600">
                      Image
                    </th>
                    <th className="px-4 py-3 font-medium text-neutral-600">Name</th>
                    <th className="px-4 py-3 font-medium text-neutral-600">Slug</th>
                    <th className="px-4 py-3 text-center font-medium text-neutral-600">
                      Active
                    </th>
                    <th className="px-4 py-3 font-medium text-neutral-600" />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-neutral-50 last:border-0"
                    >
                      {editId === cat.id ? (
                        <>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              value={editOrder}
                              onChange={(e) => setEditOrder(Number(e.target.value))}
                              className={`${inputClass} w-16 text-center`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="min-w-64">
                              <AdminImageField
                                id={`category-image-desktop-${cat.id}`}
                                label="Category image"
                                current={cat.image}
                                intent={editImageIntent}
                                onChange={setEditImageIntent}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className={`${inputClass} w-full`}
                            />
                          </td>
                          <td className="px-4 py-3 text-neutral-400">
                            {toSlug(editName)}
                          </td>
                          <td />
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="text-xs font-medium text-accent hover:underline"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-xs font-medium text-neutral-400 hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-center text-neutral-500">
                            {cat.sort_order}
                          </td>
                          <td className="px-4 py-3">
                            {cat.image.preview ? (
                              <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                <CategoryThumbnail image={cat.image} alt={cat.name} size={56} />
                              </div>
                            ) : (
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-lg">
                                🍽️
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-neutral-900">
                            {cat.name}
                          </td>
                          <td className="px-4 py-3 text-neutral-500">{cat.slug}</td>
                          <td className="px-4 py-3 text-center">
                            <ToggleSwitch
                              checked={cat.active}
                              onClick={() => handleToggleActive(cat.id, cat.active)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => startEdit(cat)}
                                className="text-xs font-medium text-accent hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cat.id)}
                                className="text-xs font-medium text-neutral-400 hover:text-accent hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add category inline form */}
        {showForm && (
          <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-600">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sides"
                  className={inputClass}
                />
                {newName && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Slug: {toSlug(newName)}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-600">
                  Order
                </label>
                <input
                  type="number"
                  value={newOrder}
                  onChange={(e) => setNewOrder(Number(e.target.value))}
                  className={`${inputClass} w-20`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <AdminImageField
                  id="new-category-image"
                  label="Category image"
                  current={emptyImage}
                  intent={newImageIntent}
                  onChange={setNewImageIntent}
                />
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
              >
                {saving && (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
