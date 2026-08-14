import { cookies } from "next/headers";
import { db } from "@/lib/data/store";
import { Member } from "@/lib/types";

const SESSION_COOKIE = "jibblem_session";
export const DEMO_PASSWORD = "demo1234";

const sessions = globalThis as unknown as { __jibblemSessions?: Map<string, string> };
function sessionMap(): Map<string, string> {
  if (!sessions.__jibblemSessions) sessions.__jibblemSessions = new Map();
  return sessions.__jibblemSessions;
}

export function createSession(memberId: string): string {
  const token = `${memberId}.${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  sessionMap().set(token, memberId);
  return token;
}

export function destroySession(token: string) {
  sessionMap().delete(token);
}

export function currentMember(): Member | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // Sessions live in memory; recover from the token prefix after server restarts.
  const memberId = sessionMap().get(token) ?? token.split(".")[0];
  const member = db().members.find((m) => m.id === memberId && !m.archived);
  return member ?? null;
}

export { SESSION_COOKIE };
