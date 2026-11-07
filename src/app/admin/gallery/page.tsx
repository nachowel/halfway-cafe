/* Admin — Gallery management (CRUD for gallery_images table) */
"use client";

import { useEffect, useState, useCallback } from "react";
import AdminImageField from "@/components/admin/AdminImageField";
import { listAdminGallery, saveAdminGallery } from "@/app/admin/actions";
import type { AdminGalleryRow } from "@/types/admin-data";
import type { AdminImageIntent, SafeAdminImage } from "@/types/admin-image";

const emptyImage: SafeAdminImage = { hasImage: false, label: "No image", provider: null, preview: null };

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function GalleryPage() {
  const [images, setImages] = useState<AdminGalleryRow[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New image form
  const [newImageIntent, setNewImageIntent] = useState<AdminImageIntent>({ kind: "unchanged" });
  const [newAlt, setNewAlt] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      setImages(await listAdminGallery());
      setDeletedIds([]);
    } catch (error: unknown) {
      setError(errorMessage(error, "Failed to load gallery images."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  function updateRow(index: number, patch: Partial<AdminGalleryRow>) {
    setImages((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveAdminGallery(images, deletedIds);
      await fetchImages();
      setSuccess("Gallery saved successfully.");
    } catch (error: unknown) {
      setError(errorMessage(error, "Failed to save. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    if (newImageIntent.kind !== "replace") return setError("Choose or upload an image first.");

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const nextOrder = images.length > 0
        ? Math.max(...images.map((img) => img.sort_order)) + 1
        : 0;
      const row: AdminGalleryRow = {
        id: crypto.randomUUID(),
        persisted: false,
        alt_text: newAlt.trim(),
        active: true,
        sort_order: nextOrder,
        image: emptyImage,
        imageIntent: newImageIntent,
      };
      const next = [...images, row];
      await saveAdminGallery(next, deletedIds);
      await fetchImages();
      setNewImageIntent({ kind: "unchanged" });
      setNewAlt("");
      setSuccess("Image added successfully.");
    } catch (error: unknown) {
      setError(errorMessage(error, "Failed to add image."));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this image from the gallery when changes are saved?")) return;
    const row = images.find((image) => image.id === id);
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (row?.persisted) setDeletedIds((prev) => [...new Set([...prev, id])]);
    setSuccess("Image removal staged. Save all changes to apply it.");
  }

  const inputClass =
    "w-full rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500";

  return (
    <div>
      {/* Header */}
      <h1 className="font-playfair text-2xl font-bold text-neutral-900">
        Gallery
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage the images displayed in the gallery section.
      </p>

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

      {/* Add new image */}
      <div className="mt-6 rounded-sm border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-600">
          Add New Image
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <AdminImageField
            id="new-gallery-image"
            label="Image"
            current={emptyImage}
            intent={newImageIntent}
            onChange={setNewImageIntent}
            required
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-600">
              Alt Text
            </label>
            <input
              type="text"
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
              className={inputClass}
              placeholder="Description of the image"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="mt-4 flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {adding && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {adding ? "Adding…" : "Add Image"}
        </button>
      </div>

      {/* Existing images */}
      <div className="mt-6 rounded-sm border border-neutral-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : images.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-neutral-400">
            No gallery images found. Add one above.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {images.map((img, i) => (
              <div key={img.id} className="flex items-start gap-4 px-5 py-4">
                {/* Thumbnail */}
                <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50">
                  {img.image.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.image.preview.src} srcSet={img.image.preview.srcSet} alt={img.alt_text || "Gallery image"} sizes="120px" width={112} height={80} className="h-full w-full object-cover" />
                  ) : null}
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2">
                  <AdminImageField
                    id={`gallery-image-${img.id}`}
                    label="Image"
                    current={img.image}
                    intent={img.imageIntent}
                    onChange={(imageIntent) => updateRow(i, { imageIntent })}
                    required
                  />
                  <input
                    type="text"
                    value={img.alt_text}
                    onChange={(e) => updateRow(i, { alt_text: e.target.value })}
                    className={inputClass}
                    placeholder="Alt text"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input
                        type="checkbox"
                        checked={img.active}
                        onChange={(e) => updateRow(i, { active: e.target.checked })}
                        className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      Order:
                      <input
                        type="number"
                        value={img.sort_order}
                        onChange={(e) => updateRow(i, { sort_order: parseInt(e.target.value) || 0 })}
                        className="w-16 rounded-sm border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-red-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="flex-shrink-0 rounded-sm border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      {images.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-sm bg-red-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {saving && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? "Saving…" : "Save All Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
