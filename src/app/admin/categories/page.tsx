/* Admin — Categories management */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New category form
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);

  const supabase = createClientComponentClient();

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (err) throw err;
      setCategories((data as Category[]) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

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
      const { error: err } = await supabase.from("categories").insert({
        name: newName.trim(),
        slug: toSlug(newName),
        sort_order: newOrder,
      });
      if (err) throw err;

      setNewName("");
      setNewOrder(0);
      setShowForm(false);
      setSuccess("Category added.");
      await fetchCategories();
    } catch (e: any) {
      setError(e?.message ?? "Failed to add category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      const { error: err } = await supabase
        .from("categories")
        .update({ active: !current })
        .eq("id", id);
      if (err) throw err;

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !current } : c))
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to update.");
    }
  }

  async function handleDelete(id: string, slug: string) {
    setError("");
    setSuccess("");

    // Check if category is in use
    try {
      const { count, error: countErr } = await supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("category", slug);

      if (countErr) throw countErr;

      if (count && count > 0) {
        setError(
          `Cannot delete — ${count} menu item(s) use this category. Reassign them first.`
        );
        return;
      }

      if (!window.confirm("Delete this category?")) return;

      const { error: delErr } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (delErr) throw delErr;

      setSuccess("Category deleted.");
      await fetchCategories();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete.");
    }
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return;
    setError("");
    setSuccess("");

    try {
      const { error: err } = await supabase
        .from("categories")
        .update({
          name: editName.trim(),
          slug: toSlug(editName),
          sort_order: editOrder,
        })
        .eq("id", editId);
      if (err) throw err;

      setEditId(null);
      setSuccess("Category updated.");
      await fetchCategories();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update.");
    }
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditOrder(cat.sort_order);
  }

  const inputClass =
    "rounded-sm border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
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
          className="rounded-sm bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700"
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

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-sm border border-neutral-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-neutral-400">
            No categories found.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="w-16 px-4 py-3 text-center font-medium text-neutral-600">
                  Order
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
                    /* ── Edit row ── */
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
                            className="text-xs font-medium text-green-600 hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditId(null)}
                            className="text-xs font-medium text-neutral-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    /* ── Display row ── */
                    <>
                      <td className="px-4 py-3 text-center text-neutral-500">
                        {cat.sort_order}
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{cat.slug}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat.id, cat.active)}
                          className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            cat.active ? "bg-green-500" : "bg-neutral-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              cat.active ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.slug)}
                            className="text-xs font-medium text-neutral-400 hover:text-red-600 hover:underline"
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
        )}

        {/* Add category inline form */}
        {showForm && (
          <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-4">
            <div className="flex items-end gap-4">
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
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 rounded-sm bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
