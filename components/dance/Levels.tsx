import { Divider, minCol } from "@/components/ui";
import type { ListItem } from "@/lib/content/pages";

const NUMERALS = ["१", "२", "३", "४", "५", "६", "७", "८", "९"];

export default function Levels({ levels, dev, title }: { levels: ListItem[]; dev: string; title: string }) {
  return (
    <div className="container" style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 48px)" }}>
      <div className="section-head">
        <p lang="hi" className="dev" style={{ fontWeight: 400 }}>
          {dev}
        </p>
        <h2 className="h2">{title}</h2>
        <Divider />
      </div>
      <div className="grid-auto" style={minCol(260)}>
        {levels.map((lv, i) => {
          const last = i === levels.length - 1;
          return (
            <div key={i} className={`card card--center${last ? " card--maroon" : ""}`} style={{ borderColor: "var(--line-gold)" }}>
              <span lang="hi" className="numeral" style={last ? { borderColor: "var(--gold-soft)", color: "var(--gold-soft)" } : undefined}>
                {NUMERALS[i] ?? i + 1}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}>{lv.name}</span>
              {lv.covers && <p style={{ fontSize: 14, whiteSpace: "pre-line", color: last ? "var(--blush)" : "var(--muted)" }}>{lv.covers}</p>}
              {lv.duration && <span style={{ fontSize: 14, fontWeight: 700 }}>{lv.duration}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
