import Link from "next/link";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/data/store";
import { weeklySummary } from "@/lib/data/timesheets";
import { addDays, dayShortName, formatDuration, formatShortDate, startOfWeek, todayStr } from "@/lib/time";
import TimesheetToolbar from "@/components/timesheets/TimesheetToolbar";
import { Avatar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function WeeklyTimesheetPage({
  params,
  searchParams,
}: {
  params: { date: string };
  searchParams: { member?: string };
}) {
  const me = currentMember()!;
  const database = db();
  const members = database.members.filter((m) => !m.archived);
  const memberId = searchParams.member && members.some((m) => m.id === searchParams.member)
    ? searchParams.member
    : me.id;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayStr();
  const weekStart = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const rows = weeklySummary(weekStart, members.map((m) => m.id));
  const today = todayStr();
  const grandTotal = rows.reduce((sum, r) => sum + r.totalMinutes, 0);

  return (
    <div>
      <TimesheetToolbar
        view="week"
        date={date}
        memberId={memberId}
        members={members.map((m) => ({ id: m.id, name: m.name, avatarColor: m.avatarColor }))}
      />
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-lg">
            Week of {formatShortDate(weekStart)} – {formatShortDate(addDays(weekStart, 6))}
          </h2>
          <div className="text-sm">
            Team total: <span className="font-extrabold text-brand-dark">{formatDuration(grandTotal)}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line">
                <th className="text-left px-4 py-2.5 text-xs font-extrabold text-muted uppercase">Member</th>
                {days.map((d) => (
                  <th key={d} className={`px-2 py-2.5 text-xs font-extrabold uppercase text-center ${d === today ? "text-brand" : "text-muted"}`}>
                    {dayShortName(d)} {Number(d.slice(8, 10))}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-xs font-extrabold text-muted uppercase text-center border-l border-line">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const m = members.find((x) => x.id === row.memberId)!;
                const isSelected = row.memberId === memberId;
                return (
                  <tr key={row.memberId} className={`border-b border-line last:border-0 ${isSelected ? "bg-brand-faint" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-2">
                      <Link href={`/timesheets/week/${date}?member=${row.memberId}`} className="flex items-center gap-2">
                        <Avatar name={m.name} color={m.avatarColor} size={26} />
                        <span className="font-bold">{m.name}</span>
                      </Link>
                    </td>
                    {row.days.map((cell) => (
                      <td key={cell.date} className="px-2 py-2 text-center">
                        <Link
                          href={`/timesheets/day/${cell.date}?member=${row.memberId}`}
                          className={`inline-block rounded px-1.5 py-0.5 hover:bg-brand-light ${
                            cell.status === "holiday" ? "text-brand-dark bg-brand-light" :
                            cell.status === "leave" ? "text-blue-700 bg-blue-100" :
                            cell.status === "clocked-in" ? "text-green-700 bg-green-100" :
                            cell.workedMinutes > 0 ? "font-bold" : "text-muted/60"
                          }`}
                          title={cell.holidayName ?? undefined}
                        >
                          {cell.workedMinutes > 0
                            ? formatDuration(cell.workedMinutes)
                            : cell.status === "holiday" ? "HOL"
                            : cell.status === "leave" ? "OFF"
                            : "—"}
                        </Link>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-extrabold border-l border-line">
                      {formatDuration(row.totalMinutes)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-4 py-2.5 font-bold text-muted">Team total</td>
                {days.map((d, i) => (
                  <td key={d} className="px-2 py-2.5 text-center font-bold">
                    {formatDuration(rows.reduce((s, r) => s + r.days[i].workedMinutes, 0))}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center font-extrabold text-brand-dark border-l border-line">
                  {formatDuration(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
