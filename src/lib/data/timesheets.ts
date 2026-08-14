import { db } from "./store";
import {
  addDays, addMonths, daysInMonth, entryWorkedMinutes, entryBreakMinutes,
  isSameMonth, mondayIndex, nowHm, startOfMonth, startOfWeek, todayStr,
} from "@/lib/time";
import { TimeEntry } from "@/lib/types";

export function entriesFor(memberId: string, date: string): TimeEntry[] {
  return db()
    .entries.filter((e) => e.memberId === memberId && e.date === date)
    .sort((a, b) => a.clockIn.localeCompare(b.clockIn));
}

export function workedMinutesOn(memberId: string, date: string): number {
  const isToday = date === todayStr();
  return entriesFor(memberId, date).reduce(
    (sum, e) => sum + entryWorkedMinutes(e, isToday ? nowHm() : undefined),
    0
  );
}

export function breakMinutesOn(memberId: string, date: string): number {
  return entriesFor(memberId, date).reduce((sum, e) => sum + entryBreakMinutes(e), 0);
}

export function isHoliday(date: string): string | null {
  const h = db().holidays.find((x) => x.date === date);
  return h ? h.name : null;
}

export function leaveOn(memberId: string, date: string) {
  return db().leaveRequests.find(
    (lr) =>
      lr.memberId === memberId &&
      lr.status === "approved" &&
      lr.startDate <= date &&
      lr.endDate >= date
  );
}

export type DayStatus =
  | "worked" | "clocked-in" | "absent" | "holiday" | "leave" | "off" | "future" | "none";

export interface DayCell {
  date: string;
  inMonth: boolean;
  workedMinutes: number;
  status: DayStatus;
  holidayName: string | null;
  leavePolicyId: string | null;
  entryCount: number;
}

export function dayCell(memberId: string, date: string, refMonth?: string): DayCell {
  const today = todayStr();
  const entries = entriesFor(memberId, date);
  const worked = workedMinutesOn(memberId, date);
  const holidayName = isHoliday(date);
  const leave = leaveOn(memberId, date);
  let status: DayStatus = "none";
  if (entries.some((e) => e.clockOut === null)) status = "clocked-in";
  else if (worked > 0) status = "worked";
  else if (holidayName) status = "holiday";
  else if (leave) status = "leave";
  else if (date > today) status = "future";
  else if (mondayIndex(date) === 6) status = "off";
  else status = "absent";
  return {
    date,
    inMonth: refMonth ? isSameMonth(date, refMonth) : true,
    workedMinutes: worked,
    status,
    holidayName,
    leavePolicyId: leave?.policyId ?? null,
    entryCount: entries.length,
  };
}

export interface WeekRow {
  days: DayCell[];
  weekTotalMinutes: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM-01
  weeks: WeekRow[];
  monthTotalMinutes: number;
}

export function monthlySummary(memberId: string, month: string): MonthlySummary {
  const first = startOfMonth(month);
  const gridStart = startOfWeek(first);
  const lastDay = addDays(first, daysInMonth(first) - 1);
  const weeks: WeekRow[] = [];
  let monthTotal = 0;
  let cursor = gridStart;
  while (cursor <= lastDay) {
    const days: DayCell[] = [];
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const cell = dayCell(memberId, cursor, first);
      days.push(cell);
      weekTotal += cell.workedMinutes;
      if (cell.inMonth) monthTotal += cell.workedMinutes;
      cursor = addDays(cursor, 1);
    }
    weeks.push({ days, weekTotalMinutes: weekTotal });
  }
  return { month: first, weeks, monthTotalMinutes: monthTotal };
}

export interface WeeklyMemberRow {
  memberId: string;
  days: DayCell[];
  totalMinutes: number;
}

export function weeklySummary(weekStart: string, memberIds: string[]): WeeklyMemberRow[] {
  return memberIds.map((memberId) => {
    const days: DayCell[] = [];
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const cell = dayCell(memberId, addDays(weekStart, i));
      days.push(cell);
      total += cell.workedMinutes;
    }
    return { memberId, days, totalMinutes: total };
  });
}

export interface DailyEntryView extends TimeEntry {
  workedMinutes: number;
  breakMinutes: number;
}

export function dailyEntries(memberId: string, date: string): DailyEntryView[] {
  const isToday = date === todayStr();
  return entriesFor(memberId, date).map((e) => ({
    ...e,
    workedMinutes: entryWorkedMinutes(e, isToday ? nowHm() : undefined),
    breakMinutes: entryBreakMinutes(e),
  }));
}

export function clockedInMembers(): { memberId: string; since: string }[] {
  const today = todayStr();
  return db()
    .entries.filter((e) => e.date === today && e.clockOut === null)
    .map((e) => ({ memberId: e.memberId, since: e.clockIn }));
}

export function trackedTimeReport(from: string, to: string) {
  const database = db();
  const days: {
    date: string;
    totalMinutes: number;
    billable: number;
    members: { memberId: string; minutes: number; billable: number }[];
  }[] = [];
  const byActivity = new Map<string, number>();
  let cursor = from;
  let grandTotal = 0;
  while (cursor <= to) {
    const perMember = new Map<string, number>();
    for (const e of database.entries.filter((x) => x.date === cursor)) {
      const mins = entryWorkedMinutes(e);
      perMember.set(e.memberId, (perMember.get(e.memberId) ?? 0) + mins);
      const key = e.activityId ?? "none";
      byActivity.set(key, (byActivity.get(key) ?? 0) + mins);
    }
    const members = Array.from(perMember.entries()).map(([memberId, minutes]) => {
      const rate = database.members.find((m) => m.id === memberId)?.billableRate ?? 0;
      return { memberId, minutes, billable: Math.round((minutes * rate) / 60) };
    });
    const totalMinutes = members.reduce((s, m) => s + m.minutes, 0);
    grandTotal += totalMinutes;
    if (members.length > 0) {
      days.push({
        date: cursor,
        totalMinutes,
        billable: members.reduce((s, m) => s + m.billable, 0),
        members: members.sort((a, b) => b.minutes - a.minutes),
      });
    }
    cursor = addDays(cursor, 1);
  }
  return {
    days,
    grandTotalMinutes: grandTotal,
    activities: Array.from(byActivity.entries()).map(([activityId, minutes]) => ({ activityId, minutes })),
  };
}

export { addMonths };
