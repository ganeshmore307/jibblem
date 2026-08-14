"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Group, Member } from "@/lib/types";
import { relativeTime, todayStr } from "@/lib/time";
import { Avatar, Badge, Drawer, FieldError, btnGhost, btnPrimary, inputCls } from "@/components/ui";

const PAGE_SIZE = 8;

type SortKey = "name" | "role" | "group";

export default function PeopleTable({ members, groups }: { members: Member[]; groups: Group[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", role: "member", groupId: "", billableRate: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    let list = members.filter((m) => (showArchived ? true : !m.archived));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }
    if (groupFilter) list = list.filter((m) => m.groupId === groupFilter);
    if (roleFilter) list = list.filter((m) => m.role === roleFilter);
    list = [...list].sort((a, b) => {
      const val = (m: Member) =>
        sortKey === "name" ? m.name : sortKey === "role" ? m.role : groups.find((g) => g.id === m.groupId)?.name ?? "";
      return sortAsc ? val(a).localeCompare(val(b)) : val(b).localeCompare(val(a));
    });
    return list;
  }, [members, groups, search, groupFilter, roleFilter, showArchived, sortKey, sortAsc]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const profile = members.find((m) => m.id === profileId) ?? null;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  async function addMember() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        email: draft.email,
        role: draft.role,
        groupId: draft.groupId || null,
        billableRate: draft.billableRate ? Number(draft.billableRate) : 0,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Something went wrong." }));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setAdding(false);
    setDraft({ name: "", email: "", role: "member", groupId: "", billableRate: "" });
    router.refresh();
  }

  async function setArchived(member: Member, archived: boolean) {
    await fetch(`/api/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    setProfileId(null);
    router.refresh();
  }

  async function changeRole(member: Member, role: string) {
    await fetch(`/api/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.refresh();
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or email..."
          className="rounded-lg border border-line px-3 py-2 text-sm w-full sm:w-64 bg-white"
        />
        <select value={groupFilter} onChange={(e) => { setGroupFilter(e.target.value); setPage(1); }} className="rounded-lg border border-line px-2 py-2 text-sm bg-white">
          <option value="">All groups</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="rounded-lg border border-line px-2 py-2 text-sm bg-white">
          <option value="">All roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <button onClick={() => setAdding(true)} className={`${btnPrimary} ml-auto`}>+ Add member</button>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-line text-xs font-extrabold text-muted uppercase">
              <th className="text-left px-4 py-2.5 cursor-pointer" onClick={() => toggleSort("name")}>
                Member {sortKey === "name" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="text-left px-3 py-2.5 cursor-pointer" onClick={() => toggleSort("role")}>
                Role {sortKey === "role" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="text-left px-3 py-2.5 cursor-pointer" onClick={() => toggleSort("group")}>
                Group {sortKey === "group" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="text-left px-3 py-2.5">Last active</th>
              <th className="text-left px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No members match your filters.</td></tr>
            )}
            {pageRows.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <button onClick={() => setProfileId(m.id)} className="flex items-center gap-2 text-left">
                    <Avatar name={m.name} color={m.avatarColor} size={30} />
                    <div>
                      <div className="font-bold">{m.name}</div>
                      <div className="text-xs text-muted">{m.email}</div>
                    </div>
                  </button>
                </td>
                <td className="px-3 py-2.5 capitalize">
                  {m.role === "owner" ? (
                    <Badge tone="orange">Owner</Badge>
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value)}
                      className="rounded border border-line px-1.5 py-1 text-xs font-bold bg-white capitalize"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                    </select>
                  )}
                </td>
                <td className="px-3 py-2.5">{groups.find((g) => g.id === m.groupId)?.name ?? "—"}</td>
                <td className="px-3 py-2.5 text-muted">{relativeTime(m.lastActive)}</td>
                <td className="px-3 py-2.5">
                  {m.archived ? <Badge tone="red">Archived</Badge> : <Badge tone="green">Active</Badge>}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button onClick={() => setProfileId(m.id)} className="text-xs font-bold text-brand hover:underline">Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3 text-sm text-muted">
        <div>{filtered.length} member{filtered.length === 1 ? "" : "s"}</div>
        <div className="flex items-center gap-1">
          <button disabled={current <= 1} onClick={() => setPage(current - 1)} className="px-2 py-1 rounded border border-line bg-white disabled:opacity-40">Prev</button>
          <span className="px-2 font-bold">{current} / {pages}</span>
          <button disabled={current >= pages} onClick={() => setPage(current + 1)} className="px-2 py-1 rounded border border-line bg-white disabled:opacity-40">Next</button>
        </div>
      </div>

      {/* Profile drawer */}
      {profile && (
        <Drawer title="Member profile" onClose={() => setProfileId(null)}>
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={profile.name} color={profile.avatarColor} size={52} />
            <div>
              <div className="text-lg font-extrabold">{profile.name}</div>
              <div className="text-sm text-muted">{profile.email}</div>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-5">
            <div><dt className="text-xs font-bold text-muted uppercase">Role</dt><dd className="font-bold capitalize">{profile.role}</dd></div>
            <div><dt className="text-xs font-bold text-muted uppercase">Member code</dt><dd className="font-bold">{profile.memberCode}</dd></div>
            <div><dt className="text-xs font-bold text-muted uppercase">Group</dt><dd className="font-bold">{groups.find((g) => g.id === profile.groupId)?.name ?? "—"}</dd></div>
            <div><dt className="text-xs font-bold text-muted uppercase">Billable rate</dt><dd className="font-bold">{profile.billableRate > 0 ? `₹${profile.billableRate}/h` : "—"}</dd></div>
            <div><dt className="text-xs font-bold text-muted uppercase">Joined</dt><dd className="font-bold">{profile.joinDate}</dd></div>
            <div><dt className="text-xs font-bold text-muted uppercase">Timezone</dt><dd className="font-bold">{profile.timezone}</dd></div>
          </dl>
          <div className="space-y-2 mb-5">
            <Link href={`/timesheets/month/${todayStr()}?member=${profile.id}`} className="block rounded-lg border border-line px-3 py-2 text-sm font-bold hover:bg-gray-50">
              View timesheets →
            </Link>
            <Link href={`/attendance/${todayStr()}`} className="block rounded-lg border border-line px-3 py-2 text-sm font-bold hover:bg-gray-50">
              View attendance →
            </Link>
            <Link href={`/time-off?member=${profile.id}`} className="block rounded-lg border border-line px-3 py-2 text-sm font-bold hover:bg-gray-50">
              View time off →
            </Link>
          </div>
          {profile.role !== "owner" && (
            profile.archived ? (
              <button onClick={() => setArchived(profile, false)} className={btnGhost}>Restore member</button>
            ) : (
              <button onClick={() => setArchived(profile, true)} className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-bold px-4 py-2 hover:bg-red-100">
                Archive member
              </button>
            )
          )}
        </Drawer>
      )}

      {/* Add member drawer */}
      {adding && (
        <Drawer title="Add member" onClose={() => setAdding(false)}>
          <FieldError error={error} />
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Full name *</span>
            <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Priya Sharma" />
          </label>
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Email *</span>
            <input type="email" className={inputCls} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@company.com" />
          </label>
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Role</span>
            <select className={inputCls} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="text-sm block mb-3">
            <span className="font-bold block mb-1">Group</span>
            <select className={inputCls} value={draft.groupId} onChange={(e) => setDraft({ ...draft, groupId: e.target.value })}>
              <option value="">No group</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
          <label className="text-sm block mb-4">
            <span className="font-bold block mb-1">Billable rate (₹/hour)</span>
            <input type="number" min="0" className={inputCls} value={draft.billableRate} onChange={(e) => setDraft({ ...draft, billableRate: e.target.value })} placeholder="0" />
          </label>
          <div className="flex gap-2">
            <button onClick={addMember} disabled={busy} className={btnPrimary}>{busy ? "Adding..." : "Add member"}</button>
            <button onClick={() => setAdding(false)} className={btnGhost}>Cancel</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
