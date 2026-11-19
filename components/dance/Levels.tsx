import { Divider, minCol } from "@/components/ui";
import { IMG } from "@/lib/content/images-builtin";
import type { ListItem } from "@/lib/content/pages";

const NUMERALS = ["१", "२", "३", "४", "५", "६", "७", "८", "९"];

/** A lotus from bud to stage: the picture each level shows when none is chosen. Levels past four reuse the full bloom. */
const STAGE_IMAGES = [IMG.stageFoundation, IMG.stageIntermediate, IMG.stageAdvanced, IMG.stagePerformance];
const stageImage = (i: number, last: boolean) => (last ? IMG.stagePerformance : (STAGE_IMAGES[i] ?? IMG.stageAdvanced));

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
              <div className="level-art">
                <img src={lv.img || stageImage(i, last)} alt="" loading="lazy" />
                <span lang="hi" className="numeral" style={last ? { borderColor: "var(--gold-soft)", color: "var(--gold-soft)", background: "var(--maroon)" } : undefined}>
                  {NUMERALS[i] ?? i + 1}
                </span>
              </div>
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
