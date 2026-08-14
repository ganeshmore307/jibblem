import { hmToMinutes } from "@/lib/time";

const HM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateEntry(body: {
  clockIn?: string;
  clockOut?: string | null;
  breaks?: { start: string; end: string }[];
}): string | null {
  if (!body.clockIn || !HM.test(body.clockIn)) return "Clock in time is required (HH:mm).";
  if (body.clockOut != null && !HM.test(body.clockOut)) return "Clock out time must be HH:mm.";
  if (body.clockOut != null && hmToMinutes(body.clockOut) <= hmToMinutes(body.clockIn))
    return "Clock out must be after clock in.";
  for (const b of body.breaks ?? []) {
    if (!HM.test(b.start) || !HM.test(b.end)) return "Break times must be HH:mm.";
    if (hmToMinutes(b.end) <= hmToMinutes(b.start)) return "Break end must be after break start.";
    if (hmToMinutes(b.start) < hmToMinutes(body.clockIn)) return "Breaks must be within the entry time.";
    if (body.clockOut != null && hmToMinutes(b.end) > hmToMinutes(body.clockOut))
      return "Breaks must be within the entry time.";
  }
  return null;
}
