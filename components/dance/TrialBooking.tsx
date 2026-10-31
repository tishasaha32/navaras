"use client";

import { useEffect, useState } from "react";
import { minCol } from "@/components/ui";
import { contactLink } from "@/lib/contact";
import type { ListItem } from "@/lib/content/pages";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Parses "6:00 pm", "18:30" or "6 pm" into minutes after midnight. */
function parseTime(t: string): number | null {
  const m = t.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** An IST (UTC+5:30, no daylight saving) weekly slot shown in the visitor's own time zone. */
function localLabel(day: string, time: string, timeZone?: string): string {
  const minutes = parseTime(time);
  const dayIdx = DAYS.indexOf(day);
  if (minutes === null || dayIdx === -1) return [day, time].filter(Boolean).join(" · ") || "To be announced";
  // 4 Jan 1970 was a Sunday; place the slot in that week, in UTC.
  const utc = Date.UTC(1970, 0, 4 + dayIdx, 0, minutes) - 330 * 60_000;
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit", timeZone });
  return fmt.format(new Date(utc)).replace(",", " ·");
}

export default function TrialBooking({ slots, sendTo }: { slots: ListItem[]; sendTo: string }) {
  const [slot, setSlot] = useState(-1);
  const [tz, setTz] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [reach, setReach] = useState("");
  const [note, setNote] = useState<string | null>(null);

  // Resolved after mount so the server render (IST) and first client render match.
  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || null);
    } catch {
      /* keep IST */
    }
  }, []);

  const labels = slots.map((s) => localLabel(s.day, s.time, tz ?? "Asia/Kolkata"));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slot < 0) return setNote("Pick a slot first.");
    if (!name.trim() || !reach.trim()) return setNote("Add your name and an email or WhatsApp number.");
    const s = slots[slot];
    const link = contactLink(
      sendTo,
      "Free trial class booking",
      `Name: ${name}\nContact: ${reach}\nSlot: ${s.day} ${s.time} IST (${labels[slot]} for me${tz ? `, ${tz}` : ""})`,
    );
    if (!link) return setNote("Bookings aren’t open online yet — please reach us on WhatsApp from the footer.");
    setNote(null);
    window.open(link, "_blank", "noopener");
  };

  return (
    <form className="trial-form" onSubmit={submit} noValidate>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>Available slots</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--sand)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          Your time zone: {tz ?? "India (IST)"}
        </span>
      </div>
      {slots.length === 0 ? (
        <p className="muted">New slots are coming soon.</p>
      ) : (
        <div role="radiogroup" aria-label="Slot" className="grid-auto" style={minCol(150, { gap: 10 })}>
          {slots.map((s, i) => (
            <button key={i} type="button" role="radio" className="slot" aria-checked={slot === i} onClick={() => setSlot(i)}>
              {labels[i]}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <label className="field field--on-ivory" style={{ flex: "1 1 200px" }}>
          Name
          <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field field--on-ivory" style={{ flex: "1 1 200px" }}>
          Email or WhatsApp
          <input type="text" value={reach} onChange={(e) => setReach(e.target.value)} />
        </label>
      </div>
      {note && (
        <p role="alert" style={{ color: "var(--rose-deep)", fontWeight: 600, fontSize: 14 }}>
          {note}
        </p>
      )}
      <button type="submit" className="btn btn--primary">
        Book my free class
      </button>
    </form>
  );
}
