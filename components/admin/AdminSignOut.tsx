"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Ends the admin session, and the Google sign-in behind it. */
export default function AdminSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="adm-top__link"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/admin/session", { method: "DELETE" });
        const [{ auth }, { signOut }] = await Promise.all([import("@/lib/firebase"), import("firebase/auth")]);
        await signOut(auth);
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
