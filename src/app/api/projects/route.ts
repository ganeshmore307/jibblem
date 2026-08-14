import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

const COLORS = ["#e8a15c", "#5cb47c", "#7c9be8", "#c77cb4", "#5cb4b4"];

export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  const database = db();
  const project = {
    id: nextId("p"),
    name,
    code: body.code || `${name.slice(0, 3).toUpperCase()}-${database.projects.length + 1}`,
    color: COLORS[database.projects.length % COLORS.length],
    clientId: body.clientId ?? null,
    archived: false,
  };
  database.projects.push(project);
  return NextResponse.json(project, { status: 201 });
}
