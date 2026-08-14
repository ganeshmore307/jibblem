import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Holiday name is required." }, { status: 400 });
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date))
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  const database = db();
  const holiday = {
    id: nextId("h"),
    calendarId: body.calendarId ?? database.holidayCalendars[0].id,
    name,
    date: body.date,
  };
  database.holidays.push(holiday);
  return NextResponse.json(holiday, { status: 201 });
}
