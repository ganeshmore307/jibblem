import { db } from "@/lib/data/store";
import ActivitiesView from "@/components/settings/ActivitiesView";

export const dynamic = "force-dynamic";

export default function ActivitiesPage() {
  const database = db();
  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <ActivitiesView
        activities={database.activities}
        projects={database.projects}
        clients={database.clients}
      />
    </div>
  );
}
