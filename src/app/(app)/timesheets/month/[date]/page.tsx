import Link from "next/link";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/data/store";
import { monthlySummary } from "@/lib/data/timesheets";
import { formatDuration, monthYearLabel, todayStr } from "@/lib/time";
import TimesheetToolbar from "@/components/timesheets/TimesheetToolbar";

export const dynamic = "force-dynamic";

const DAY_HEADERS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MonthlyTimesheetPage({
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
  const summary = monthlySummary(memberId, date);
  const today = todayStr();

  return (
    <div>
      <TimesheetToolbar
        view="month"
        date={date}
        memberId={memberId}
        members={members.map((m) => ({ id: m.id, name: m.name, avatarColor: m.avatarColor }))}
      />
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-lg">{monthYearLabel(date)} timesheet</h2>
          <div className="text-sm">
            Monthly total: <span className="font-extrabold text-brand-dark">{formatDuration(summary.monthTotalMinutes)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <div className="min-w-[760px]">
            {/* Header row */}
            <div className="grid grid-cols-[repeat(7,1fr)_110px] border-b border-line bg-gray-50 rounded-t-xl">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="px-2 py-2 text-xs font-extrabold text-muted text-center">
                  <span className="hidden lg:inline">{d}</span>
                  <span className="lg:hidden">{d.slice(0, 3)}</span>
                </div>
              ))}
              <div className="px-2 py-2 text-xs font-extrabold text-muted text-center border-l border-line">Weekly Total</div>
            </div>
            {/* Weeks */}
            {summary.weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-[repeat(7,1fr)_110px] border-b border-line last:border-0">
                {week.days.map((cell) => {
                  const dayNum = Number(cell.date.slice(8, 10));
                  const isToday = cell.date === today;
                  return (
                    <Link
                      key={cell.date}
                      href={`/timesheets/day/${cell.date}?member=${memberId}`}
                      className={`min-h-[84px] p-1.5 border-r border-line last:border-r-0 hover:bg-brand-faint transition-colors ${
                        cell.inMonth ? "" : "bg-gray-50/70"
                      }`}
                    >
                      <div className={`text-xs font-bold mb-1 flex items-center justify-between ${cell.inMonth ? "" : "text-muted/60"}`}>
                        <span className={isToday ? "bg-brand text-white rounded-full h-5 w-5 flex items-center justify-center" : ""}>{dayNum}</span>
                      </div>
                      {cell.workedMinutes > 0 && (
                        <div className={`text-sm font-extrabold ${cell.inMonth ? "text-ink" : "text-muted/60"}`}>
                          {formatDuration(cell.workedMinutes)}
                        </div>
                      )}
                      {cell.status === "clocked-in" && (
                        <div className="text-[10px] font-bold text-green-700 bg-green-100 rounded px-1 inline-block mt-0.5">In now</div>
                      )}
                      {cell.holidayName && (
                        <div className={`text-[10px] font-bold rounded px-1 inline-block mt-0.5 ${cell.inMonth ? "text-brand-dark bg-brand-light" : "text-muted bg-gray-100"}`}>
                          {cell.holidayName}
                        </div>
                      )}
                      {cell.status === "leave" && (
                        <div className="text-[10px] font-bold text-blue-700 bg-blue-100 rounded px-1 inline-block mt-0.5">Time off</div>
                      )}
                      {cell.status === "absent" && cell.inMonth && (
                        <div className="text-[10px] text-muted/70 mt-0.5">—</div>
                      )}
                    </Link>
                  );
                })}
                <div className="flex items-center justify-center border-l border-line bg-gray-50/60">
                  <span className="text-sm font-extrabold">{week.weekTotalMinutes > 0 ? formatDuration(week.weekTotalMinutes) : "0h"}</span>
                </div>
              </div>
            ))}
            {/* Month total row */}
            <div className="grid grid-cols-[repeat(7,1fr)_110px]">
              <div className="col-span-7 px-3 py-2.5 text-sm font-bold text-muted text-right">Monthly total</div>
              <div className="flex items-center justify-center border-l border-line bg-brand-faint py-2.5">
                <span className="text-sm font-extrabold text-brand-dark">{formatDuration(summary.monthTotalMinutes)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-brand-light border border-brand/40" /> Public holiday</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-blue-100 border border-blue-300" /> Time off</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-green-100 border border-green-300" /> Clocked in</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-gray-100 border border-line" /> Outside month</span>
        </div>
      </div>
    </div>
  );
}
