"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Holiday, HolidayCalendar } from "@/lib/types";
import { dayLongName, formatMediumDate, todayStr } from "@/lib/time";
import { Badge, Drawer, FieldError, btnGhost, btnPrimary, inputCls } from "@/components/ui";

export default function HolidayList({ calendars, holidays }: { calendars: HolidayCalendar[]; holidays: Holiday[] }) {
  const router = useRouter();
  const years = useMemo(
    () => Array.from(new Set(holidays.map((h) => h.date.slice(0, 4)))).sort(),
    [holidays]
  );
  const [year, setYear] = useState(todayStr().slice(0, 4));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", date: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = holidays
    .filter((h) => h.date.startsWith(year))
    .sort((a, b) => a.date.localeCompare(b.date));

  async function add() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Something went wrong." }));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setAdding(false);
    setDraft({ name: "", date: "" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="text-sm font-bold">{calendars[0]?.name ?? "Holiday calendar"}</div>
        <Badge tone="orange">Default</Badge>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border border-line px-2 py-1.5 text-sm bg-white ml-2">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => setAdding(true)} className={`${btnPrimary} ml-auto`}>+ Add holiday</button>
      </div>
      <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
              <th className="text-left px-4 py-2.5">Holiday</th>
              <th className="text-left px-3 py-2.5">Date</th>
              <th className="text-left px-3 py-2.5">Day</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted">No holidays for {year}.</td></tr>
            )}
            {list.map((h) => (
              <tr key={h.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-bold">{h.name}</td>
                <td className="px-3 py-2.5">{formatMediumDate(h.date)}</td>
                <td className="px-3 py-2.5 text-muted">{dayLongName(h.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <Drawer title="Add holiday" onClose={() => setAdding(false)}>
          <FieldError error={error} />
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Holiday name *</span>
            <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Founders' Day" />
          </label>
          <label className="text-sm block mb-4">
            <span className="font-bold block mb-1">Date *</span>
            <input type="date" className={inputCls} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </label>
          <div className="flex gap-2">
            <button onClick={add} disabled={busy} className={btnPrimary}>{busy ? "Adding..." : "Add holiday"}</button>
            <button onClick={() => setAdding(false)} className={btnGhost}>Cancel</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
