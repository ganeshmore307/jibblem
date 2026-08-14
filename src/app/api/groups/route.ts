import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Group name is required." }, { status: 400 });
  const group = { id: nextId("g"), name, description: body.description ?? "", memberIds: [] };
  db().groups.push(group);
  return NextResponse.json(group, { status: 201 });
}
