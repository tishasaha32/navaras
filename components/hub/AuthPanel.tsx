"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

/** Asks for a phone number, texts it a code, then checks the code. */
function PhoneForm({
  busy,
  error,
  run,
  onError,
  onBack,
}: {
  busy: boolean;
  error: string | null;
  run: (fn: () => Promise<void>) => Promise<void>;
  onError: (message: string | null) => void;
  onBack: () => void;
}) {
  const { sendPhoneCode } = useLearner();
  const recaptcha = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState<{ phone: string; confirm: (code: string) => Promise<void> } | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (sent) {
      const code = String(f.get("code") ?? "").trim();
      if (!/^\d{6}$/.test(code)) return onError("Enter the 6-digit code from the text message.");
      void run(() => sent.confirm(code));
    } else {
      const phone = String(f.get("phone") ?? "").replace(/[\s()-]/g, "");
      if (!/^\+[1-9]\d{6,14}$/.test(phone)) return onError("Enter your phone number with its country code, like +91 98765 43210.");
      void run(async () => {
        const confirm = await sendPhoneCode(phone, recaptcha.current!);
        setSent({ phone, confirm });
      });
    }
  };

  return (
    <form key={sent ? "code" : "phone"} className="auth-form__stack" onSubmit={submit} noValidate>
      <div className="auth-form__intro">
        <h2 style={headingStyle}>{sent ? "Enter your code" : "Continue with phone"}</h2>
        <p className="muted">{sent ? `We texted a 6-digit code to ${sent.phone}.` : "We’ll text you a 6-digit code to log in."}</p>
      </div>
      {sent ? (
        <label className="field">
          6-digit code
          <input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus />
        </label>
      ) : (
        <label className="field">
          Phone number
          <input name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" required autoFocus />
        </label>
      )}
      <FormError message={error} />
      <div ref={recaptcha} />
      <button type="submit" className="btn btn--primary" style={{ fontSize: 16 }} disabled={busy}>
        {busy ? "Please wait…" : sent ? "Verify code" : "Text me a code"}
      </button>
      <button
        type="button"
        className="auth-form__back"
        disabled={busy}
        onClick={() => {
          onError(null);
          if (sent) setSent(null);
          else onBack();
        }}
      >
        {sent ? "Use a different number" : "← All log in options"}
      </button>
    </form>
  );
}

export default function AuthPanel() {
  const params = useSearchParams();
  const router = useRouter();
  const { ready, learner, signInWithGoogle } = useLearner();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState(false);
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (ready && learner) router.replace(next);
  }, [ready, learner, next, router]);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await fn();
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
      {phone ? (
        <PhoneForm busy={busy} error={error} run={run} onError={setError} onBack={() => setPhone(false)} />
      ) : (
        <div className="auth-form__stack">
          <div className="auth-form__intro">
            <h2 style={headingStyle}>Welcome</h2>
            <p className="muted">Log in with Google or your phone number. New here? Your free account is created the first time you log in.</p>
          </div>
          <FormError message={error} />
          <button type="button" className="btn btn--outline" disabled={busy} onClick={() => void run(signInWithGoogle)}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="btn btn--outline"
            disabled={busy}
            onClick={() => {
              setError(null);
              setPhone(true);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6" y="2" width="12" height="20" rx="2" />
              <path d="M11 18h2" />
            </svg>
            Continue with phone
          </button>
        </div>
      )}
      <p className="muted auth-form__terms">
        By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy policy</a>.
      </p>
    </div>
  );
}
