"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Holiday, LeavePolicy, LeaveRequest, Member } from "@/lib/types";
import {
  addDays, addMonths, dayShortName, formatMediumDate, isSameMonth,
  mondayIndex, monthYearLabel, startOfMonth, startOfWeek, todayStr,
} from "@/lib/time";
import { Avatar, Badge, Drawer, FieldError, btnGhost, btnPrimary, inputCls } from "@/components/ui";

function requestDays(lr: LeaveRequest): number {
  let count = 0;
  let d = lr.startDate;
  while (d <= lr.endDate) {
    const dow = mondayIndex(d);
    if (dow < 5) count++;
    d = addDays(d, 1);
  }
  return lr.halfDay ? count * 0.5 : count;
}

export default function TimeOffView({
  meId,
  canApprove,
  members,
  policies,
  requests,
  holidays,
  initialMemberFilter,
}: {
  meId: string;
  canApprove: boolean;
  members: Member[];
  policies: LeavePolicy[];
  requests: LeaveRequest[];
  holidays: Holiday[];
  initialMemberFilter: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"requests" | "calendar">("requests");
  const [statusFilter, setStatusFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState(initialMemberFilter);
  const [month, setMonth] = useState(startOfMonth(todayStr()));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    memberId: meId, policyId: policies[0]?.id ?? "", startDate: todayStr(), endDate: todayStr(), halfDay: false, note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    let list = [...requests].sort((a, b) => b.startDate.localeCompare(a.startDate));
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (memberFilter) list = list.filter((r) => r.memberId === memberFilter);
    return list;
  }, [requests, statusFilter, memberFilter]);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/leave", {
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
    router.refresh();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  // Calendar grid for the selected month
  const gridStart = startOfWeek(month);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg border border-line overflow-hidden">
          {(["requests", "calendar"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-bold capitalize ${t === tab ? "bg-brand text-white" : "bg-white text-ink/70 hover:bg-gray-50"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "requests" && (
          <>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-line px-2 py-2 text-sm bg-white">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className="rounded-lg border border-line px-2 py-2 text-sm bg-white">
              <option value="">All members</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </>
        )}
        {tab === "calendar" && (
          <div className="flex items-center gap-1">
            <button onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month" className="p-1.5 rounded-lg hover:bg-gray-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <span className="text-sm font-extrabold px-1">{monthYearLabel(month)}</span>
            <button onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month" className="p-1.5 rounded-lg hover:bg-gray-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        )}
        <button onClick={() => { setDraft({ ...draft, memberId: meId }); setError(null); setAdding(true); }} className={`${btnPrimary} ml-auto`}>
          + Request time off
        </button>
      </div>

      {tab === "requests" ? (
        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Member</th>
                <th className="text-left px-3 py-2.5">Policy</th>
                <th className="text-left px-3 py-2.5">Dates</th>
                <th className="text-left px-3 py-2.5">Days</th>
                <th className="text-left px-3 py-2.5">Note</th>
                <th className="text-left px-3 py-2.5">Status</th>
                {canApprove && <th className="px-3 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={canApprove ? 7 : 6} className="px-4 py-8 text-center text-muted">No time off requests found.</td></tr>
              )}
              {filtered.map((lr) => {
                const m = members.find((x) => x.id === lr.memberId);
                const policy = policies.find((p) => p.id === lr.policyId);
                return (
                  <tr key={lr.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {m && <Avatar name={m.name} color={m.avatarColor} size={26} />}
                        <span className="font-bold">{m?.name ?? "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">{policy?.name ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      {formatMediumDate(lr.startDate)}{lr.endDate !== lr.startDate && <> – {formatMediumDate(lr.endDate)}</>}
                    </td>
                    <td className="px-3 py-2.5 font-bold">{requestDays(lr)}{lr.halfDay && " (half days)"}</td>
                    <td className="px-3 py-2.5 text-muted max-w-[160px] truncate">{lr.note || "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={lr.status === "approved" ? "green" : lr.status === "rejected" ? "red" : "orange"}>
                        {lr.status}
                      </Badge>
                    </td>
                    {canApprove && (
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        {lr.status === "pending" ? (
                          <>
                            <button onClick={() => setStatus(lr.id, "approved")} className="text-xs font-bold text-green-700 hover:underline mr-2">Approve</button>
                            <button onClick={() => setStatus(lr.id, "rejected")} className="text-xs font-bold text-red-600 hover:underline">Reject</button>
                          </>
                        ) : (
                          <button onClick={() => setStatus(lr.id, "pending")} className="text-xs font-bold text-muted hover:underline">Reset</button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 border-b border-line bg-gray-50">
              {cells.slice(0, 7).map((d) => (
                <div key={d} className="px-2 py-2 text-xs font-extrabold text-muted text-center">{dayShortName(d)}</div>
              ))}
            </div>
            {Array.from({ length: 6 }, (_, w) => (
              <div key={w} className="grid grid-cols-7 border-b border-line last:border-0">
                {cells.slice(w * 7, w * 7 + 7).map((d) => {
                  const inMonth = isSameMonth(d, month);
                  const holiday = holidays.find((h) => h.date === d);
                  const dayLeave = requests.filter((r) => r.status !== "rejected" && r.startDate <= d && d <= r.endDate);
                  return (
                    <div key={d} className={`min-h-[76px] p-1.5 border-r border-line last:border-r-0 ${inMonth ? "" : "bg-gray-50/70"}`}>
                      <div className={`text-xs font-bold mb-1 ${inMonth ? "" : "text-muted/60"} ${d === todayStr() ? "text-brand" : ""}`}>
                        {Number(d.slice(8, 10))}
                      </div>
                      {holiday && (
                        <div className="text-[10px] font-bold text-brand-dark bg-brand-light rounded px-1 mb-0.5 truncate" title={holiday.name}>
                          {holiday.name}
                        </div>
                      )}
                      {dayLeave.slice(0, 3).map((lr) => {
                        const m = members.find((x) => x.id === lr.memberId);
                        return (
                          <div
                            key={lr.id}
                            className={`text-[10px] font-bold rounded px-1 mb-0.5 truncate ${lr.status === "approved" ? "text-blue-700 bg-blue-100" : "text-yellow-800 bg-yellow-100"}`}
                            title={`${m?.name} — ${lr.status}`}
                          >
                            {m?.name.split(" ")[0]}
                          </div>
                        );
                      })}
                      {dayLeave.length > 3 && <div className="text-[10px] text-muted">+{dayLeave.length - 3} more</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {adding && (
        <Drawer title="Request time off" onClose={() => setAdding(false)}>
          <FieldError error={error} />
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Member</span>
            <select className={inputCls} value={draft.memberId} onChange={(e) => setDraft({ ...draft, memberId: e.target.value })}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Policy *</span>
            <select className={inputCls} value={draft.policyId} onChange={(e) => setDraft({ ...draft, policyId: e.target.value })}>
              {policies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="text-sm">
              <span className="font-bold block mb-1">From *</span>
              <input type="date" className={inputCls} value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="font-bold block mb-1">To *</span>
              <input type="date" className={inputCls} value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm mb-3">
            <input type="checkbox" checked={draft.halfDay} onChange={(e) => setDraft({ ...draft, halfDay: e.target.checked })} />
            Half days
          </label>
          <label className="text-sm block mb-4">
            <span className="font-bold block mb-1">Note</span>
            <textarea className={inputCls} rows={3} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Reason (optional)" />
          </label>
          <div className="flex gap-2">
            <button onClick={submit} disabled={busy} className={btnPrimary}>{busy ? "Submitting..." : "Submit request"}</button>
            <button onClick={() => setAdding(false)} className={btnGhost}>Cancel</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
