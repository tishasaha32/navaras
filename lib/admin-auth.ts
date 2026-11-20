import { cookies } from "next/headers";
import { cache } from "react";
import { adminAuth } from "@/lib/firebase-admin";
import { isAdminEmail } from "@/lib/admin-email";

/**
 * The admin session: an httpOnly cookie holding a Firebase session cookie, made only after the
 * server has checked the Google sign-in belongs to ADMIN_EMAIL. Every admin page, action and
 * route checks it here, so the browser can't skip the check.
 */
export const ADMIN_COOKIE = "navaras_admin";
export const SESSION_DAYS = 5;

async function check(checkRevoked: boolean): Promise<{ email: string } | null> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(value, checkRevoked);
    return isAdminEmail(decoded.email, decoded.email_verified) ? { email: decoded.email! } : null;
  } catch {
    return null;
  }
}

/**
 * The signed-in admin, or null for anyone else. For showing pages: the session's signature and
 * expiry are checked here on the server, and the result is shared by everything in one request.
 */
export const getAdmin = cache(() => check(false));

export class NotAdminError extends Error {
  constructor() {
    super("Only the Navaras admin can do this. Please sign in again.");
  }
}

/** Stops any admin action that isn't from the admin. Changes also ask Firebase whether the session was revoked. */
export async function requireAdmin() {
  if (!(await check(true))) throw new NotAdminError();
}
