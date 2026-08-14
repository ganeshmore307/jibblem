import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const org = db().org;
  if (body.name !== undefined) {
    if (!String(body.name).trim())
      return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
    org.name = String(body.name).trim();
  }
  for (const key of ["country", "startWeekOn", "startMonth", "timeFormat", "timezone", "durationFormat", "currency", "language", "geofenceUnit"] as const) {
    if (body[key] !== undefined) (org as unknown as Record<string, unknown>)[key] = body[key];
  }
  return NextResponse.json(org);
}
