import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-cookie";
import { COUNTDOWN_PATH, isLaunched } from "@/lib/launch";

/**
 * Before launch, every public page shows the countdown at its own address, so when the countdown
 * reloads at the launch moment the visitor lands on the page they asked for. The admin (anyone with
 * an admin session cookie) sees the real site, to check it before launch; the admin pages and the
 * files pages need are never held back. After launch this lets everything through.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const onCountdown = pathname === COUNTDOWN_PATH;

  if (isLaunched()) {
    return onCountdown ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }
  if (onCountdown || request.cookies.has(ADMIN_COOKIE)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = COUNTDOWN_PATH;
  url.search = "";
  const res = NextResponse.rewrite(url);
  // The same address will be the real page after launch, so nothing may keep this copy.
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  // Pages only: not Next's own files, the admin, uploaded or stored media, or any file with an extension.
  matcher: ["/((?!_next/|admin|images/|uploads/|videos/|.*\\..*).*)"],
};
