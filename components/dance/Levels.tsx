"use client";

import { useState } from "react";
import { Divider, minCol } from "@/components/ui";
import type { ListItem } from "@/lib/content/pages";

const NUMERALS = ["१", "२", "३", "४", "५", "६", "७", "८", "९"];
const STYLES = [
  { key: "classical", label: "Classical" },
  { key: "semi", label: "Semi-Classical" },
] as const;

export default function Levels({ levels, dev, title }: { levels: ListItem[]; dev: string; title: string }) {
  const [style, setStyle] = useState<(typeof STYLES)[number]>(STYLES[0]);

  return (
    <div className="container" style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 48px)" }}>
      <div className="section-head">
        <p lang="hi" className="dev" style={{ fontWeight: 400 }}>
          {dev}
        </p>
        <h2 className="h2">{title}</h2>
        <Divider />
        <div role="group" aria-label="Style" className="segmented" style={{ marginTop: 12 }}>
          {STYLES.map((s) => (
            <button key={s.key} type="button" aria-pressed={style.key === s.key} onClick={() => setStyle(s)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid-auto" style={minCol(260)}>
        {levels.map((lv, i) => {
          const last = i === levels.length - 1;
          const covers = lv[style.key];
          return (
            <div key={i} className={`card card--center${last ? " card--maroon" : ""}`} style={{ borderColor: "var(--line-gold)" }}>
              <span lang="hi" className="numeral" style={last ? { borderColor: "var(--gold-soft)", color: "var(--gold-soft)" } : undefined}>
                {NUMERALS[i] ?? i + 1}
              </span>
              <span className="label" style={{ color: last ? "var(--gold-soft)" : "var(--rose)" }}>
                {style.label}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}>{lv.name}</span>
              {covers && <p style={{ fontSize: 14, whiteSpace: "pre-line", color: last ? "var(--blush)" : "var(--muted)" }}>{covers}</p>}
              {lv.duration && <span style={{ fontSize: 14, fontWeight: 700 }}>{lv.duration}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
