import { db } from "@/lib/data/store";
import { trackedTimeReport } from "@/lib/data/timesheets";
import { addDays, todayStr } from "@/lib/time";
import TrackedTimeReport from "@/components/reports/TrackedTimeReport";

export const dynamic = "force-dynamic";

export default function TrackedTimePage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; member?: string; group?: string };
}) {
  const database = db();
  const to = searchParams.to && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.to) ? searchParams.to : todayStr();
  const from = searchParams.from && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.from) ? searchParams.from : addDays(to, -13);
  const report = trackedTimeReport(from, to);

  return (
    <div className="p-4 lg:p-6">
      <TrackedTimeReport
        from={from}
        to={to}
        memberFilter={searchParams.member ?? ""}
        groupFilter={searchParams.group ?? ""}
        report={report}
        members={database.members.filter((m) => !m.archived)}
        groups={database.groups}
        activities={database.activities}
      />
    </div>
  );
}
