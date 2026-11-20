"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Auth } from "firebase/auth";
import Header from "@/components/Header";
import { isAdminEmail } from "@/lib/admin-email";
import { HUB_PATH } from "@/lib/content/hub";

type NavLink = { href: string; label: string };

/** The Hub sign-in, coming back here afterwards. */
const loginHref = (next: string) => `${HUB_PATH}/login?next=${encodeURIComponent(next)}`;

/**
 * The header for the main site: Log out for a signed-in Hub learner, Log in for everyone else,
 * and the Admin link only for the admin's account.
 * Firebase is loaded after the page appears, so it stays out of the pages' main bundle.
 */
export default function MainHeader({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [auth, setAuth] = useState<Auth | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([import("@/lib/firebase"), import("firebase/auth")]);
      if (cancelled) return;
      setAuth(auth);
      stop = onAuthStateChanged(auth, (user) => {
        setSignedIn(Boolean(user));
        setAdmin(isAdminEmail(user?.email, user?.emailVerified));
      });
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  const signOut = async () => {
    if (!auth) return;
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
  };

  return (
    <Header
      links={links}
      cta={signedIn === false ? { href: loginHref(pathname), label: "Log in" } : undefined}
      onSignOut={signedIn ? () => void signOut() : undefined}
      showAdmin={admin}
    />
  );
}
