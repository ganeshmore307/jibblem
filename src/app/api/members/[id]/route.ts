import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const database = db();
  const member = database.members.find((m) => m.id === params.id);
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  const body = await req.json();
  if (body.name !== undefined) {
    if (!String(body.name).trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    member.name = String(body.name).trim();
  }
  if (body.phone !== undefined) member.phone = body.phone;
  if (body.role !== undefined) member.role = body.role;
  if (body.billableRate !== undefined) member.billableRate = Number(body.billableRate) || 0;
  if (body.timezone !== undefined) member.timezone = body.timezone;
  if (body.groupId !== undefined) {
    for (const g of database.groups) {
      g.memberIds = g.memberIds.filter((id) => id !== member.id);
    }
    member.groupId = body.groupId;
    if (body.groupId) {
      const g = database.groups.find((x) => x.id === body.groupId);
      if (g) g.memberIds.push(member.id);
    }
  }
  if (body.archived !== undefined) member.archived = Boolean(body.archived);
  return NextResponse.json(member);
}
