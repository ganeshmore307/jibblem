"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrgSettings } from "@/lib/types";
import { FieldError, btnPrimary, inputCls } from "@/components/ui";

const PERMISSIONS: { action: string; owner: string; admin: string; manager: string; member: string }[] = [
  { action: "Track time & breaks", owner: "Yes", admin: "Yes", manager: "Yes", member: "Yes" },
  { action: "View own timesheets", owner: "Yes", admin: "Yes", manager: "Yes", member: "Yes" },
  { action: "View team timesheets", owner: "Yes", admin: "Yes", manager: "Own group", member: "No" },
  { action: "Edit time entries", owner: "Yes", admin: "Yes", manager: "Own group", member: "Own (if allowed)" },
  { action: "Approve time off", owner: "Yes", admin: "Yes", manager: "Own group", member: "No" },
  { action: "Manage members", owner: "Yes", admin: "Yes", manager: "No", member: "No" },
  { action: "Manage policies & settings", owner: "Yes", admin: "Yes", manager: "No", member: "No" },
  { action: "Manage billing", owner: "Yes", admin: "No", manager: "No", member: "No" },
];

export default function OrgSettingsView({ org }: { org: OrgSettings }) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "permissions">("profile");
  const [form, setForm] = useState(org);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/org", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Something went wrong." }));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <div className="flex rounded-lg border border-line overflow-hidden w-fit mb-4">
        {(["profile", "permissions"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-bold capitalize ${t === tab ? "bg-brand text-white" : "bg-white text-ink/70 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <div className="bg-white rounded-xl shadow-card p-5">
          <FieldError error={error} />
          {saved && <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 mb-3">Organization settings saved.</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="font-bold block mb-1">Organization name *</span>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Country</span>
              <input className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Timezone</span>
              <input className={inputCls} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Currency</span>
              <input className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Start week on</span>
              <select className={inputCls} value={form.startWeekOn} onChange={(e) => setForm({ ...form, startWeekOn: e.target.value as OrgSettings["startWeekOn"] })}>
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Time format</span>
              <select className={inputCls} value={form.timeFormat} onChange={(e) => setForm({ ...form, timeFormat: e.target.value as OrgSettings["timeFormat"] })}>
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Geofence unit</span>
              <select className={inputCls} value={form.geofenceUnit} onChange={(e) => setForm({ ...form, geofenceUnit: e.target.value as OrgSettings["geofenceUnit"] })}>
                <option value="meters">Meters</option>
                <option value="feet">Feet</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Language</span>
              <input className={inputCls} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </label>
          </div>
          <button onClick={save} disabled={busy} className={`${btnPrimary} mt-4`}>{busy ? "Saving..." : "Save changes"}</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Action</th>
                <th className="text-left px-3 py-2.5">Owner</th>
                <th className="text-left px-3 py-2.5">Admin</th>
                <th className="text-left px-3 py-2.5">Manager</th>
                <th className="text-left px-3 py-2.5">Member</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.action} className="border-b border-line last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold">{p.action}</td>
                  {[p.owner, p.admin, p.manager, p.member].map((v, i) => (
                    <td key={i} className={`px-3 py-2.5 ${v === "Yes" ? "text-green-700 font-bold" : v === "No" ? "text-muted" : ""}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
