import { currentMember } from "@/lib/auth";
import { db } from "@/lib/data/store";
import TimeOffView from "@/components/timeoff/TimeOffView";

export const dynamic = "force-dynamic";

export default function TimeOffPage({ searchParams }: { searchParams: { member?: string } }) {
  const me = currentMember()!;
  const database = db();
  return (
    <div className="p-4 lg:p-6">
      <TimeOffView
        meId={me.id}
        canApprove={me.role === "owner" || me.role === "admin" || me.role === "manager"}
        members={database.members.filter((m) => !m.archived)}
        policies={database.leavePolicies.filter((p) => !p.archived)}
        requests={database.leaveRequests}
        holidays={database.holidays}
        initialMemberFilter={searchParams.member ?? ""}
      />
    </div>
  );
}
