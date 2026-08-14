"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { Activity, Group, Member } from "@/lib/types";
import { formatDuration, formatMediumDate } from "@/lib/time";
import { Avatar, btnGhost } from "@/components/ui";

interface ReportData {
  days: {
    date: string;
    totalMinutes: number;
    billable: number;
    members: { memberId: string; minutes: number; billable: number }[];
  }[];
  grandTotalMinutes: number;
  activities: { activityId: string; minutes: number }[];
}

export default function TrackedTimeReport({
  from,
  to,
  memberFilter,
  groupFilter,
  report,
  members,
  groups,
  activities,
}: {
  from: string;
  to: string;
  memberFilter: string;
  groupFilter: string;
  report: ReportData;
  members: Member[];
  groups: Group[];
  activities: Activity[];
}) {
  const router = useRouter();

  function nav(next: { from?: string; to?: string; member?: string; group?: string }) {
    const p = new URLSearchParams();
    p.set("from", next.from ?? from);
    p.set("to", next.to ?? to);
    const m = next.member ?? memberFilter;
    const g = next.group ?? groupFilter;
    if (m) p.set("member", m);
    if (g) p.set("group", g);
    router.push(`/reports/tracked-time?${p.toString()}`);
  }

  const groupMemberIds = useMemo(
    () => (groupFilter ? new Set(groups.find((g) => g.id === groupFilter)?.memberIds ?? []) : null),
    [groupFilter, groups]
  );

  const filteredDays = useMemo(
    () =>
      report.days
        .map((d) => {
          const rows = d.members.filter(
            (r) =>
              (!memberFilter || r.memberId === memberFilter) &&
              (!groupMemberIds || groupMemberIds.has(r.memberId))
          );
          return {
            ...d,
            members: rows,
            totalMinutes: rows.reduce((s, r) => s + r.minutes, 0),
            billable: rows.reduce((s, r) => s + r.billable, 0),
          };
        })
        .filter((d) => d.members.length > 0),
    [report.days, memberFilter, groupMemberIds]
  );

  const total = filteredDays.reduce((s, d) => s + d.totalMinutes, 0);
  const totalBillable = filteredDays.reduce((s, d) => s + d.billable, 0);
  const maxDay = Math.max(...filteredDays.map((d) => d.totalMinutes), 1);
  const activityTotal = report.activities.reduce((s, a) => s + a.minutes, 0) || 1;

  function exportCsv() {
    const lines = ["Date,Member,Minutes,Hours,Billable (INR)"];
    for (const d of filteredDays) {
      for (const r of d.members) {
        const m = members.find((x) => x.id === r.memberId);
        lines.push(`${d.date},"${m?.name ?? r.memberId}",${r.minutes},${(r.minutes / 60).toFixed(2)},${r.billable}`);
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracked-time-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Link href="/reports" className="text-xs font-bold text-muted hover:text-ink">← Reports</Link>
        <h2 className="font-extrabold text-lg mr-2">Tracked Time</h2>
        <input type="date" value={from} onChange={(e) => e.target.value && nav({ from: e.target.value })}
          className="rounded-lg border border-line px-2 py-1.5 text-sm bg-white" aria-label="From date" />
        <span className="text-muted text-sm">to</span>
        <input type="date" value={to} onChange={(e) => e.target.value && nav({ to: e.target.value })}
          className="rounded-lg border border-line px-2 py-1.5 text-sm bg-white" aria-label="To date" />
        <select value={memberFilter} onChange={(e) => nav({ member: e.target.value })}
          className="rounded-lg border border-line px-2 py-2 text-sm bg-white">
          <option value="">All members</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={groupFilter} onChange={(e) => nav({ group: e.target.value })}
          className="rounded-lg border border-line px-2 py-2 text-sm bg-white">
          <option value="">All groups</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <button onClick={exportCsv} className={`${btnGhost} ml-auto`}>Export CSV</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="text-xs font-bold text-muted uppercase">Total tracked</div>
          <div className="text-2xl font-extrabold mt-1">{formatDuration(total)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="text-xs font-bold text-muted uppercase">Billable amount</div>
          <div className="text-2xl font-extrabold mt-1">₹{totalBillable.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 col-span-2 lg:col-span-1">
          <div className="text-xs font-bold text-muted uppercase">Days with activity</div>
          <div className="text-2xl font-extrabold mt-1">{filteredDays.length}</div>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="bg-white rounded-xl shadow-card p-4 mb-4 overflow-x-auto scrollbar-thin">
        <div className="font-extrabold mb-3">Daily tracked hours</div>
        <div className="flex items-end gap-1.5 h-36 min-w-[560px]">
          {filteredDays.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${formatDuration(d.totalMinutes)}`}>
              <div className="w-full rounded-t bg-brand/70 hover:bg-brand"
                style={{ height: `${Math.round((d.totalMinutes / maxDay) * 110)}px`, minHeight: 3 }} />
              <div className="text-[9px] text-muted whitespace-nowrap">{d.date.slice(8, 10)}/{d.date.slice(5, 7)}</div>
            </div>
          ))}
          {filteredDays.length === 0 && <div className="text-sm text-muted">No tracked time in this range.</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Per-day table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Date</th>
                <th className="text-left px-3 py-2.5">Members</th>
                <th className="text-right px-3 py-2.5">Tracked</th>
                <th className="text-right px-4 py-2.5">Billable</th>
              </tr>
            </thead>
            <tbody>
              {filteredDays.map((d) => (
                <tr key={d.date} className="border-b border-line last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold">{formatMediumDate(d.date)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex -space-x-1.5">
                      {d.members.slice(0, 6).map((r) => {
                        const m = members.find((x) => x.id === r.memberId);
                        return m ? (
                          <span key={r.memberId} title={`${m.name}: ${formatDuration(r.minutes)}`}>
                            <Avatar name={m.name} color={m.avatarColor} size={24} />
                          </span>
                        ) : null;
                      })}
                      {d.members.length > 6 && <span className="text-xs text-muted pl-2 self-center">+{d.members.length - 6}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-extrabold">{formatDuration(d.totalMinutes)}</td>
                  <td className="px-4 py-2.5 text-right">₹{d.billable.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-4 py-2.5 font-bold text-muted" colSpan={2}>Total</td>
                <td className="px-3 py-2.5 text-right font-extrabold text-brand-dark">{formatDuration(total)}</td>
                <td className="px-4 py-2.5 text-right font-extrabold">₹{totalBillable.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Activity breakdown */}
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="font-extrabold mb-3">By activity</div>
          {report.activities
            .sort((a, b) => b.minutes - a.minutes)
            .map(({ activityId, minutes }) => {
              const activity = activities.find((a) => a.id === activityId);
              const pct = Math.round((minutes / activityTotal) * 100);
              return (
                <div key={activityId} className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activity?.color ?? "#c4c4d0" }} />
                      {activity?.name ?? "No activity"}
                    </span>
                    <span className="text-muted">{formatDuration(minutes)} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: activity?.color ?? "#c4c4d0" }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
