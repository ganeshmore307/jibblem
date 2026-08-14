import { db } from "@/lib/data/store";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function LocationsPage() {
  const database = db();
  const locations = database.locations.filter((l) => !l.archived);
  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <p className="text-sm text-muted mb-4">
        Geofenced locations members can clock in from. Geofencing is {database.policies.geofencing ? "enabled" : "disabled"} in Time Tracking policies.
      </p>
      {locations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card">
          <EmptyState title="No locations" subtitle="Add a location to restrict where members can clock in." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Location</th>
                <th className="text-left px-3 py-2.5">Address</th>
                <th className="text-right px-4 py-2.5">Geofence radius</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold">
                    <span className="inline-flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f7770f" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {l.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted">{l.address}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{l.radius} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
