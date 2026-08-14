import { db } from "@/lib/data/store";
import { formatClock } from "@/lib/time";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulesPage() {
  const database = db();
  return (
    <div className="p-4 lg:p-6 max-w-3xl space-y-4">
      {database.schedules.map((ws) => (
        <div key={ws.id} className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-extrabold">{ws.name}</h2>
            {ws.isDefault && <Badge tone="orange">Default</Badge>}
          </div>
          <p className="text-sm text-muted mb-4 capitalize">
            {ws.arrangement} arrangement · {ws.hoursPerWeek}h per week · day splits at {formatClock(ws.splitAt, "24h")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DAY_NAMES.map((name, i) => {
              const working = ws.days.includes(i);
              return (
                <div key={name} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${working ? "border-line bg-white" : "border-line bg-gray-50 text-muted"}`}>
                  <span className="font-bold">{name}</span>
                  {working ? (
                    <span>{formatClock(ws.dailyStart)} – {formatClock(ws.dailyEnd)}</span>
                  ) : (
                    <span>Day off</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-xs text-muted mt-3">
            Applied to all members. Attendance statuses (late, absent) are calculated against this schedule.
          </div>
        </div>
      ))}
    </div>
  );
}
