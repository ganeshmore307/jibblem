"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Activity, Client, Project } from "@/lib/types";
import { Badge, Drawer, FieldError, btnGhost, btnPrimary, inputCls } from "@/components/ui";

type Tab = "activities" | "projects" | "clients";

export default function ActivitiesView({
  activities,
  projects,
  clients,
}: {
  activities: Activity[];
  projects: Project[];
  clients: Client[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("activities");
  const [adding, setAdding] = useState<null | "activity" | "project">(null);
  const [draft, setDraft] = useState({ name: "", billable: false, clientId: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    setError(null);
    const url = adding === "activity" ? "/api/activities" : "/api/projects";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adding === "activity"
        ? { name: draft.name, billable: draft.billable }
        : { name: draft.name, clientId: draft.clientId || null }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Something went wrong." }));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setAdding(null);
    setDraft({ name: "", billable: false, clientId: "" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg border border-line overflow-hidden">
          {(["activities", "projects", "clients"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-bold capitalize ${t === tab ? "bg-brand text-white" : "bg-white text-ink/70 hover:bg-gray-50"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab !== "clients" && (
          <button
            onClick={() => { setError(null); setAdding(tab === "activities" ? "activity" : "project"); }}
            className={`${btnPrimary} ml-auto`}
          >
            + Add {tab === "activities" ? "activity" : "project"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
        {tab === "activities" && (
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Activity</th>
                <th className="text-left px-3 py-2.5">Code</th>
                <th className="text-left px-3 py-2.5">Billable</th>
                <th className="text-left px-3 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                      {a.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted">{a.code}</td>
                  <td className="px-3 py-2.5">{a.billable ? <Badge tone="green">Billable</Badge> : <Badge>Non-billable</Badge>}</td>
                  <td className="px-3 py-2.5 text-muted max-w-[240px] truncate">{a.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "projects" && (
          <table className="w-full min-w-[440px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Project</th>
                <th className="text-left px-3 py-2.5">Code</th>
                <th className="text-left px-3 py-2.5">Client</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted">{p.code}</td>
                  <td className="px-3 py-2.5">{clients.find((c) => c.id === p.clientId)?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "clients" && (
          <table className="w-full min-w-[380px] text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
                <th className="text-left px-4 py-2.5">Client</th>
                <th className="text-left px-3 py-2.5">Projects</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold">{c.name}</td>
                  <td className="px-3 py-2.5 text-muted">
                    {projects.filter((p) => p.clientId === c.id).map((p) => p.name).join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {adding && (
        <Drawer title={adding === "activity" ? "Add activity" : "Add project"} onClose={() => setAdding(null)}>
          <FieldError error={error} />
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Name *</span>
            <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder={adding === "activity" ? "e.g. Code Review" : "e.g. Website Redesign"} />
          </label>
          {adding === "activity" ? (
            <label className="flex items-center gap-2 text-sm mb-4">
              <input type="checkbox" checked={draft.billable} onChange={(e) => setDraft({ ...draft, billable: e.target.checked })} />
              Billable
            </label>
          ) : (
            <label className="text-sm block mb-4">
              <span className="font-bold block mb-1">Client</span>
              <select className={inputCls} value={draft.clientId} onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}>
                <option value="">No client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}
          <div className="flex gap-2">
            <button onClick={add} disabled={busy} className={btnPrimary}>{busy ? "Adding..." : "Add"}</button>
            <button onClick={() => setAdding(null)} className={btnGhost}>Cancel</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
