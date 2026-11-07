/* Admin — Site Settings grouped by section */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminImageField from "@/components/admin/AdminImageField";
import { getAdminSettings, saveAdminSettings } from "@/app/admin/actions";
import type { AdminImageIntent, SafeAdminImage } from "@/types/admin-image";

type GroupKey = "hero" | "social" | "delivery";

type SettingValues = Record<string, string>;

type GroupMessage = {
  type: "success" | "error";
  text: string;
} | null;

const heroFields = [
  {
    key: "hero_image_web",
    label: "Desktop Hero Image",
    helper: "Recommended size: 1920×1080px",
  },
  {
    key: "hero_image_mobile",
    label: "Mobile Hero Image",
    helper: "Recommended size: 800×600px. Falls back to desktop image if empty.",
  },
];

const socialFields = [
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_tiktok", label: "TikTok URL" },
];

const deliveryPlatforms = [
  {
    name: "Uber Eats",
    logoKey: "delivery_ubereats_logo",
    linkKey: "delivery_ubereats",
  },
  {
    name: "Just Eat",
    logoKey: "delivery_justeat_logo",
    linkKey: "delivery_justeat",
  },
  {
    name: "Deliveroo",
    logoKey: "delivery_deliveroo_logo",
    linkKey: "delivery_deliveroo",
  },
];

const allSettingKeys = [
  ...heroFields.map((field) => field.key),
  ...socialFields.map((field) => field.key),
  ...deliveryPlatforms.flatMap((platform) => [platform.logoKey, platform.linkKey]),
];

const defaultValues: SettingValues = Object.fromEntries(
  allSettingKeys.map((key) => [key, ""])
);
const emptyImage: SafeAdminImage = { hasImage: false, label: "No image", provider: null, preview: null };

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";

const cardClass = "mb-6 rounded-xl bg-white p-6 shadow-sm";

export default function SettingsPage() {
  const [values, setValues] = useState<SettingValues>(defaultValues);
  const [images, setImages] = useState<Record<string, SafeAdminImage>>({});
  const [imageIntents, setImageIntents] = useState<Record<string, AdminImageIntent>>({});
  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState<GroupKey | null>(null);
  const [messages, setMessages] = useState<Record<GroupKey, GroupMessage>>({
    hero: null,
    social: null,
    delivery: null,
  });
  const timeoutRefs = useRef<Record<GroupKey, ReturnType<typeof setTimeout> | null>>({
    hero: null,
    social: null,
    delivery: null,
  });

  const setGroupMessage = useCallback((group: GroupKey, message: GroupMessage) => {
    setMessages((prev) => ({ ...prev, [group]: message }));

    if (timeoutRefs.current[group]) {
      clearTimeout(timeoutRefs.current[group]!);
      timeoutRefs.current[group] = null;
    }

    if (message?.type === "success") {
      timeoutRefs.current[group] = setTimeout(() => {
        setMessages((prev) => ({ ...prev, [group]: null }));
        timeoutRefs.current[group] = null;
      }, 3000);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getAdminSettings();
      setValues({ ...defaultValues, ...data.values });
      setImages(data.images);
      setImageIntents({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings().catch((error: { message?: string }) => {
      setGroupMessage("hero", {
        type: "error",
        text: error?.message ?? "Failed to load settings.",
      });
      setGroupMessage("social", {
        type: "error",
        text: error?.message ?? "Failed to load settings.",
      });
      setGroupMessage("delivery", {
        type: "error",
        text: error?.message ?? "Failed to load settings.",
      });
    });
  }, [fetchSettings, setGroupMessage]);

  useEffect(() => {
    const timeoutMap = timeoutRefs.current;

    return () => {
      for (const group of Object.keys(timeoutMap) as GroupKey[]) {
        if (timeoutMap[group]) {
          clearTimeout(timeoutMap[group]!);
        }
      }
    };
  }, []);

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateImageIntent(key: string, intent: AdminImageIntent) {
    setImageIntents((prev) => ({ ...prev, [key]: intent }));
  }

  async function saveGroup(group: GroupKey, valueKeys: string[], imageKeys: string[], successText: string) {
    setSavingGroup(group);
    setGroupMessage(group, null);

    try {
      await saveAdminSettings(
        Object.fromEntries(valueKeys.map((key) => [key, values[key]?.trim() ?? ""])),
        Object.fromEntries(imageKeys.map((key) => [key, imageIntents[key] ?? { kind: "unchanged" }])),
      );
      await fetchSettings();

      setGroupMessage(group, {
        type: "success",
        text: successText,
      });
    } catch (error) {
      setGroupMessage(group, {
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to save. Please try again.",
      });
    } finally {
      setSavingGroup(null);
    }
  }

  function Message({ group }: { group: GroupKey }) {
    const message = messages[group];

    if (!message) {
      return null;
    }

    return (
      <p
        className={`mt-4 text-sm ${
          message.type === "success" ? "text-green-600" : "text-red-600"
        }`}
      >
        {message.type === "success" ? `${message.text} ✓` : message.text}
      </p>
    );
  }

  return (
    <div className="bg-white">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl font-bold text-neutral-900">
          Site Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your cafe&apos;s public information
        </p>
      </div>

      {loading ? (
        <div className={`${cardClass} flex items-center justify-center py-16`}>
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF6B35] border-t-transparent" />
        </div>
      ) : (
        <>
          <section className={cardClass}>
            <h2 className="font-playfair text-xl font-bold text-neutral-900">
              Hero Images
            </h2>

            <div className="mt-5 space-y-5">
              {heroFields.map((field) => (
                <AdminImageField
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  helper={field.helper}
                  current={images[field.key] ?? emptyImage}
                  intent={imageIntents[field.key] ?? { kind: "unchanged" }}
                  onChange={(intent) => updateImageIntent(field.key, intent)}
                />
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  saveGroup(
                    "hero",
                    [],
                    heroFields.map((field) => field.key),
                    "Saved successfully"
                  )
                }
                disabled={savingGroup === "hero"}
                className="rounded-lg bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E85E2E] disabled:opacity-60"
              >
                {savingGroup === "hero" ? "Saving..." : "Save Hero Images"}
              </button>
              <Message group="hero" />
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="font-playfair text-xl font-bold text-neutral-900">
              Social Media
            </h2>

            <div className="mt-5 space-y-5">
              {socialFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={values[field.key]}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  saveGroup(
                    "social",
                    socialFields.map((field) => field.key),
                    [],
                    "Saved successfully"
                  )
                }
                disabled={savingGroup === "social"}
                className="rounded-lg bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E85E2E] disabled:opacity-60"
              >
                {savingGroup === "social" ? "Saving..." : "Save Social Links"}
              </button>
              <Message group="social" />
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="font-playfair text-xl font-bold text-neutral-900">
              Delivery Platforms
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Choose an existing verified asset or upload a new logo.
            </p>

            <div className="mt-5 space-y-5">
              {deliveryPlatforms.map((platform) => (
                <div key={platform.name} className="rounded-lg border border-gray-100 p-4">
                  <p className="text-sm font-semibold text-gray-700">{platform.name}</p>

                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <AdminImageField
                        id={platform.logoKey}
                        label="Logo"
                        current={images[platform.logoKey] ?? emptyImage}
                        intent={imageIntents[platform.logoKey] ?? { kind: "unchanged" }}
                        onChange={(intent) => updateImageIntent(platform.logoKey, intent)}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Order Link
                      </label>
                      <input
                        type="text"
                        value={values[platform.linkKey]}
                        onChange={(e) => updateValue(platform.linkKey, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  saveGroup(
                    "delivery",
                    deliveryPlatforms.map((platform) => platform.linkKey),
                    deliveryPlatforms.map((platform) => platform.logoKey),
                    "Saved successfully"
                  )
                }
                disabled={savingGroup === "delivery"}
                className="rounded-lg bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E85E2E] disabled:opacity-60"
              >
                {savingGroup === "delivery" ? "Saving..." : "Save Delivery Settings"}
              </button>
              <Message group="delivery" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
