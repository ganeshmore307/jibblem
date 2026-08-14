import { redirect } from "next/navigation";
import { todayStr } from "@/lib/time";

export default function AttendanceIndex() {
  redirect(`/attendance/${todayStr()}`);
}
