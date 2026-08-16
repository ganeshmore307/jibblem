"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrackingPolicies } from "@/lib/types";
import { Toggle } from "@/components/ui";

export default function PoliciesForm({ policies }: { policies: TrackingPolicies }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function patch(update: Record<string, unknown>) {
    setSaving(true);
    await fetch("/api/policies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-card p-5">
        <h2 className="font-extrabold mb-1">Devices</h2>
        <p className="text-sm text-muted mb-4">Choose which devices members can use to clock in and out.</p>
        <div className="space-y-3">
          <Toggle label="Web app" checked={policies.devices.web} onChange={(v) => patch({ devices: { web: v } })} />
          <Toggle label="Mobile app" checked={policies.devices.mobile} onChange={(v) => patch({ devices: { mobile: v } })} />
          <Toggle label="Shared kiosk" checked={policies.devices.kiosk} onChange={(v) => patch({ devices: { kiosk: v } })} />
          <Toggle label="Desktop app" checked={policies.devices.desktop} onChange={(v) => patch({ devices: { desktop: v } })} />
          <Toggle label="Offline mode on mobile" checked={policies.offlineMobile} onChange={(v) => patch({ offlineMobile: v })} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-5">
        <h2 className="font-extrabold mb-1">Location & verification</h2>
        <p className="text-sm text-muted mb-4">Control how time entries are verified.</p>
        <div className="space-y-3">
          <Toggle label="Face recognition on kiosk" checked={policies.faceRecognition} onChange={(v) => patch({ faceRecognition: v })} />
          <Toggle label="Require selfies when clocking in" checked={policies.selfies} onChange={(v) => patch({ selfies: v })} />
          <Toggle label="Track live location while clocked in" checked={policies.liveLocation} onChange={(v) => patch({ liveLocation: v })} />
          <Toggle label="Require location on clock in" checked={policies.requireLocation} onChange={(v) => patch({ requireLocation: v })} />
          <Toggle label="Restrict clock-ins to geofenced locations" checked={policies.geofencing} onChange={(v) => patch({ geofencing: v })} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-5">
        <h2 className="font-extrabold mb-1">Time entries</h2>
        <p className="text-sm text-muted mb-4">Rules applied when members track time.</p>
        <div className="space-y-3">
          <Toggle label="Require an activity when clocking in" checked={policies.requireActivity} onChange={(v) => patch({ requireActivity: v })} />
          <Toggle label="Require a project when clocking in" checked={policies.requireProject} onChange={(v) => patch({ requireProject: v })} />
          <Toggle label="Members can add and edit their own entries" checked={policies.membersCanEditEntries} onChange={(v) => patch({ membersCanEditEntries: v })} />
          <Toggle label="Automatically clock out at end of schedule" checked={policies.autoClockOut} onChange={(v) => patch({ autoClockOut: v })} />
        </div>
      </div>
      {saving && <div className="text-xs text-muted">Saving…</div>}
    </div>
  );
}
