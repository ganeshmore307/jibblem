import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";
import { validateEntry } from "@/lib/validation";

// POST — add a manual time entry
export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.memberId || !db().members.some((m) => m.id === body.memberId))
    return NextResponse.json({ error: "Member is required." }, { status: 400 });
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date))
    return NextResponse.json({ error: "Date is required." }, { status: 400 });
  const err = validateEntry(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const entry = {
    id: nextId("e"),
    memberId: body.memberId,
    date: body.date,
    clockIn: body.clockIn,
    clockOut: body.clockOut ?? null,
    breaks: (body.breaks ?? []).map((b: { start: string; end: string }) => ({
      id: nextId("b"), start: b.start, end: b.end,
    })),
    activityId: body.activityId ?? null,
    projectId: body.projectId ?? null,
    note: body.note ?? "",
    status: "pending" as const,
  };
  db().entries.push(entry);
  return NextResponse.json(entry, { status: 201 });
}
