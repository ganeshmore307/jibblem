import { db } from "@/lib/data/store";
import OrgSettingsView from "@/components/settings/OrgSettingsView";

export const dynamic = "force-dynamic";

export default function OrganizationPage() {
  const database = db();
  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <OrgSettingsView org={database.org} />
    </div>
  );
}
