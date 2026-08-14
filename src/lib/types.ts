export type Role = "owner" | "admin" | "manager" | "member";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  memberCode: string;
  billableRate: number; // per hour, in currency units
  joinDate: string; // YYYY-MM-DD
  timezone: string;
  groupId: string | null;
  avatarColor: string;
  archived: boolean;
  lastActive: string; // ISO datetime
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
}

export interface Activity {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  billable: boolean;
  archived: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  color: string;
  clientId: string | null;
  archived: boolean;
}

export interface Client {
  id: string;
  name: string;
}

export interface Break {
  id: string;
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface TimeEntry {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD (date of clock-in)
  clockIn: string; // HH:mm
  clockOut: string | null; // HH:mm, null = still clocked in
  breaks: Break[];
  activityId: string | null;
  projectId: string | null;
  note: string;
  status: "approved" | "pending";
}

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeavePolicy {
  id: string;
  name: string;
  compensation: "paid" | "unpaid";
  units: "days" | "hours";
  accrual: string;
  daysPerYear: number;
  archived: boolean;
}

export interface LeaveRequest {
  id: string;
  memberId: string;
  policyId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  halfDay: boolean;
  note: string;
  status: LeaveStatus;
  requestedAt: string;
}

export interface Holiday {
  id: string;
  calendarId: string;
  name: string;
  date: string; // YYYY-MM-DD
}

export interface HolidayCalendar {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface WorkSchedule {
  id: string;
  name: string;
  isDefault: boolean;
  arrangement: "weekly" | "flexible";
  days: number[]; // 0=Mon..6=Sun working days
  dailyStart: string; // HH:mm
  dailyEnd: string; // HH:mm
  hoursPerWeek: number;
  splitAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  radius: number;
  archived: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
}

export interface OrgSettings {
  name: string;
  country: string;
  startWeekOn: "monday" | "sunday";
  startMonth: string;
  timeFormat: "12h" | "24h";
  timezone: string;
  durationFormat: string;
  currency: string;
  language: string;
  geofenceUnit: "meters" | "feet";
}

export interface TrackingPolicies {
  devices: { mobile: boolean; kiosk: boolean; web: boolean; desktop: boolean };
  offlineMobile: boolean;
  faceRecognition: boolean;
  selfies: boolean;
  liveLocation: boolean;
  requireLocation: boolean;
  geofencing: boolean;
  requireActivity: boolean;
  requireProject: boolean;
  membersCanEditEntries: boolean;
  autoClockOut: boolean;
}

export interface Session {
  memberId: string;
  token: string;
}
