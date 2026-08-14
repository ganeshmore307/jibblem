import { db } from "@/lib/data/store";
import HolidayList from "@/components/settings/HolidayList";

export const dynamic = "force-dynamic";

export default function HolidaysPage() {
  const database = db();
  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <HolidayList
        calendars={database.holidayCalendars}
        holidays={database.holidays}
      />
    </div>
  );
}
