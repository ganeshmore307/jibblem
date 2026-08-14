import Link from "next/link";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/data/store";
import {
  clockedInMembers, dailyEntries, workedMinutesOn,
} from "@/lib/data/timesheets";
import {
  addDays, dayShortName, formatClock, formatDuration, formatMediumDate,
  formatShortDate, startOfWeek, todayStr,
} from "@/lib/time";
import { Avatar, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const me = currentMember()!;
  const database = db();
  const today = todayStr();
  const weekStart = startOfWeek(today);
  const members = database.members.filter((m) => !m.archived);

  const inNow = clockedInMembers();
  const inIds = new Set(inNow.map((x) => x.memberId));
  const outToday = members.filter((m) => !inIds.has(m.id) && workedMinutesOn(m.id, today) > 0);
  const notIn = members.filter((m) => !inIds.has(m.id) && workedMinutesOn(m.id, today) === 0);

  // Org hours per day this week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const orgDaily = weekDays.map((d) =>
    members.reduce((sum, m) => sum + workedMinutesOn(m.id, d), 0)
  );
  const orgWeekTotal = orgDaily.reduce((a, b) => a + b, 0);
  const maxDaily = Math.max(...orgDaily, 1);

  const myToday = workedMinutesOn(me.id, today);
  const myWeek = weekDays.reduce((sum, d) => sum + workedMinutesOn(me.id, d), 0);
  const myEntries = dailyEntries(me.id, today);

  const pendingLeave = database.leaveRequests
    .filter((lr) => lr.status === "pending")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  const upcomingHolidays = database.holidays
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "My hours today", value: formatDuration(myToday) },
          { label: "My hours this week", value: formatDuration(myWeek) },
          { label: "Team hours this week", value: formatDuration(orgWeekTotal) },
          { label: "Clocked in now", value: String(inNow.length) },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-card p-4">
            <div className="text-xs font-bold text-muted uppercase tracking-wide">{c.label}</div>
            <div className="text-2xl font-extrabold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Who's in / out */}
        <div className="bg-white rounded-xl shadow-card p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold">Who&apos;s In / Out</h2>
            <Link href="/attendance" className="text-xs font-bold text-brand hover:underline">View attendance</Link>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-1">
            <div>
              <div className="text-xs font-bold text-green-700 mb-2">IN ({inNow.length})</div>
              {inNow.length === 0 && <div className="text-sm text-muted">No one is clocked in.</div>}
              {inNow.map(({ memberId, since }) => {
                const m = members.find((x) => x.id === memberId)!;
                return (
                  <div key={memberId} className="flex items-center gap-2 py-1.5">
                    <Avatar name={m.name} color={m.avatarColor} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate">{m.name}</div>
                      <div className="text-xs text-muted">In since {formatClock(since)}</div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                );
              })}
            </div>
            <div>
              <div className="text-xs font-bold text-muted mb-2">OUT ({outToday.length})</div>
              {outToday.map((m) => (
                <div key={m.id} className="flex items-center gap-2 py-1.5">
                  <Avatar name={m.name} color={m.avatarColor} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate">{m.name}</div>
                    <div className="text-xs text-muted">Worked {formatDuration(workedMinutesOn(m.id, today))}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-muted mb-2">NOT IN YET ({notIn.length})</div>
              {notIn.map((m) => (
                <div key={m.id} className="flex items-center gap-2 py-1.5 opacity-70">
                  <Avatar name={m.name} color={m.avatarColor} size={28} />
                  <div className="text-sm font-bold truncate">{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {/* Weekly chart */}
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold">Team hours this week</h2>
              <Link href="/reports/tracked-time" className="text-xs font-bold text-brand hover:underline">Open report</Link>
            </div>
            <div className="flex items-end gap-2 h-40">
              {weekDays.map((d, i) => (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-bold text-muted">{orgDaily[i] > 0 ? formatDuration(orgDaily[i]) : ""}</div>
                  <div
                    className={`w-full rounded-t-md ${d === today ? "bg-brand" : "bg-brand/40"}`}
                    style={{ height: `${Math.round((orgDaily[i] / maxDaily) * 120)}px`, minHeight: orgDaily[i] > 0 ? 4 : 0 }}
                  />
                  <div className={`text-xs font-bold ${d === today ? "text-brand" : "text-muted"}`}>{dayShortName(d)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* My entries today */}
            <div className="bg-white rounded-xl shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-extrabold">My activity today</h2>
                <Link href={`/timesheets/day/${today}?member=${me.id}`} className="text-xs font-bold text-brand hover:underline">
                  Timesheet
                </Link>
              </div>
              {myEntries.length === 0 && <div className="text-sm text-muted">No time tracked yet today.</div>}
              {myEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-line last:border-0">
                  <div className="text-sm">
                    <span className="font-bold">{formatClock(e.clockIn)}</span>
                    <span className="text-muted"> → {e.clockOut ? formatClock(e.clockOut) : "now"}</span>
                  </div>
                  <div className="text-sm font-bold">{formatDuration(e.workedMinutes)}</div>
                </div>
              ))}
            </div>

            {/* Pending leave + holidays */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-extrabold">Pending time off</h2>
                  <Link href="/time-off" className="text-xs font-bold text-brand hover:underline">View all</Link>
                </div>
                {pendingLeave.length === 0 && <div className="text-sm text-muted">No pending requests.</div>}
                {pendingLeave.map((lr) => {
                  const m = members.find((x) => x.id === lr.memberId);
                  return (
                    <div key={lr.id} className="flex items-center justify-between py-1.5">
                      <div className="text-sm font-bold truncate">{m?.name}</div>
                      <div className="text-xs text-muted">{formatShortDate(lr.startDate)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-extrabold">Upcoming holidays</h2>
                  <Link href="/time-off-settings/holidays" className="text-xs font-bold text-brand hover:underline">Calendar</Link>
                </div>
                {upcomingHolidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between py-1.5">
                    <div className="text-sm font-bold flex items-center gap-2">
                      {h.name} <Badge tone="orange">Holiday</Badge>
                    </div>
                    <div className="text-xs text-muted">{formatMediumDate(h.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
