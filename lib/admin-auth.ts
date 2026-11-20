import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { isAdminEmail } from "@/lib/admin-email";

/**
 * The admin session: an httpOnly cookie holding a Firebase session cookie, made only after the
 * server has checked the Google sign-in belongs to ADMIN_EMAIL. Every admin page, action and
 * route checks it here, so the browser can't skip the check.
 */
export const ADMIN_COOKIE = "navaras_admin";
export const SESSION_DAYS = 5;

/** The signed-in admin, or null for anyone else. Revoked or expired sessions don't count. */
export async function getAdmin(): Promise<{ email: string } | null> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(value, true);
    return isAdminEmail(decoded.email, decoded.email_verified) ? { email: decoded.email! } : null;
  } catch {
    return null;
  }
}

export class NotAdminError extends Error {
  constructor() {
    super("Only the Navaras admin can do this. Please sign in again.");
  }
}

/** Stops any admin action that isn't from the admin. */
export async function requireAdmin() {
  if (!(await getAdmin())) throw new NotAdminError();
}
