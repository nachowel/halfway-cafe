"use client";

import { useRef, useState } from "react";

import type {
  AdminImageIntent,
  AdminImagePickerItem,
  SafeAdminImage,
} from "@/types/admin-image";
import type { ResolvedPublicImage } from "@/types/public-image";

interface AdminImageFieldProps {
  id: string;
  label: string;
  current: SafeAdminImage;
  intent: AdminImageIntent;
  onChange(intent: AdminImageIntent): void;
  helper?: string;
  required?: boolean;
}

function DirectPreview({ image, alt }: { image: ResolvedPublicImage; alt: string }) {
  return (
    // Deliberately plain img: admin previews must bypass Vercel Image Optimization.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes="(max-width: 640px) 100vw, 560px"
      width={image.width}
      height={image.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
  );
}

export default function AdminImageField({
  id,
  label,
  current,
  intent,
  onChange,
  helper,
  required = false,
}: AdminImageFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [replacement, setReplacement] = useState<{
    preview: ResolvedPublicImage;
    label: string;
  } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [assets, setAssets] = useState<AdminImagePickerItem[]>([]);
  const [loadingPicker, setLoadingPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const visible = intent.kind === "remove"
    ? null
    : intent.kind === "replace"
      ? replacement?.preview ?? null
      : current.preview;
  const hasImage = intent.kind === "remove"
    ? false
    : intent.kind === "replace"
      ? true
      : current.hasImage;

  async function openPicker() {
    setPickerOpen(true);
    setError("");
    if (assets.length > 0) return;
    setLoadingPicker(true);
    try {
      const response = await fetch("/api/admin/images", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const body = await response.json() as { assets?: AdminImagePickerItem[]; error?: string };
      if (!response.ok || !body.assets) throw new Error(body.error ?? "Unable to load images");
      setAssets(body.assets);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load images");
    } finally {
      setLoadingPicker(false);
    }
  }

  function choose(asset: AdminImagePickerItem) {
    setReplacement({ preview: asset.preview, label: asset.label });
    onChange({ kind: "replace", reference: asset.reference });
    setPickerOpen(false);
  }

  async function upload(file: File) {
    setError("");
    if (file.size > 4_000_000) {
      setError("Images must be 4 MB or smaller.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    setUploading(true);
    try {
      const response = await fetch("/api/admin/images/upload", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": file.type,
          "X-File-Name": encodeURIComponent(file.name),
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: file,
      });
      const body = await response.json() as {
        asset?: { reference: string; preview?: ResolvedPublicImage };
        error?: string;
      };
      if (!response.ok || !body.asset) throw new Error(body.error ?? "Upload failed");
      const pickerResponse = await fetch("/api/admin/images", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const pickerBody = await pickerResponse.json() as { assets?: AdminImagePickerItem[] };
      const uploaded = pickerBody.assets?.find((asset) => asset.reference === body.asset?.reference);
      const preview = body.asset.preview ?? uploaded?.preview;
      if (!preview) throw new Error("Upload succeeded but its verified preview is unavailable");
      setReplacement({ preview, label: uploaded?.label ?? file.name });
      onChange({ kind: "replace", reference: body.asset.reference });
      if (pickerBody.assets) setAssets(pickerBody.assets);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          {label}{required ? " *" : ""}
        </label>
        {intent.kind !== "unchanged" && current.hasImage && (
          <button
            type="button"
            onClick={() => {
              setReplacement(null);
              onChange({ kind: "unchanged" });
            }}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
          >
            Keep existing
          </button>
        )}
      </div>

      {visible ? (
        <div className="mt-3 aspect-[16/9] max-h-72 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <DirectPreview image={visible} alt={`${label} preview`} />
        </div>
      ) : (
        <div className="mt-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white text-sm text-neutral-400">
          {hasImage ? "Preview unavailable" : "No image selected"}
        </div>
      )}

      <input
        ref={fileInput}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {uploading ? "Uploading…" : hasImage ? "Replace with Upload" : "Upload Image"}
        </button>
        <button
          type="button"
          onClick={() => void openPicker()}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-700"
        >
          Choose Existing Image
        </button>
        {hasImage && (
          <button
            type="button"
            onClick={() => {
              setReplacement(null);
              onChange({ kind: "remove" });
            }}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600"
          >
            Remove Image
          </button>
        )}
      </div>
      {replacement && intent.kind === "replace" && (
        <p className="mt-2 text-xs text-neutral-500">Selected: {replacement.label}</p>
      )}
      {helper && <p className="mt-2 text-xs text-neutral-400">{helper}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}

      {pickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Choose an existing image">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-playfair text-xl font-bold">Choose Existing Image</h2>
                <p className="text-xs text-neutral-500">Only verified Halfway Cafe assets are shown.</p>
              </div>
              <button type="button" onClick={() => setPickerOpen(false)} className="rounded-lg border px-3 py-2 text-sm">Close</button>
            </div>
            {loadingPicker ? (
              <p className="py-12 text-center text-sm text-neutral-500">Loading verified assets…</p>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {assets.map((asset) => (
                  <button
                    key={asset.reference}
                    type="button"
                    onClick={() => choose(asset)}
                    className="overflow-hidden rounded-lg border border-neutral-200 text-left hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <div className="aspect-square bg-neutral-100">
                      <DirectPreview image={asset.preview} alt="" />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-semibold text-neutral-800">{asset.label}</p>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">{asset.source}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
