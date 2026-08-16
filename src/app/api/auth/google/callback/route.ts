import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/data/store";

const GOOGLE_STATE_COOKIE = "jibblem_google_oauth_state";

function baseUrl(req: NextRequest) {
  return (process.env.APP_URL || req.nextUrl.origin).replace(/\/$/, "");
}

function callbackUrl(req: NextRequest) {
  return process.env.GOOGLE_REDIRECT_URI || `${baseUrl(req)}/api/auth/google/callback`;
}

function loginError(req: NextRequest, code: string) {
  const res = NextResponse.redirect(`${baseUrl(req)}/login?google_error=${encodeURIComponent(code)}`);
  res.cookies.set(GOOGLE_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return loginError(req, "config");

  const error = req.nextUrl.searchParams.get("error");
  if (error) return loginError(req, "cancelled");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError(req, "state");
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl(req),
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    const token = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !token.access_token) return loginError(req, "token");

    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    const profile = (await profileRes.json()) as GoogleUserInfo;
    if (!profileRes.ok || !profile.email) return loginError(req, "profile");
    if (profile.email_verified !== true) return loginError(req, "unverified");

    const normalizedEmail = profile.email.trim().toLowerCase();
    const member = db().members.find(
      (item) => item.email.trim().toLowerCase() === normalizedEmail && !item.archived
    );
    if (!member) return loginError(req, "not_registered");

    const tokenValue = createSession(member.id);
    const res = NextResponse.redirect(`${baseUrl(req)}/dashboard`);
    res.cookies.set(SESSION_COOKIE, tokenValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    res.cookies.set(GOOGLE_STATE_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch {
    return loginError(req, "token");
  }
}
