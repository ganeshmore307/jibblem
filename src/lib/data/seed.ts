import {
  Activity, Client, Group, Holiday, HolidayCalendar, Invoice, LeavePolicy,
  LeaveRequest, Location, Member, OrgSettings, Project, TimeEntry,
  TrackingPolicies, WorkSchedule,
} from "@/lib/types";
import { addDays, minutesToHm, mondayIndex, todayStr } from "@/lib/time";

// Deterministic PRNG so the demo dataset is stable across restarts.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260814);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const AVATAR_COLORS = ["#e8887c", "#7cb47c", "#7c9be8", "#c77cb4", "#8a6f5c", "#5cb4b4", "#b4a05c", "#9b7ce8", "#e8b47c", "#5c8ab4", "#b45c7c"];

export interface Database {
  members: Member[];
  groups: Group[];
  activities: Activity[];
  projects: Project[];
  clients: Client[];
  entries: TimeEntry[];
  leavePolicies: LeavePolicy[];
  leaveRequests: LeaveRequest[];
  holidayCalendars: HolidayCalendar[];
  holidays: Holiday[];
  schedules: WorkSchedule[];
  locations: Location[];
  invoices: Invoice[];
  org: OrgSettings;
  policies: TrackingPolicies;
}

export function buildDatabase(): Database {
  const memberDefs: Array<[string, string, Member["role"], number]> = [
    ["Kiran Vashi", "kiran@upscaledemo.com", "owner", 0],
    ["Nihal Kadam", "nihal@upscaledemo.com", "member", 48],
    ["Gaurav Mane", "gaurav@upscaledemo.com", "member", 61],
    ["Shreyas Yadav", "shreyas@upscaledemo.com", "member", 61],
    ["Dnyanesh Patil", "dnyanesh@upscaledemo.com", "member", 0],
    ["Sameer Shaikh", "sameer@upscaledemo.com", "member", 61],
    ["Bhushan Sonar", "bhushan@upscaledemo.com", "member", 0],
    ["Vaishali Joshi", "vaishali@upscaledemo.com", "member", 0],
    ["Sanika More", "sanika@upscaledemo.com", "member", 0],
    ["Omkar Wagle", "omkar@upscaledemo.com", "manager", 55],
    ["Sahil Naik", "sahil@upscaledemo.com", "member", 45],
  ];

  const members: Member[] = memberDefs.map(([name, email, role, rate], i) => ({
    id: `m${i + 1}`,
    name,
    email,
    phone: `+91 90${String(10000000 + i * 111111).slice(0, 8)}`,
    role,
    memberCode: `${name.split(" ").map((p) => p[0]).join("")}-${i + 1}`,
    billableRate: rate,
    joinDate: addDays(todayStr(), -randInt(30, 400)),
    timezone: "Asia/Calcutta (GMT+5:30)",
    groupId: i >= 1 && i <= 5 ? "g1" : i >= 6 && i <= 8 ? "g2" : null,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    archived: false,
    lastActive: new Date(Date.now() - randInt(10, 4000) * 60000).toISOString(),
  }));

  const groups: Group[] = [
    { id: "g1", name: "Marketing", description: "Performance marketing team", memberIds: members.filter((m) => m.groupId === "g1").map((m) => m.id) },
    { id: "g2", name: "Operations", description: "Ops & support team", memberIds: members.filter((m) => m.groupId === "g2").map((m) => m.id) },
  ];

  const activities: Activity[] = [
    { id: "a1", name: "Accounting", code: "ACC-1", color: "#e8887c", description: "", billable: true, archived: false },
    { id: "a2", name: "Admin Work", code: "ADM-1", color: "#7cb47c", description: "", billable: true, archived: false },
    { id: "a3", name: "Company Work", code: "CMP-1", color: "#7c9be8", description: "", billable: true, archived: false },
    { id: "a4", name: "Coordination", code: "CRD-1", color: "#c77cb4", description: "", billable: false, archived: false },
    { id: "a5", name: "Learning", code: "LRN-1", color: "#8a6f5c", description: "", billable: false, archived: false },
    { id: "a6", name: "Personal Task", code: "PSN-1", color: "#5cb4b4", description: "", billable: false, archived: false },
    { id: "a7", name: "Sales Call", code: "SLS-1", color: "#5c8ab4", description: "", billable: true, archived: false },
  ];

  const clients: Client[] = [
    { id: "c1", name: "Acme Retail" },
    { id: "c2", name: "Bluebird Media" },
  ];

  const projects: Project[] = [
    { id: "p1", name: "Website Revamp", code: "WEB-1", color: "#e8a15c", clientId: "c1", archived: false },
    { id: "p2", name: "Ad Campaigns", code: "ADS-1", color: "#5cb47c", clientId: "c2", archived: false },
    { id: "p3", name: "Internal Tools", code: "INT-1", color: "#7c9be8", clientId: null, archived: false },
  ];

  // ---- Holidays (public holiday calendar, 2025-2027) ----
  const holidayCalendars: HolidayCalendar[] = [
    { id: "hc1", name: "National Calendar (India)", isDefault: true },
  ];
  const holidayDefs: Array<[string, string]> = [
    ["2025-01-26", "Republic Day"], ["2025-03-14", "Holi"], ["2025-04-18", "Good Friday"],
    ["2025-05-12", "Buddha Purnima"], ["2025-08-15", "Independence Day"], ["2025-10-02", "Gandhi Jayanti"],
    ["2025-10-21", "Diwali"], ["2025-12-25", "Christmas"],
    ["2026-01-26", "Republic Day"], ["2026-03-04", "Holi"], ["2026-03-26", "Rama Navami"],
    ["2026-04-03", "Good Friday"], ["2026-05-01", "Buddha Purnima"], ["2026-08-15", "Independence Day"],
    ["2026-09-04", "Janmashtami"], ["2026-10-02", "Gandhi Jayanti"], ["2026-10-20", "Dussehra"],
    ["2026-11-08", "Diwali"], ["2026-11-24", "Guru Nanak Jayanti"], ["2026-12-25", "Christmas"],
    ["2027-01-26", "Republic Day"], ["2027-03-22", "Holi"], ["2027-03-26", "Good Friday"],
    ["2027-08-15", "Independence Day"], ["2027-10-02", "Gandhi Jayanti"], ["2027-10-29", "Diwali"],
    ["2027-12-25", "Christmas"],
  ];
  const holidays: Holiday[] = holidayDefs.map(([date, name], i) => ({
    id: `h${i + 1}`, calendarId: "hc1", name, date,
  }));
  const holidaySet = new Set(holidayDefs.map(([d]) => d));

  // ---- Time entries: last ~120 days for every member ----
  const entries: TimeEntry[] = [];
  let entryId = 1;
  const today = todayStr();
  for (const member of members) {
    for (let back = 120; back >= 0; back--) {
      const date = addDays(today, -back);
      if (date < member.joinDate) continue;
      const dow = mondayIndex(date); // 0=Mon..6=Sun
      if (dow === 6) continue; // Sunday off
      if (holidaySet.has(date)) continue;
      if (rand() < (dow === 5 ? 0.45 : 0.07)) continue; // absences, most Saturdays off
      // Owner rarely clocks in
      if (member.role === "owner" && rand() < 0.8) continue;

      const startMins = 9 * 60 + randInt(-20, 50); // ~around 09:00
      const workMins = randInt(7 * 60, 9 * 60 + 30);
      const breakLen = pick([30, 45, 60]);
      const breakStart = startMins + randInt(3 * 60, 4 * 60);
      const endMins = startMins + workMins + breakLen;
      const isToday = back === 0;
      const stillIn = isToday && rand() < 0.4;

      entries.push({
        id: `e${entryId++}`,
        memberId: member.id,
        date,
        clockIn: minutesToHm(startMins),
        clockOut: stillIn ? null : minutesToHm(Math.min(endMins, 23 * 60 + 59)),
        breaks: stillIn
          ? []
          : [{ id: `b${entryId}`, start: minutesToHm(breakStart), end: minutesToHm(breakStart + breakLen) }],
        activityId: pick(activities).id,
        projectId: rand() < 0.5 ? pick(projects).id : null,
        note: rand() < 0.12 ? pick(["Client follow-ups", "Campaign review", "Sprint work", "Reporting"]) : "",
        status: back > 7 ? "approved" : "pending",
      });
    }
  }

  const leavePolicies: LeavePolicy[] = [
    { id: "lp1", name: "Annual Leave", compensation: "paid", units: "days", accrual: "12 days / year", daysPerYear: 12, archived: false },
    { id: "lp2", name: "Sick Leave", compensation: "paid", units: "days", accrual: "8 days / year", daysPerYear: 8, archived: false },
    { id: "lp3", name: "Unpaid Leave", compensation: "unpaid", units: "days", accrual: "No accrual", daysPerYear: 0, archived: false },
  ];

  const leaveRequests: LeaveRequest[] = [];
  let lrId = 1;
  for (const member of members) {
    if (member.role === "owner") continue;
    const count = randInt(1, 3);
    for (let i = 0; i < count; i++) {
      const start = addDays(today, randInt(-60, 30));
      const len = randInt(0, 2);
      leaveRequests.push({
        id: `lr${lrId++}`,
        memberId: member.id,
        policyId: pick(leavePolicies).id,
        startDate: start,
        endDate: addDays(start, len),
        halfDay: len === 0 && rand() < 0.3,
        note: pick(["Family function", "Medical appointment", "Personal errand", "Travelling", ""]),
        status: start < today ? pick(["approved", "approved", "rejected"] as const) : pick(["pending", "approved"] as const),
        requestedAt: new Date(Date.now() - randInt(1000, 90000) * 60000).toISOString(),
      });
    }
  }

  const schedules: WorkSchedule[] = [
    {
      id: "ws1", name: "Default Work Schedule", isDefault: true, arrangement: "weekly",
      days: [0, 1, 2, 3, 4, 5], dailyStart: "09:00", dailyEnd: "18:00", hoursPerWeek: 54, splitAt: "00:00",
    },
  ];

  const locations: Location[] = [
    {
      id: "loc1", name: "Head Office - Nashik",
      address: "Shop 18, Link Rd, Ramkrishna Nagar, Nashik, Maharashtra 422003, India",
      radius: 300, archived: false,
    },
  ];

  const invoices: Invoice[] = [
    { id: "inv1", number: "INV-0001", clientId: "c1", issueDate: addDays(today, -40), dueDate: addDays(today, -10), amount: 48500, status: "paid" },
    { id: "inv2", number: "INV-0002", clientId: "c2", issueDate: addDays(today, -12), dueDate: addDays(today, 18), amount: 36200, status: "sent" },
  ];

  const org: OrgSettings = {
    name: "UpscaleDemo",
    country: "India",
    startWeekOn: "monday",
    startMonth: "January",
    timeFormat: "12h",
    timezone: "Asia/Calcutta (GMT+5:30)",
    durationFormat: "XXh YYm",
    currency: "INR",
    language: "English",
    geofenceUnit: "meters",
  };

  const policies: TrackingPolicies = {
    devices: { mobile: true, kiosk: false, web: true, desktop: true },
    offlineMobile: true,
    faceRecognition: false,
    selfies: false,
    liveLocation: false,
    requireLocation: false,
    geofencing: false,
    requireActivity: true,
    requireProject: false,
    membersCanEditEntries: true,
    autoClockOut: false,
  };

  return {
    members, groups, activities, projects, clients, entries, leavePolicies,
    leaveRequests, holidayCalendars, holidays, schedules, locations, invoices, org, policies,
  };
}
