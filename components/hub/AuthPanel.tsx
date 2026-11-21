"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HUB_PATH } from "@/lib/content/hub";
import { LearnerError, useLearner } from "./LearnerProvider";

/** Only allow returning to pages on this site. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : `${HUB_PATH}/my-learning`;
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" style={{ color: "var(--rose-deep)", fontWeight: 600, fontSize: 14 }}>
      {message}
    </p>
  );
}

const headingStyle = { fontSize: 28, lineHeight: 1.1 };

export default function AuthPanel() {
  const params = useSearchParams();
  const router = useRouter();
  const { ready, learner, signInWithGoogle } = useLearner();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (ready && learner) router.replace(next);
  }, [ready, learner, next, router]);

  const logIn = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof LearnerError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Someone already logged in is on their way to `next`; never offer them the login options.
  if (!ready || learner) return <div className="auth-form" aria-busy="true" />;

  return (
    <div className="auth-form">
      <div className="auth-form__stack">
        <div className="auth-form__intro">
          <h2 style={headingStyle}>Welcome</h2>
          <p className="muted">Log in with your Google account. New here? Your free account is created the first time you log in.</p>
        </div>
        <FormError message={error} />
        <button type="button" className="btn btn--outline" disabled={busy} onClick={() => void logIn()}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
          </svg>
          {busy ? "Please wait…" : "Continue with Google"}
        </button>
      </div>
      <p className="muted auth-form__terms">
        By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy policy</a>.
      </p>
    </div>
  );
}
