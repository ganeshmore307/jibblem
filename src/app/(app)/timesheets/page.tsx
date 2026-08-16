import { redirect } from "next/navigation";
import { todayStr } from "@/lib/time";

export default function TimesheetsIndex() {
  redirect(`/timesheets/month/${todayStr()}`);
}
