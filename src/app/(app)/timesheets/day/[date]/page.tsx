import { currentMember } from "@/lib/auth";
import { db } from "@/lib/data/store";
import { dailyEntries, isHoliday, leaveOn } from "@/lib/data/timesheets";
import { formatLongDate, todayStr } from "@/lib/time";
import TimesheetToolbar from "@/components/timesheets/TimesheetToolbar";
import DayEntries from "@/components/timesheets/DayEntries";

export const dynamic = "force-dynamic";

export default function DailyTimesheetPage({
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
  const entries = dailyEntries(memberId, date);
  const holiday = isHoliday(date);
  const leave = leaveOn(memberId, date);

  return (
    <div>
      <TimesheetToolbar
        view="day"
        date={date}
        memberId={memberId}
        members={members.map((m) => ({ id: m.id, name: m.name, avatarColor: m.avatarColor }))}
      />
      <div className="p-4 lg:p-6">
        <DayEntries
          date={date}
          dateLabel={formatLongDate(date)}
          memberId={memberId}
          entries={entries}
          activities={database.activities.filter((a) => !a.archived)}
          projects={database.projects.filter((p) => !p.archived)}
          holidayName={holiday}
          leaveName={leave ? database.leavePolicies.find((p) => p.id === leave.policyId)?.name ?? "Time off" : null}
        />
      </div>
    </div>
  );
}
