"use client";

import { useState } from "react";
import { PlayButton } from "@/components/Video";
import { Divider, minCol } from "@/components/ui";
import type { ListItem } from "@/lib/content/pages";

const SWATCHES: Record<string, string> = {
  Red: "#A8261B",
  Pink: "#B8325A",
  Gold: "#E89A2C",
  Green: "#4F7A3A",
  Blue: "#276C9C",
  Maroon: "#5E1A26",
};

const NUMERALS = ["१", "२", "३", "४", "५", "६", "७", "८"];

type Catalogue = { occasions: string[]; sizes: string[]; items: ListItem[] } | null;
type Custom = { heading: string; steps: ListItem[]; video: string; chart: string; book: string } | null;

const sizesOf = (s: string) =>
  s
    .split(/[,/]/)
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);

export default function DressShop({ hero, catalogue, custom }: { hero: React.ReactNode; catalogue: Catalogue; custom: Custom }) {
  const [tab, setTab] = useState<"rent" | "custom">(catalogue ? "rent" : "custom");
  const occasions = catalogue?.occasions ?? [];
  const [occ, setOcc] = useState(occasions[0] ?? "");
  const [size, setSize] = useState("");
  const [colour, setColour] = useState<string | null>(null);
  const tabs = catalogue && custom;

  const products = (catalogue?.items ?? []).filter(
    (c) => (!occ || c.occasion === occ) && (!size || sizesOf(c.size ?? "").includes(size)) && (!colour || c.colour === colour),
  );

  return (
    <>
      <section className="hero-section" style={{ paddingBottom: tabs ? 0 : undefined }}>
        {hero}
        {tabs && (
          <div className="container" role="tablist" aria-label="Shop" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
            <button type="button" role="tab" aria-selected={tab === "rent"} className="shop-tab" onClick={() => setTab("rent")}>
              Rental
            </button>
            <button type="button" role="tab" aria-selected={tab === "custom"} className="shop-tab" onClick={() => setTab("custom")}>
              Custom stitching
            </button>
          </div>
        )}
      </section>

      {catalogue && tab === "rent" && (
        <section role="tabpanel" aria-label="Rental" className="section section--ivory" style={{ padding: "clamp(32px, 8vw, 64px) clamp(16px, 5vw, 32px) clamp(56px, 10vw, 112px)", borderTop: "1px solid var(--line-gold)" }}>
          <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px, 6vw, 48px)" }}>
            <aside className="filters">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span className="label">Occasion</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {occasions.map((o) => (
                    <button
                      key={o}
                      type="button"
                      className="chip chip--rose"
                      style={{ fontWeight: 600, padding: "0 16px" }}
                      aria-pressed={occ === o}
                      onClick={() => setOcc(o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              {catalogue.sizes.length > 0 && (
                <label className="field field--on-ivory filters__field">
                  <span className="label">Size</span>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="">Any size</option>
                    {catalogue.sizes.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span className="label">Colour</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {Object.entries(SWATCHES).map(([label, color]) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      aria-pressed={colour === label}
                      className="swatch"
                      style={{ background: color }}
                      onClick={() => setColour((c) => (c === label ? null : label))}
                    />
                  ))}
                </div>
              </div>
            </aside>

            <div style={{ flex: "999 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h2 style={{ fontSize: 32 }}>{occ ? `${occ} costumes` : "Costumes"}</h2>
                <span className="muted" aria-live="polite" style={{ fontSize: 14 }}>
                  Showing {products.length} {products.length === 1 ? "costume" : "costumes"}
                </span>
              </div>
              <div className="grid-fill" style={minCol(220, { gap: 24 })}>
                {products.length === 0 && <p className="muted">No costumes match these filters yet.</p>}
                {products.map((p, i) => {
                  const available = p.status === "Available";
                  return (
                    <div key={i} className="product">
                      <div className="product__media" style={{ background: i % 2 ? "var(--sand-2)" : "var(--sand)" }}>
                        {p.img && <img src={p.img} alt={p.name || `${p.occasion} costume`} className="cover" />}
                      </div>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>{p.name || `${p.occasion} costume`}</span>
                      <span className="muted" style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
                        <span>{[p.price, p.price && p.period].filter(Boolean).join(" ") || "Ask for price"}</span>
                        <span style={{ color: available ? "var(--green)" : "var(--rose)", fontWeight: 700 }}>{p.status}</span>
                      </span>
                      {p.size && <span className="muted" style={{ fontSize: 13 }}>Sizes: {p.size}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {custom && (tab === "custom" || !catalogue) && (
        <section role="tabpanel" aria-label="Custom stitching" className="section section--ivory" style={{ padding: "clamp(32px, 8vw, 64px) clamp(16px, 5vw, 32px) clamp(56px, 10vw, 112px)", borderTop: "1px solid var(--line-gold)" }}>
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            <div className="section-head">
              <h2 className="h2" style={{ fontSize: "clamp(28px, 3.08vw, 37px)" }}>
                {custom.heading}
              </h2>
              <Divider />
            </div>
            <ol className="grid-auto" style={minCol(260, { margin: 0, padding: 0, listStyle: "none" })}>
              {custom.steps.map((s, i) => {
                const last = i === custom.steps.length - 1 && custom.steps.length > 1;
                const measure = /measure/i.test(s.title);
                return (
                  <li key={i} className="stitch-step" style={last ? { background: "var(--maroon)", color: "var(--ivory)", borderColor: "var(--gold)" } : undefined}>
                    <div className="stitch-step__media" style={last ? { background: "var(--maroon-deep)" } : undefined}>
                      {s.img && <img src={s.img} alt="" className="cover" />}
                      {measure && <PlayButton url={custom.video} title="How to measure at home" />}
                    </div>
                    <span lang="hi" className="stitch-step__num" style={last ? { color: "var(--gold-soft)" } : undefined}>
                      {NUMERALS[i] ?? i + 1}
                    </span>
                    <span className="stitch-step__title">{s.title}</span>
                    {s.text && (
                      <span className={last ? undefined : "muted"} style={{ fontSize: 14, padding: "0 8px" }}>
                        {s.text}
                      </span>
                    )}
                    {measure && custom.chart && (
                      <a href={custom.chart} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14 }}>
                        Download the printable chart
                      </a>
                    )}
                    {last && (
                      <a href={custom.book || "#contact"} className="btn btn--saffron btn--sm">
                        Book now
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
