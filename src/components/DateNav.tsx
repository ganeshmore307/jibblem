"use client";

import { useRouter } from "next/navigation";
import { addDays, formatLongDate, todayStr } from "@/lib/time";

export default function DateNav({ date, basePath }: { date: string; basePath: string }) {
  const router = useRouter();
  function go(d: string) {
    router.push(`${basePath}/${d}`);
  }
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white border-b border-line">
      <button onClick={() => go(addDays(date, -1))} aria-label="Previous day" className="p-1.5 rounded-lg hover:bg-gray-100">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => e.target.value && go(e.target.value)}
        className="text-sm font-bold border border-line rounded-lg px-2 py-1.5 bg-white"
        aria-label="Pick date"
      />
      <button onClick={() => go(addDays(date, 1))} aria-label="Next day" className="p-1.5 rounded-lg hover:bg-gray-100">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button onClick={() => go(todayStr())} className="text-xs font-bold text-brand hover:underline px-2">Today</button>
      <div className="text-sm font-extrabold hidden md:block">{formatLongDate(date)}</div>
    </div>
  );
}
