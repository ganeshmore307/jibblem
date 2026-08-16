import Link from "next/link";

export const dynamic = "force-dynamic";

const REPORTS = [
  {
    href: "/reports/tracked-time",
    title: "Tracked Time",
    description: "Total hours tracked per member and per day, with billable amounts and activity breakdown.",
  },
  {
    href: "/reports/attendance",
    title: "Attendance Insights",
    description: "Daily attendance, late arrivals, absences and time off across your team.",
  },
];

export default function ReportsPage() {
  return (
    <div className="p-4 lg:p-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <Link key={r.href} href={r.href} className="bg-white rounded-xl shadow-card p-5 hover:shadow-drawer transition-shadow block">
            <div className="h-10 w-10 rounded-xl bg-brand-light flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7770f" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M9 15l2 2 4-4" />
              </svg>
            </div>
            <div className="font-extrabold">{r.title}</div>
            <div className="text-sm text-muted mt-1">{r.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
