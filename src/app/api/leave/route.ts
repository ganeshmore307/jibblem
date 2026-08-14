import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const database = db();
  if (!body.memberId || !database.members.some((m) => m.id === body.memberId))
    return NextResponse.json({ error: "Member is required." }, { status: 400 });
  if (!body.policyId || !database.leavePolicies.some((p) => p.id === body.policyId))
    return NextResponse.json({ error: "Time off policy is required." }, { status: 400 });
  if (!body.startDate || !body.endDate)
    return NextResponse.json({ error: "Start and end dates are required." }, { status: 400 });
  if (body.endDate < body.startDate)
    return NextResponse.json({ error: "End date must be on or after start date." }, { status: 400 });

  const request = {
    id: nextId("lr"),
    memberId: body.memberId,
    policyId: body.policyId,
    startDate: body.startDate,
    endDate: body.endDate,
    halfDay: Boolean(body.halfDay),
    note: body.note ?? "",
    status: "pending" as const,
    requestedAt: new Date().toISOString(),
  };
  database.leaveRequests.push(request);
  return NextResponse.json(request, { status: 201 });
}
