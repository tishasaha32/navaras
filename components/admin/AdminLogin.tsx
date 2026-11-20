"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_HOME } from "@/lib/admin-email";

/** Google sign-in for the admin. The server decides whether the account may come in. */
export default function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    const [{ auth }, { GoogleAuthProvider, signInWithPopup, signOut }] = await Promise.all([import("@/lib/firebase"), import("firebase/auth")]);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user } = await signInWithPopup(auth, provider);
      const res = await fetch("/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await user.getIdToken(true) }),
      });
      if (res.ok) {
        router.replace(ADMIN_HOME);
        router.refresh();
        return;
      }
      const { error } = (await res.json().catch(() => ({}))) as { error?: string };
      // Don't leave someone without admin access signed in by this attempt.
      await signOut(auth);
      setError(error ?? "That account can’t use the admin.");
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request" ? "Google sign-in was closed before it finished." : "Sign-in didn’t work. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <span className="adm-brand">
          <img src="/images/logo.png" alt="" />
          <span className="adm-brand__name">Navaras</span>
          <span className="adm-brand__tag">Admin</span>
        </span>
        <p>Sign in with the Navaras Google account to manage the site.</p>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => void signIn()} disabled={busy}>
          {busy ? "Signing in…" : "Sign in with Google"}
        </button>
        {error && (
          <p role="alert" className="adm-login__error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
