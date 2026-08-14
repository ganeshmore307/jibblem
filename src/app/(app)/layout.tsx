import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/data/store";
import { entriesFor } from "@/lib/data/timesheets";
import { formatClock, todayStr } from "@/lib/time";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const me = currentMember();
  if (!me) redirect("/login");

  const today = todayStr();
  const entries = entriesFor(me.id, today);
  const open = entries.find((e) => e.clockOut === null);
  const lastBreak = open?.breaks[open.breaks.length - 1];
  const onBreak = Boolean(lastBreak && lastBreak.start === lastBreak.end);
  const lastClosed = [...entries].reverse().find((e) => e.clockOut !== null);

  return (
    <AppShell
      user={{ id: me.id, name: me.name, role: me.role, avatarColor: me.avatarColor, orgName: db().org.name }}
      clock={{
        clockedIn: Boolean(open),
        since: open?.clockIn ?? null,
        onBreak,
        lastOutLabel: lastClosed?.clockOut ? `Last out ${formatClock(lastClosed.clockOut)}` : null,
      }}
    >
      {children}
    </AppShell>
  );
}
