/* Admin — Opening Hours management */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@/lib/supabase";

interface HourRow {
  id: string;
  day_name: string;
  day_order: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export default function OpeningHoursPage() {
  const [hours, setHours] = useState<HourRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHours = useCallback(async () => {
    try {
      const supabase = createClientComponentClient();
      const { data, error: err } = await supabase
        .from("opening_hours")
        .select("*")
        .order("day_order", { ascending: true });

      if (err) throw err;
      setHours((data as HourRow[]) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load opening hours.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  function updateRow(index: number, field: keyof HourRow, value: string | boolean) {
    setHours((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
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

      // Update each row individually
      for (const row of hours) {
        const { error: err } = await supabase
          .from("opening_hours")
          .update({
            open_time: row.open_time,
            close_time: row.close_time,
            is_closed: row.is_closed,
          })
          .eq("id", row.id);

        if (err) throw err;
      }

      setSuccess("Opening hours saved successfully.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <h1 className="font-playfair text-2xl font-bold text-neutral-900">
        Opening Hours
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Set the opening and closing times for each day of the week.
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

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-sm border border-neutral-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : hours.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-neutral-400">
            No opening hours found. Run the seed SQL in Supabase.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-5 py-3 font-medium text-neutral-600">Day</th>
                <th className="px-5 py-3 font-medium text-neutral-600">Open</th>
                <th className="px-5 py-3 font-medium text-neutral-600">Close</th>
                <th className="px-5 py-3 text-center font-medium text-neutral-600">Closed</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-neutral-50 last:border-0"
                >
                  {/* Day name */}
                  <td className="px-5 py-3 font-medium text-neutral-900">
                    {row.day_name}
                  </td>

                  {/* Open time */}
                  <td className="px-5 py-3">
                    <input
                      type="time"
                      value={row.open_time}
                      onChange={(e) => updateRow(i, "open_time", e.target.value)}
                      disabled={row.is_closed}
                      className="rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none transition-colors focus:border-red-500 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                    />
                  </td>

                  {/* Close time */}
                  <td className="px-5 py-3">
                    <input
                      type="time"
                      value={row.close_time}
                      onChange={(e) => updateRow(i, "close_time", e.target.value)}
                      disabled={row.is_closed}
                      className="rounded-sm border border-neutral-300 px-2 py-1.5 text-sm outline-none transition-colors focus:border-red-500 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                    />
                  </td>

                  {/* Closed toggle */}
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => updateRow(i, "is_closed", !row.is_closed)}
                      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        row.is_closed ? "bg-red-500" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          row.is_closed ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Save button */}
      {hours.length > 0 && (
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
