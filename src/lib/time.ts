// All duration math uses integer minutes to avoid floating point errors.

export function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatClock(hm: string, format: "12h" | "24h" = "12h"): string {
  if (format === "24h") return hm;
  const [h, m] = hm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export interface EntryLike {
  clockIn: string;
  clockOut: string | null;
  breaks: { start: string; end: string }[];
}

/** Worked minutes for a single entry: (clockOut - clockIn) - total break time. */
export function entryWorkedMinutes(entry: EntryLike, nowHm?: string): number {
  const end = entry.clockOut ?? nowHm;
  if (!end) return 0;
  let mins = hmToMinutes(end) - hmToMinutes(entry.clockIn);
  if (mins < 0) mins += 24 * 60; // overnight entry
  for (const b of entry.breaks) {
    const dur = hmToMinutes(b.end) - hmToMinutes(b.start);
    if (dur > 0) mins -= dur;
  }
  return Math.max(0, mins);
}

export function entryBreakMinutes(entry: EntryLike): number {
  let total = 0;
  for (const b of entry.breaks) {
    const dur = hmToMinutes(b.end) - hmToMinutes(b.start);
    if (dur > 0) total += dur;
  }
  return total;
}

// ---------- date helpers (all use YYYY-MM-DD strings, avoid TZ pitfalls) ----------

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function addMonths(dateStr: string, months: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return toDateStr(d);
}

export function startOfMonth(dateStr: string): string {
  return dateStr.slice(0, 8) + "01";
}

export function daysInMonth(dateStr: string): number {
  const d = parseDateStr(dateStr);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Monday-based day index: 0=Mon ... 6=Sun */
export function mondayIndex(dateStr: string): number {
  const d = parseDateStr(dateStr);
  return (d.getDay() + 6) % 7;
}

/** Monday of the week containing dateStr. */
export function startOfWeek(dateStr: string): string {
  return addDays(dateStr, -mondayIndex(dateStr));
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function monthName(dateStr: string): string {
  return MONTHS[parseDateStr(dateStr).getMonth()];
}

export function formatLongDate(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return `${DAYS_LONG[mondayIndex(dateStr)]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMediumDate(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export function formatShortDate(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function dayShortName(dateStr: string): string {
  return DAYS_SHORT[mondayIndex(dateStr)];
}

export function dayLongName(dateStr: string): string {
  return DAYS_LONG[mondayIndex(dateStr)];
}

export function monthYearLabel(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function nowHm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.max(0, Math.floor((now - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
