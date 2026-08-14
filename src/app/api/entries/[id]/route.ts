import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";
import { validateEntry } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const entry = db().entries.find((e) => e.id === params.id);
  if (!entry) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  const body = await req.json();
  const merged = {
    clockIn: body.clockIn ?? entry.clockIn,
    clockOut: body.clockOut === undefined ? entry.clockOut : body.clockOut,
    breaks: body.breaks ?? entry.breaks,
  };
  const err = validateEntry(merged);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  entry.clockIn = merged.clockIn;
  entry.clockOut = merged.clockOut;
  if (body.breaks) {
    entry.breaks = body.breaks.map((b: { id?: string; start: string; end: string }) => ({
      id: b.id ?? nextId("b"), start: b.start, end: b.end,
    }));
  }
  if (body.activityId !== undefined) entry.activityId = body.activityId;
  if (body.projectId !== undefined) entry.projectId = body.projectId;
  if (body.note !== undefined) entry.note = body.note;
  if (body.status !== undefined) entry.status = body.status;
  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const database = db();
  const idx = database.entries.findIndex((e) => e.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  database.entries.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
