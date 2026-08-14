import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";
import { nowHm, todayStr } from "@/lib/time";

// POST { action: "in" | "out" | "break-start" | "break-end", activityId?, projectId?, note? }
export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const today = todayStr();
  const database = db();
  const open = database.entries.find(
    (e) => e.memberId === me.id && e.date === today && e.clockOut === null
  );

  if (body.action === "in") {
    if (open) return NextResponse.json({ error: "Already clocked in." }, { status: 400 });
    const entry = {
      id: nextId("e"),
      memberId: me.id,
      date: today,
      clockIn: nowHm(),
      clockOut: null,
      breaks: [],
      activityId: body.activityId ?? null,
      projectId: body.projectId ?? null,
      note: body.note ?? "",
      status: "pending" as const,
    };
    database.entries.push(entry);
    return NextResponse.json(entry);
  }

  if (!open) return NextResponse.json({ error: "Not clocked in." }, { status: 400 });

  if (body.action === "out") {
    open.clockOut = nowHm();
    return NextResponse.json(open);
  }
  if (body.action === "break-start") {
    open.breaks.push({ id: nextId("b"), start: nowHm(), end: nowHm() });
    return NextResponse.json(open);
  }
  if (body.action === "break-end") {
    const last = open.breaks[open.breaks.length - 1];
    if (last) last.end = nowHm();
    return NextResponse.json(open);
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
