"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionHead, minCol } from "@/components/ui";
import { contactLink } from "@/lib/contact";

type Props = {
  eyebrow: string;
  title: string;
  submitLabel: string;
  whatsappLabel: string;
  whatsapp: string | null;
  levels: string[];
  sendTo: string;
  bundle: string;
};

export default function QuoteForm({ eyebrow, title, submitLabel, whatsappLabel, whatsapp, levels, sendTo, bundle }: Props) {
  const [note, setNote] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    if (!get("name") || !get("contact")) return setNote("Add your name and an email or WhatsApp number so we can reply.");
    const body = [
      `Name: ${get("name")}`,
      `Contact: ${get("contact")}`,
      `Wedding date: ${get("date") || "not set"}`,
      `City: ${get("city") || "not set"}`,
      `Performers: ${get("performers") || "not set"}`,
      `Skill level: ${get("level") || "not set"}`,
    ].join("\n");
    const link = contactLink(sendTo, "Wedding choreography enquiry", body) ?? (whatsapp ? `${whatsapp.split("?")[0]}?text=${encodeURIComponent(body)}` : null);
    if (!link) return setNote("Online enquiries aren’t open yet — please reach us using the contact details below.");
    setNote(null);
    window.open(link, "_blank", "noopener");
  };

  // Turn "… from Navaras Dresses." into a link to the Dresses page.
  const [before, after] = bundle.split("Navaras Dresses");

  return (
    <form className="quote-form" onSubmit={submit} noValidate>
      <SectionHead eyebrow={eyebrow} title={title} />
      <div className="grid-auto" style={minCol(240, { gap: 16 })}>
        <label className="field">
          Your name
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label className="field">
          Email or WhatsApp
          <input name="contact" type="text" required />
        </label>
        <label className="field">
          Wedding date
          <input name="date" type="date" />
        </label>
        <label className="field">
          City
          <input name="city" type="text" />
        </label>
        <label className="field">
          Number of performers
          <input name="performers" type="number" min={1} />
        </label>
        {levels.length > 0 && (
          <label className="field">
            Skill level
            <select name="level" defaultValue={levels[0]}>
              {levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      {note && (
        <p role="alert" style={{ textAlign: "center", color: "var(--rose-deep)", fontWeight: 600 }}>
          {note}
        </p>
      )}
      <div className="btn-row" style={{ justifyContent: "center" }}>
        <button type="submit" className="btn btn--primary" style={{ padding: "0 30px" }}>
          {submitLabel || "Send my inquiry"}
        </button>
        {whatsapp && whatsappLabel && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            {whatsappLabel}
          </a>
        )}
      </div>
      {bundle && (
        <div
          style={{
            padding: "18px 22px",
            borderRadius: 14,
            background: "var(--cream)",
            border: "1px dashed var(--line-input)",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {after !== undefined ? (
            <>
              {before}
              <Link href="/navaras-dresses">Navaras Dresses</Link>
              {after}
            </>
          ) : (
            bundle
          )}
        </div>
      )}
    </form>
  );
}
