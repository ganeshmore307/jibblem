import Link from "next/link";
import { db } from "@/lib/data/store";
import { entriesFor, isHoliday, leaveOn, workedMinutesOn, breakMinutesOn } from "@/lib/data/timesheets";
import { formatClock, formatDuration, hmToMinutes, todayStr } from "@/lib/time";
import DateNav from "@/components/DateNav";
import { Avatar, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

type AttendanceTone = "green" | "orange" | "red" | "blue" | "gray";

function statusFor(memberId: string, date: string, scheduleStart: string): { label: string; tone: AttendanceTone } {
  const holiday = isHoliday(date);
  if (holiday) return { label: "Holiday", tone: "orange" };
  const leave = leaveOn(memberId, date);
  if (leave) return { label: "Time off", tone: "blue" };
  const entries = entriesFor(memberId, date);
  if (entries.length === 0) {
    const dow = new Date(`${date}T00:00:00`).getDay();
    if (dow === 0 || dow === 6) return { label: "Day off", tone: "gray" };
    return date > todayStr() ? { label: "Scheduled", tone: "gray" } : { label: "Absent", tone: "red" };
  }
  const open = entries.some((e) => e.clockOut === null);
  const late = hmToMinutes(entries[0].clockIn) > hmToMinutes(scheduleStart) + 15;
  if (open) return late ? { label: "In (late)", tone: "orange" } : { label: "Clocked in", tone: "green" };
  return late ? { label: "Present (late)", tone: "orange" } : { label: "Present", tone: "green" };
}

export default function AttendancePage({ params }: { params: { date: string } }) {
  const database = db();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayStr();
  const members = database.members.filter((m) => !m.archived);
  const scheduleStart = database.schedules[0]?.dailyStart ?? "09:00";

  const rows = members.map((m) => {
    const entries = entriesFor(m.id, date);
    return {
      member: m,
      status: statusFor(m.id, date, scheduleStart),
      firstIn: entries[0]?.clockIn ?? null,
      lastOut: entries.length ? entries[entries.length - 1].clockOut : null,
      worked: workedMinutesOn(m.id, date),
      breaks: breakMinutesOn(m.id, date),
      entryCount: entries.length,
    };
  });

  const presentCount = rows.filter((r) => r.status.tone === "green").length;
  const lateCount = rows.filter((r) => r.status.label.includes("late")).length;
  const absentCount = rows.filter((r) => r.status.label === "Absent").length;
  const offCount = rows.filter((r) => r.status.tone === "blue" || r.status.tone === "orange").length;

  return (
    <div>
      <DateNav date={date} basePath="/attendance" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Present", value: presentCount },
            { label: "Late arrivals", value: lateCount },
            { label: "Absent", value: absentCount },
            { label: "Holiday / time off", value: offCount },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl shadow-card p-4">
              <div className="text-xs font-bold text-muted uppercase tracking-wide">{c.label}</div>
              <div className="text-2xl font-extrabold mt-1">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Member</th>
                <th className="text-left px-3 py-2.5">Status</th>
                <th className="text-left px-3 py-2.5">First in</th>
                <th className="text-left px-3 py-2.5">Last out</th>
                <th className="text-left px-3 py-2.5">Breaks</th>
                <th className="text-left px-3 py-2.5">Worked</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ member, status, firstIn, lastOut, worked, breaks }) => (
                <tr key={member.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={member.name} color={member.avatarColor} size={28} />
                      <div>
                        <div className="font-bold">{member.name}</div>
                        <div className="text-xs text-muted">{member.memberCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><Badge tone={status.tone}>{status.label}</Badge></td>
                  <td className="px-3 py-2.5">{firstIn ? formatClock(firstIn) : "—"}</td>
                  <td className="px-3 py-2.5">{lastOut ? formatClock(lastOut) : firstIn ? <span className="text-green-700 font-bold">In now</span> : "—"}</td>
                  <td className="px-3 py-2.5">{breaks > 0 ? formatDuration(breaks) : "—"}</td>
                  <td className="px-3 py-2.5 font-extrabold">{worked > 0 ? formatDuration(worked) : "—"}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Link href={`/timesheets/day/${date}?member=${member.id}`} className="text-xs font-bold text-brand hover:underline">
                      Timesheet
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
