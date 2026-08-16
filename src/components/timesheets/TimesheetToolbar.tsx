"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  addDays, addMonths, formatLongDate, monthYearLabel, startOfWeek, todayStr,
} from "@/lib/time";
import { Avatar } from "@/components/ui";

export interface MemberOption {
  id: string;
  name: string;
  avatarColor: string;
}

export default function TimesheetToolbar({
  view,
  date,
  memberId,
  members,
  showMember = true,
}: {
  view: "month" | "week" | "day";
  date: string;
  memberId: string;
  members: MemberOption[];
  showMember?: boolean;
}) {
  const router = useRouter();
  const [memberOpen, setMemberOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setMemberOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = members.find((m) => m.id === memberId) ?? members[0];
  const filtered = useMemo(
    () => members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [members, search]
  );

  function go(nextView: string, nextDate: string, nextMember: string) {
    router.push(`/timesheets/${nextView}/${nextDate}?member=${nextMember}`);
  }

  const label =
    view === "month"
      ? monthYearLabel(date)
      : view === "week"
        ? `Week of ${formatLongDate(startOfWeek(date)).split(", ")[1]}`
        : formatLongDate(date);

  function shift(dir: 1 | -1) {
    const next =
      view === "month" ? addMonths(date, dir) : view === "week" ? addDays(date, dir * 7) : addDays(date, dir);
    go(view, next, memberId);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white border-b border-line">
      {/* View switcher */}
      <div className="flex rounded-lg border border-line overflow-hidden">
        {(["day", "week", "month"] as const).map((v) => (
          <button
            key={v}
            onClick={() => go(v, date, memberId)}
            className={`px-3 py-1.5 text-xs font-bold capitalize ${
              v === view ? "bg-brand text-white" : "bg-white text-ink/70 hover:bg-gray-50"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Date nav */}
      <div className="flex items-center gap-1">
        <button onClick={() => shift(-1)} aria-label="Previous" className="p-1.5 rounded-lg hover:bg-gray-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && go(view, e.target.value, memberId)}
            className="text-sm font-bold border border-line rounded-lg px-2 py-1.5 bg-white"
            aria-label="Pick date"
          />
        </div>
        <button onClick={() => shift(1)} aria-label="Next" className="p-1.5 rounded-lg hover:bg-gray-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <button
          onClick={() => go(view, todayStr(), memberId)}
          className="text-xs font-bold text-brand hover:underline px-2"
        >
          Today
        </button>
      </div>

      <div className="text-sm font-extrabold hidden md:block">{label}</div>

      {/* Member selector */}
      {showMember && selected && (
        <div className="relative ml-auto" ref={popRef}>
          <button
            onClick={() => setMemberOpen(!memberOpen)}
            className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 hover:bg-gray-50"
          >
            <Avatar name={selected.name} color={selected.avatarColor} size={22} />
            <span className="text-sm font-bold">{selected.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {memberOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-drawer border border-line z-30 p-2">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full rounded-lg border border-line px-2 py-1.5 text-sm mb-2"
              />
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {filtered.length === 0 && <div className="text-sm text-muted p-2">No members found.</div>}
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMemberOpen(false);
                      setSearch("");
                      go(view, date, m.id);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-gray-50 ${
                      m.id === memberId ? "bg-brand-faint" : ""
                    }`}
                  >
                    <Avatar name={m.name} color={m.avatarColor} size={24} />
                    <span className="text-sm font-bold">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
