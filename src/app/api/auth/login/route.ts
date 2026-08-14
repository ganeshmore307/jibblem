import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/store";
import { createSession, DEMO_PASSWORD, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const member = db().members.find(
    (m) => m.email.toLowerCase() === email.trim().toLowerCase() && !m.archived
  );
  if (!member || password !== DEMO_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const token = createSession(member.id);
  const res = NextResponse.json({ ok: true, memberId: member.id });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, path: "/", sameSite: "lax" });
  return res;
}
