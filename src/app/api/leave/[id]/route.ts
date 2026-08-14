import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lr = db().leaveRequests.find((x) => x.id === params.id);
  if (!lr) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  const body = await req.json();
  if (body.status && ["pending", "approved", "rejected"].includes(body.status)) {
    lr.status = body.status;
  }
  return NextResponse.json(lr);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const database = db();
  const idx = database.leaveRequests.findIndex((x) => x.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  database.leaveRequests.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
