export const dynamic = "force-dynamic";

const INTEGRATIONS = [
  { name: "Slack", category: "Chat", description: "Clock in and out and get reminders from Slack.", available: true },
  { name: "Microsoft Teams", category: "Chat", description: "Track time without leaving Teams.", available: true },
  { name: "Google Calendar", category: "Calendar", description: "Sync time off and holidays to your calendar.", available: true },
  { name: "Payroll Export", category: "Payroll", description: "Export approved timesheets as payroll-ready CSV.", available: true },
  { name: "Webhooks", category: "Developer", description: "Receive events when entries and requests change.", available: false },
  { name: "REST API", category: "Developer", description: "Programmatic access to timesheets and people.", available: false },
];

export default function IntegrationsPage() {
  return (
    <div className="p-4 lg:p-6">
      <p className="text-sm text-muted mb-4 max-w-2xl">
        Connect TrackDeck with the tools your team already uses. Integrations in this demo are illustrative and not connected to external services.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
        {INTEGRATIONS.map((it) => (
          <div key={it.name} className="bg-white rounded-xl shadow-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-brand-light flex items-center justify-center font-extrabold text-brand-dark">
                {it.name.charAt(0)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted bg-gray-100 rounded px-1.5 py-0.5">{it.category}</span>
            </div>
            <div className="font-extrabold">{it.name}</div>
            <div className="text-sm text-muted mt-1 flex-1">{it.description}</div>
            <button
              disabled={!it.available}
              className={`mt-4 rounded-lg text-sm font-bold px-4 py-2 ${it.available ? "border border-brand text-brand hover:bg-brand-faint" : "border border-line text-muted cursor-not-allowed"}`}
            >
              {it.available ? "Connect" : "Coming soon"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
