"use client";

import { useState } from "react";
import { contactLink } from "@/lib/contact";

/** The custom stitching enquiry: name, email and what to stitch, sent as a WhatsApp message (or an email draft). */
export default function StitchForm({ sendTo }: { sendTo: string }) {
  const [note, setNote] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    if (!get("name") || !get("email") || !get("what")) return setNote("Add your name, email and what you’d like stitched.");
    const link = contactLink(sendTo, "Custom stitching enquiry", [`Name: ${get("name")}`, `Email: ${get("email")}`, `I’d like to get stitched: ${get("what")}`].join("\n"));
    if (!link) return setNote("Online enquiries aren’t open yet — please reach us using the contact details below.");
    setNote(null);
    window.open(link, "_blank", "noopener");
  };

  return (
    <form id="stitch-form" className="trial-form stitch-form" onSubmit={submit} noValidate>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24 }}>Tell us what you need</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <label className="field" style={{ flex: "1 1 220px" }}>
          Your name
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label className="field" style={{ flex: "1 1 220px" }}>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label className="field">
        What would you like to get stitched?
        <textarea name="what" rows={4} required placeholder="e.g. a Bharatanatyam costume in maroon and gold, for an arangetram in March" />
      </label>
      {note && (
        <p role="alert" style={{ color: "var(--rose-deep)", fontWeight: 600 }}>
          {note}
        </p>
      )}
      <button type="submit" className="btn btn--primary" style={{ alignSelf: "flex-start", padding: "0 30px" }}>
        Send on WhatsApp
      </button>
    </form>
  );
}
