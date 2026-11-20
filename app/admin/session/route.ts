import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_DAYS } from "@/lib/admin-auth";
import { isAdminEmail } from "@/lib/admin-email";
import { adminAuth } from "@/lib/firebase-admin";

const MAX_AGE_S = SESSION_DAYS * 24 * 60 * 60;
/** A session is only made from a sign-in that has just happened. */
const FRESH_SIGN_IN_S = 5 * 60;

/** Signs the admin in: checks the Google sign-in's ID token and, for the admin's account only, sets the session cookie. */
export async function POST(req: Request) {
  const { idToken } = (await req.json().catch(() => ({}))) as { idToken?: unknown };
  if (typeof idToken !== "string" || !idToken) return NextResponse.json({ error: "Sign in with Google first." }, { status: 400 });

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "That sign-in couldn’t be checked. Please try again." }, { status: 401 });
  }
  if (!isAdminEmail(decoded.email, decoded.email_verified)) {
    return NextResponse.json({ error: "This Google account doesn’t have access to the Navaras admin." }, { status: 403 });
  }
  if (Date.now() / 1000 - decoded.auth_time > FRESH_SIGN_IN_S) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const session = await adminAuth().createSessionCookie(idToken, { expiresIn: MAX_AGE_S * 1000 });
  (await cookies()).set(ADMIN_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // Site-wide, so public pages can tell the admin's draft preview from anyone else's.
    path: "/",
    maxAge: MAX_AGE_S,
  });
  return NextResponse.json({ ok: true });
}

/** Signs the admin out of the admin. */
export async function DELETE() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/" });
  return NextResponse.json({ ok: true });
}
