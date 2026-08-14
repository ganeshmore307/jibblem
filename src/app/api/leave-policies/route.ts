import { NextRequest, NextResponse } from "next/server";
import { db, nextId } from "@/lib/data/store";
import { currentMember } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const me = currentMember();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Policy name is required." }, { status: 400 });
  const daysPerYear = Number(body.daysPerYear ?? 0) || 0;
  const policy = {
    id: nextId("lp"),
    name,
    compensation: (body.compensation === "unpaid" ? "unpaid" : "paid") as "paid" | "unpaid",
    units: "days" as const,
    accrual: daysPerYear > 0 ? `${daysPerYear} days / year` : "No accrual",
    daysPerYear,
    archived: false,
  };
  db().leavePolicies.push(policy);
  return NextResponse.json(policy, { status: 201 });
}
