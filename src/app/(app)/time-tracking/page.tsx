import { db } from "@/lib/data/store";
import PoliciesForm from "@/components/settings/PoliciesForm";

export const dynamic = "force-dynamic";

export default function TimeTrackingPage() {
  const database = db();
  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <PoliciesForm policies={database.policies} />
    </div>
  );
}
