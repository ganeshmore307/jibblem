"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Avatar } from "@/components/ui";
import ClockWidget, { ClockStatus } from "@/components/ClockWidget";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

function icon(path: ReactNode) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
      {path}
    </svg>
  );
}

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: icon(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>) },
  { href: "/timesheets", label: "Timesheets", icon: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>) },
  { href: "/attendance", label: "Attendance", icon: icon(<><path d="M9 11l3 3 8-8" /><path d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11" /></>) },
  { href: "/time-off", label: "Time Off", icon: icon(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></>) },
  { href: "/reports", label: "Reports", icon: icon(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></>) },
  { href: "/invoices", label: "Invoices", icon: icon(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>) },
];

const SETTINGS_NAV: NavItem[] = [
  { href: "/people", label: "People", icon: icon(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 5a3.5 3.5 0 010 7M21.5 20a6.5 6.5 0 00-4-6" /></>) },
  { href: "/time-tracking", label: "Time Tracking", icon: icon(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></>) },
  { href: "/schedules", label: "Work Schedules", icon: icon(<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4M8 14h3" /></>) },
  { href: "/time-off-settings", label: "Time Off & Holidays", icon: icon(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M12 11v5M9.5 13.5h5" /></>) },
  { href: "/locations", label: "Locations", icon: icon(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" /><circle cx="12" cy="10" r="3" /></>) },
  { href: "/activities", label: "Activities & Projects", icon: icon(<><path d="M20.6 13.4L11 3.8a2 2 0 00-1.4-.6H4a1 1 0 00-1 1v5.6c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 002.8 0l4.6-4.6a2 2 0 000-2.8z" /><circle cx="7.5" cy="7.5" r="1" /></>) },
  { href: "/organization", label: "Organization", icon: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></>) },
  { href: "/integrations", label: "Integrations", icon: icon(<><path d="M9 3h6v6H9zM3 15h6v6H3zM15 15h6v6h-6zM12 9v3M6 15v-3h12v3" /></>) },
];

const TITLES: Array<[string, string]> = [
  ["/dashboard", "Dashboard"],
  ["/timesheets", "Timesheets"],
  ["/attendance", "Attendance"],
  ["/time-off-settings", "Time Off & Holidays"],
  ["/time-off", "Time Off"],
  ["/reports", "Reports"],
  ["/invoices", "Invoices"],
  ["/people", "People"],
  ["/time-tracking", "Time Tracking"],
  ["/schedules", "Work Schedules"],
  ["/locations", "Locations"],
  ["/activities", "Activities & Projects"],
  ["/organization", "Organization"],
  ["/integrations", "Integrations"],
];

export default function AppShell({
  children,
  user,
  clock,
}: {
  children: ReactNode;
  user: { id: string; name: string; role: string; avatarColor: string; orgName: string };
  clock: ClockStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "TrackDeck";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <div className="flex flex-col h-full">
      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4">
        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white font-extrabold">T</div>
        {!collapsed && <span className="text-lg font-extrabold">TrackDeck</span>}
      </Link>
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
        {MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold mb-0.5 ${
              pathname.startsWith(item.href)
                ? "bg-brand-light text-brand-dark"
                : "text-ink/70 hover:bg-gray-100"
            }`}
            title={item.label}
          >
            {item.icon}
            {!collapsed && item.label}
          </Link>
        ))}
        {!collapsed && (
          <div className="px-3 pt-4 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-muted">Settings</div>
        )}
        {collapsed && <div className="border-t border-line my-3" />}
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold mb-0.5 ${
              pathname.startsWith(item.href)
                ? "bg-brand-light text-brand-dark"
                : "text-ink/70 hover:bg-gray-100"
            }`}
            title={item.label}
          >
            {item.icon}
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2">
          <Avatar name={user.name} color={user.avatarColor} size={32} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate">{user.name}</div>
              <div className="text-xs text-muted truncate">{user.orgName}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} title="Sign out" className="text-muted hover:text-ink p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-2 text-xs font-bold text-muted hover:text-ink mt-3 px-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={collapsed ? "rotate-180" : ""}>
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </svg>
          {!collapsed && "COLLAPSE"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:block ${collapsed ? "w-16" : "w-60"} bg-white border-r border-line shrink-0 sticky top-0 h-screen transition-all`}>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-drawer">{nav}</aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-white border-b border-line px-4 py-2.5 flex items-center gap-3">
          <button className="lg:hidden text-ink p-1" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <h1 className="font-extrabold text-lg truncate">{title}</h1>
          <div className="ml-auto">
            <ClockWidget initial={clock} userId={user.id} />
          </div>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
