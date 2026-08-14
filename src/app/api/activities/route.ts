import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

const COLORS = ["#e8887c", "#7cb47c", "#7c9be8", "#c77cb4", "#8a6f5c", "#5cb4b4", "#5c8ab4"];

export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Activity name is required." }, { status: 400 });
  const database = db();
  const activity = {
    id: nextId("a"),
    name,
    code: body.code || `${name.slice(0, 3).toUpperCase()}-${database.activities.length + 1}`,
    color: COLORS[database.activities.length % COLORS.length],
    description: body.description ?? "",
    billable: Boolean(body.billable),
    archived: false,
  };
  database.activities.push(activity);
  return NextResponse.json(activity, { status: 201 });
}
