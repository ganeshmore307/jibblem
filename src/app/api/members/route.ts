import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";
import { todayStr } from "@/lib/time";

const COLORS = ["#e8887c", "#7cb47c", "#7c9be8", "#c77cb4", "#8a6f5c", "#5cb4b4", "#b4a05c"];

export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  const database = db();
  if (database.members.some((m) => m.email === email))
    return NextResponse.json({ error: "A member with this email already exists." }, { status: 400 });
  const member = {
    id: nextId("m"),
    name,
    email,
    phone: body.phone ?? "",
    role: (body.role ?? "member") as "member" | "manager" | "admin" | "owner",
    memberCode: `${name.split(" ").map((p: string) => p[0]).join("").toUpperCase()}-${database.members.length + 1}`,
    billableRate: Number(body.billableRate ?? 0) || 0,
    joinDate: todayStr(),
    timezone: database.org.timezone,
    groupId: body.groupId ?? null,
    avatarColor: COLORS[database.members.length % COLORS.length],
    archived: false,
    lastActive: new Date().toISOString(),
  };
  database.members.push(member);
  if (member.groupId) {
    const g = database.groups.find((x) => x.id === member.groupId);
    if (g) g.memberIds.push(member.id);
  }
  return NextResponse.json(member, { status: 201 });
}
