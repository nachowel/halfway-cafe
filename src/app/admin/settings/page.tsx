/* Admin — Site Settings (key-value pairs from site_settings table) */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";

interface SettingRow {
  id: string;
  key: string;
  value: string;
}

const settingLabels: Record<string, string> = {
  cafe_name: "Cafe Name",
  tagline: "Tagline",
  phone: "Phone Number",
  email: "Email Address",
  address: "Address",
  instagram_url: "Instagram URL",
  facebook_url: "Facebook URL",
  google_maps_url: "Google Maps URL",
};

function labelFor(key: string) {
  return settingLabels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const supabase = createClientComponentClient();
      const { data, error: err } = await supabase
        .from("site_settings")
        .select("*")
        .order("key", { ascending: true });

      if (err) throw err;
      setSettings((data as SettingRow[]) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function updateValue(index: number, value: string) {
    setSettings((prev) =>
      prev.map((row, i) => (i === index ? { ...row, value } : row))
    );
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClientComponentClient();

      for (const row of settings) {
        const { error: err } = await supabase
          .from("site_settings")
          .update({ value: row.value })
          .eq("id", row.id);

        if (err) throw err;
      }

      setSuccess("Settings saved successfully.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-sm border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500";

  return (
    <div>
      {/* Header */}
      <h1 className="font-playfair text-2xl font-bold text-neutral-900">
        Site Settings
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage general information displayed across the website.
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

      {/* Settings form */}
      <div className="mt-6 rounded-sm border border-neutral-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : settings.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-neutral-400">
            No settings found. Add rows to the site_settings table in Supabase.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {settings.map((row, i) => (
              <div key={row.id} className="px-5 py-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-600">
                  {labelFor(row.key)}
                </label>
                {row.value && row.value.length > 100 ? (
                  <textarea
                    value={row.value}
                    onChange={(e) => updateValue(i, e.target.value)}
                    rows={3}
                    className={inputClass}
                  />
                ) : (
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateValue(i, e.target.value)}
                    className={inputClass}
                  />
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  Key: {row.key}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      {settings.length > 0 && (
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
