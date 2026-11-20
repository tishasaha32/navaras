"use client";

import { useState } from "react";
import { contactLink } from "@/lib/contact";

const TOPICS = ["Dance classes", "Wedding choreography", "Dress or jewellery rental", "Custom stitching", "Natyashastra Hub", "Something else"];

/** The general enquiry form: sent as a WhatsApp message (or an email draft) to `sendTo`. */
export default function ContactForm({ sendTo }: { sendTo: string }) {
  const [note, setNote] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    if (!get("name") || !get("reach") || !get("message")) return setNote("Add your name, an email or phone number, and your message.");
    const body = [`Name: ${get("name")}`, `Email or phone: ${get("reach")}`, `About: ${get("topic")}`, "", get("message")].join("\n");
    const link = contactLink(sendTo, `Enquiry: ${get("topic")}`, body);
    if (!link) return setNote("Online enquiries aren’t open yet. Please try again later.");
    setNote(null);
    window.open(link, "_blank", "noopener");
  };

  return (
    <form className="trial-form stitch-form" onSubmit={submit} noValidate>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24 }}>Send us a message</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <label className="field" style={{ flex: "1 1 220px" }}>
          Your name
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label className="field" style={{ flex: "1 1 220px" }}>
          Email or phone number
          <input name="reach" type="text" autoComplete="email" required />
        </label>
      </div>
      <label className="field">
        What is it about?
        <select name="topic" defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Your message
        <textarea name="message" rows={5} required />
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
