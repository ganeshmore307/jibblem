import { db } from "@/lib/data/store";
import PeopleTable from "@/components/people/PeopleTable";

export const dynamic = "force-dynamic";

export default function PeoplePage() {
  const database = db();
  return (
    <div className="p-4 lg:p-6">
      <PeopleTable
        members={database.members}
        groups={database.groups}
      />
    </div>
  );
}
