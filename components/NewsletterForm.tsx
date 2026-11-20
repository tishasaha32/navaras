"use client";

import { useRef, useState, useTransition } from "react";
import { subscribe, type SubscribeResult } from "@/app/(site)/actions";

/** The footer newsletter sign-up: saves the address and says so, or says what's wrong. */
export default function NewsletterForm({ heading }: { heading: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<SubscribeResult | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await subscribe(data);
      setResult(res);
      if (res.ok) form.current?.reset();
    });
  };

  return (
    <form ref={form} onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--ivory)" }}>{heading}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <label style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="footer-input"
            aria-invalid={result?.ok === false || undefined}
            aria-describedby="newsletter-note"
          />
        </label>
        {/* Hidden from people; bots that fill it in are turned away. */}
        <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="honeypot" />
        <button type="submit" className="btn btn--saffron btn--sm" disabled={pending} style={{ alignSelf: "flex-end", minHeight: 50 }}>
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p id="newsletter-note" role="status" aria-live="polite" style={{ minHeight: "1.4em", margin: 0, fontSize: 14, fontWeight: 600, color: result?.ok === false ? "var(--gold-soft)" : "var(--blush)" }}>
        {result?.message}
      </p>
    </form>
  );
}
