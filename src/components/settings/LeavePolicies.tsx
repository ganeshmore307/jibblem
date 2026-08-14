"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LeavePolicy } from "@/lib/types";
import { Badge, Drawer, FieldError, btnGhost, btnPrimary, inputCls } from "@/components/ui";

export default function LeavePolicies({ policies }: { policies: LeavePolicy[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", compensation: "paid", daysPerYear: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/leave-policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, daysPerYear: draft.daysPerYear ? Number(draft.daysPerYear) : 0 }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Something went wrong." }));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setAdding(false);
    setDraft({ name: "", compensation: "paid", daysPerYear: "" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">Time off policies members can request against.</p>
        <button onClick={() => setAdding(true)} className={btnPrimary}>+ Add policy</button>
      </div>
      <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
              <th className="text-left px-4 py-2.5">Policy</th>
              <th className="text-left px-3 py-2.5">Compensation</th>
              <th className="text-left px-3 py-2.5">Accrual</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-bold">{p.name}</td>
                <td className="px-3 py-2.5">
                  <Badge tone={p.compensation === "paid" ? "green" : "gray"}>{p.compensation}</Badge>
                </td>
                <td className="px-3 py-2.5 text-muted">{p.accrual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <Drawer title="Add time off policy" onClose={() => setAdding(false)}>
          <FieldError error={error} />
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Policy name *</span>
            <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Parental Leave" />
          </label>
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Compensation</span>
            <select className={inputCls} value={draft.compensation} onChange={(e) => setDraft({ ...draft, compensation: e.target.value })}>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </label>
          <label className="text-sm block mb-4">
            <span className="font-bold block mb-1">Days per year</span>
            <input type="number" min="0" className={inputCls} value={draft.daysPerYear} onChange={(e) => setDraft({ ...draft, daysPerYear: e.target.value })} placeholder="0 for no accrual" />
          </label>
          <div className="flex gap-2">
            <button onClick={add} disabled={busy} className={btnPrimary}>{busy ? "Adding..." : "Add policy"}</button>
            <button onClick={() => setAdding(false)} className={btnGhost}>Cancel</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
