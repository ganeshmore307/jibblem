import Link from "next/link";
import { db } from "@/lib/data/store";
import { entriesFor, isHoliday, leaveOn, workedMinutesOn } from "@/lib/data/timesheets";
import { addDays, formatDuration, formatMediumDate, hmToMinutes, mondayIndex, todayStr } from "@/lib/time";
import { Avatar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function AttendanceReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const database = db();
  const to = searchParams.to && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.to) ? searchParams.to : todayStr();
  const from = searchParams.from && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.from) ? searchParams.from : addDays(to, -13);
  const members = database.members.filter((m) => !m.archived);
  const scheduleStart = database.schedules[0]?.dailyStart ?? "09:00";

  const rows = members.map((m) => {
    let present = 0, late = 0, absent = 0, leave = 0, holidayCount = 0, worked = 0;
    let d = from;
    while (d <= to) {
      const isWeekend = mondayIndex(d) >= 5;
      if (!isWeekend && d <= todayStr()) {
        if (isHoliday(d)) holidayCount++;
        else if (leaveOn(m.id, d)) leave++;
        else {
          const entries = entriesFor(m.id, d);
          if (entries.length === 0) absent++;
          else {
            present++;
            if (hmToMinutes(entries[0].clockIn) > hmToMinutes(scheduleStart) + 15) late++;
          }
        }
        worked += workedMinutesOn(m.id, d);
      }
      d = addDays(d, 1);
    }
    return { member: m, present, late, absent, leave, holidayCount, worked };
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Link href="/reports" className="text-xs font-bold text-muted hover:text-ink">← Reports</Link>
        <h2 className="font-extrabold text-lg mr-2">Attendance Insights</h2>
        <form className="flex items-center gap-2">
          <input type="date" name="from" defaultValue={from} className="rounded-lg border border-line px-2 py-1.5 text-sm bg-white" aria-label="From date" />
          <span className="text-muted text-sm">to</span>
          <input type="date" name="to" defaultValue={to} className="rounded-lg border border-line px-2 py-1.5 text-sm bg-white" aria-label="To date" />
          <button className="rounded-lg border border-line bg-white text-sm font-bold px-3 py-1.5 hover:bg-gray-50">Apply</button>
        </form>
      </div>
      <div className="text-sm text-muted mb-3">
        {formatMediumDate(from)} – {formatMediumDate(to)} (weekdays only)
      </div>
      <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
              <th className="text-left px-4 py-2.5">Member</th>
              <th className="text-right px-3 py-2.5">Present</th>
              <th className="text-right px-3 py-2.5">Late arrivals</th>
              <th className="text-right px-3 py-2.5">Absent</th>
              <th className="text-right px-3 py-2.5">Time off</th>
              <th className="text-right px-3 py-2.5">Holidays</th>
              <th className="text-right px-4 py-2.5">Hours worked</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ member, present, late, absent, leave, holidayCount, worked }) => (
              <tr key={member.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={member.name} color={member.avatarColor} size={26} />
                    <span className="font-bold">{member.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-green-700">{present}</td>
                <td className="px-3 py-2.5 text-right font-bold text-yellow-700">{late}</td>
                <td className="px-3 py-2.5 text-right font-bold text-red-600">{absent}</td>
                <td className="px-3 py-2.5 text-right">{leave}</td>
                <td className="px-3 py-2.5 text-right">{holidayCount}</td>
                <td className="px-4 py-2.5 text-right font-extrabold">{formatDuration(worked)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
