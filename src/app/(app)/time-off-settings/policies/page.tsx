import { db } from "@/lib/data/store";
import LeavePolicies from "@/components/settings/LeavePolicies";

export const dynamic = "force-dynamic";

export default function LeavePoliciesPage() {
  const database = db();
  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <LeavePolicies policies={database.leavePolicies} />
    </div>
  );
}
