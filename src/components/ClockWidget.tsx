"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatClock, todayStr } from "@/lib/time";

export interface ClockStatus {
  clockedIn: boolean;
  since: string | null; // HH:mm
  onBreak: boolean;
  lastOutLabel: string | null;
}

export default function ClockWidget({ initial, userId }: { initial: ClockStatus; userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: string) {
    setBusy(true);
    await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {initial.clockedIn ? (
        <>
          <Link
            href={`/timesheets/day/${todayStr()}?member=${userId}`}
            className="hidden sm:block text-xs text-muted hover:text-ink"
          >
            In since {initial.since ? formatClock(initial.since) : ""}
          </Link>
          {initial.onBreak ? (
            <button
              onClick={() => act("break-end")}
              disabled={busy}
              className="rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-bold px-3 py-1.5 disabled:opacity-60"
            >
              End break
            </button>
          ) : (
            <button
              onClick={() => act("break-start")}
              disabled={busy}
              className="rounded-full border border-line bg-white text-xs font-bold px-3 py-1.5 hover:bg-gray-50 disabled:opacity-60"
            >
              Break
            </button>
          )}
          <button
            onClick={() => act("out")}
            disabled={busy}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-1.5 disabled:opacity-60"
          >
            Clock out
          </button>
        </>
      ) : (
        <>
          {initial.lastOutLabel && (
            <Link
              href={`/timesheets/day/${todayStr()}?member=${userId}`}
              className="hidden sm:block text-xs text-muted hover:text-ink"
            >
              {initial.lastOutLabel}
            </Link>
          )}
          <button
            onClick={() => act("in")}
            disabled={busy}
            className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-1.5 disabled:opacity-60"
          >
            Clock in
          </button>
        </>
      )}
    </div>
  );
}
