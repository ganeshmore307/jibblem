import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const policies = db().policies;
  if (body.devices) Object.assign(policies.devices, body.devices);
  for (const key of ["offlineMobile", "faceRecognition", "selfies", "liveLocation", "requireLocation", "geofencing", "requireActivity", "requireProject", "membersCanEditEntries", "autoClockOut"] as const) {
    if (body[key] !== undefined) policies[key] = Boolean(body[key]);
  }
  return NextResponse.json(policies);
}
