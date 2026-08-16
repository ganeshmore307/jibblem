"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Activity, Project, TimeEntry } from "@/lib/types";
import type { DailyEntryView } from "@/lib/data/timesheets";
import { formatClock, formatDuration } from "@/lib/time";
import { Badge, Drawer, EmptyState, FieldError, btnGhost, btnPrimary, inputCls } from "@/components/ui";

interface BreakDraft {
  start: string;
  end: string;
}

interface Draft {
  clockIn: string;
  clockOut: string;
  activityId: string;
  projectId: string;
  note: string;
  breaks: BreakDraft[];
  status: TimeEntry["status"];
}

const EMPTY_DRAFT: Draft = {
  clockIn: "09:00",
  clockOut: "17:00",
  activityId: "",
  projectId: "",
  note: "",
  breaks: [],
  status: "pending",
};

export default function DayEntries({
  date,
  dateLabel,
  memberId,
  entries,
  activities,
  projects,
  holidayName,
  leaveName,
}: {
  date: string;
  dateLabel: string;
  memberId: string;
  entries: DailyEntryView[];
  activities: Activity[];
  projects: Project[];
  holidayName: string | null;
  leaveName: string | null;
}) {
  const router = useRouter();
  const [drawer, setDrawer] = useState<"add" | string | null>(null); // "add" or entry id
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const totalWorked = entries.reduce((s, e) => s + e.workedMinutes, 0);
  const totalBreaks = entries.reduce((s, e) => s + e.breakMinutes, 0);

  function openAdd() {
    setDraft(EMPTY_DRAFT);
    setError(null);
    setDrawer("add");
  }

  function openEdit(entry: DailyEntryView) {
    setDraft({
      clockIn: entry.clockIn,
      clockOut: entry.clockOut ?? "",
      activityId: entry.activityId ?? "",
      projectId: entry.projectId ?? "",
      note: entry.note,
      breaks: entry.breaks.map((b) => ({ start: b.start, end: b.end })),
      status: entry.status,
    });
    setError(null);
    setDrawer(entry.id);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const payload = {
      memberId,
      date,
      clockIn: draft.clockIn,
      clockOut: draft.clockOut || null,
      activityId: draft.activityId || null,
      projectId: draft.projectId || null,
      note: draft.note,
      breaks: draft.breaks,
      status: draft.status,
    };
    const res =
      drawer === "add"
        ? await fetch("/api/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/entries/${drawer}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Something went wrong." }));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setDrawer(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this time entry?")) return;
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    setDrawer(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-extrabold text-lg">{dateLabel}</h2>
          <div className="text-sm text-muted">
            Worked <span className="font-bold text-ink">{formatDuration(totalWorked)}</span>
            {totalBreaks > 0 && <> · Breaks <span className="font-bold text-ink">{formatDuration(totalBreaks)}</span></>}
          </div>
        </div>
        <button onClick={openAdd} className={btnPrimary}>+ Add entry</button>
      </div>

      {holidayName && (
        <div className="rounded-xl bg-brand-light border border-brand/30 text-brand-dark text-sm font-bold px-4 py-2.5 mb-3">
          Public holiday: {holidayName}
        </div>
      )}
      {leaveName && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold px-4 py-2.5 mb-3">
          Time off: {leaveName}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card">
          <EmptyState
            title="No time tracked"
            subtitle="No entries for this day yet. Add a manual entry to record time."
            action={<button onClick={openAdd} className={btnPrimary}>+ Add entry</button>}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">In → Out</th>
                <th className="text-left px-3 py-2.5">Worked</th>
                <th className="text-left px-3 py-2.5">Breaks</th>
                <th className="text-left px-3 py-2.5">Activity</th>
                <th className="text-left px-3 py-2.5">Project</th>
                <th className="text-left px-3 py-2.5">Note</th>
                <th className="text-left px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const activity = activities.find((a) => a.id === e.activityId);
                const project = projects.find((p) => p.id === e.projectId);
                return (
                  <tr key={e.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-bold">
                      {formatClock(e.clockIn)} → {e.clockOut ? formatClock(e.clockOut) : <span className="text-green-700">now</span>}
                    </td>
                    <td className="px-3 py-2.5 font-extrabold">{formatDuration(e.workedMinutes)}</td>
                    <td className="px-3 py-2.5">{e.breakMinutes > 0 ? formatDuration(e.breakMinutes) : "—"}</td>
                    <td className="px-3 py-2.5">
                      {activity ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activity.color }} />
                          {activity.name}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2.5">{project?.name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted max-w-[180px] truncate">{e.note || "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={e.status === "approved" ? "green" : e.status === "rejected" ? "red" : "gray"}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={() => openEdit(e)} className="text-xs font-bold text-brand hover:underline">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {drawer && (
        <Drawer title={drawer === "add" ? "Add time entry" : "Edit time entry"} onClose={() => setDrawer(null)}>
          <FieldError error={error} />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="text-sm">
              <span className="font-bold block mb-1">Clock in *</span>
              <input type="time" className={inputCls} value={draft.clockIn}
                onChange={(e) => setDraft({ ...draft, clockIn: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">Clock out</span>
              <input type="time" className={inputCls} value={draft.clockOut}
                onChange={(e) => setDraft({ ...draft, clockOut: e.target.value })} />
            </label>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold">Breaks</span>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, breaks: [...draft.breaks, { start: "12:00", end: "12:30" }] })}
                className="text-xs font-bold text-brand hover:underline"
              >
                + Add break
              </button>
            </div>
            {draft.breaks.length === 0 && <div className="text-xs text-muted">No breaks.</div>}
            {draft.breaks.map((b, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="time" className={inputCls} value={b.start}
                  onChange={(e) => {
                    const breaks = [...draft.breaks];
                    breaks[i] = { ...breaks[i], start: e.target.value };
                    setDraft({ ...draft, breaks });
                  }} />
                <span className="text-muted">→</span>
                <input type="time" className={inputCls} value={b.end}
                  onChange={(e) => {
                    const breaks = [...draft.breaks];
                    breaks[i] = { ...breaks[i], end: e.target.value };
                    setDraft({ ...draft, breaks });
                  }} />
                <button
                  type="button"
                  aria-label="Remove break"
                  onClick={() => setDraft({ ...draft, breaks: draft.breaks.filter((_, j) => j !== i) })}
                  className="text-muted hover:text-red-600 p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Activity</span>
            <select className={inputCls} value={draft.activityId}
              onChange={(e) => setDraft({ ...draft, activityId: e.target.value })}>
              <option value="">No activity</option>
              {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Project</span>
            <select className={inputCls} value={draft.projectId}
              onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}>
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Note</span>
            <textarea className={inputCls} rows={3} value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="What did you work on?" />
          </label>
          <label className="text-sm block mb-4">
            <span className="font-bold block mb-1">Status</span>
            <select className={inputCls} value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as TimeEntry["status"] })}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <div className="flex items-center gap-2">
            <button onClick={save} disabled={busy} className={btnPrimary}>
              {busy ? "Saving..." : "Save entry"}
            </button>
            <button onClick={() => setDrawer(null)} className={btnGhost}>Cancel</button>
            {drawer !== "add" && (
              <button onClick={() => remove(drawer)} className="ml-auto text-sm font-bold text-red-600 hover:underline">
                Delete
              </button>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}
