"use client";

import { useState } from "react";
import StitchForm from "@/components/dresses/StitchForm";
import { PlayButton } from "@/components/Video";
import { SectionHead, minCol } from "@/components/ui";
import type { ListItem } from "@/lib/content/pages";

const NUMERALS = ["१", "२", "३", "४", "५", "६", "७", "८"];

type Catalogue = { categories: string[]; items: ListItem[] } | null;
type Custom = { eyebrow: string; heading: string; steps: ListItem[]; video: string; chart: string; sendTo: string } | null;
type Part = { label: string; catalogue: NonNullable<Catalogue>; noun: readonly [string, string] };
type Rental = { eyebrow: string; heading: string };

export default function DressShop({ hero, rental, catalogue, jewellery, custom }: { hero: React.ReactNode; rental: Rental; catalogue: Catalogue; jewellery: Catalogue; custom: Custom }) {
  /** Rental holds the dresses and the jewellery, each with its own categories. */
  const parts: Part[] = [];
  if (catalogue) parts.push({ label: "Dresses", catalogue, noun: ["costume", "costumes"] });
  if (jewellery) parts.push({ label: "Jewellery", catalogue: jewellery, noun: ["piece", "pieces"] });

  return (
    <>
      <section className="hero-section">{hero}</section>

      {parts.length > 0 && <RentalBrowser rental={rental} parts={parts} />}

      {custom && (
        <section id="custom-stitching" aria-label="Custom stitching" className="section section--cream" style={{ paddingTop: "clamp(56px, 10vw, 112px)", paddingBottom: "clamp(56px, 10vw, 112px)", borderTop: "1px solid var(--line-gold)", scrollMarginTop: 80 }}>
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            <SectionHead eyebrow={custom.eyebrow} title={custom.heading} />
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
                      <a href="#stitch-form" className="btn btn--saffron btn--sm">
                        Book now
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
            <StitchForm sendTo={custom.sendTo} />
          </div>
        </section>
      )}
    </>
  );
}

/**
 * The rental catalogues, with their filters beside them: a switch between dresses and jewellery,
 * then that part's categories. The filters stay in view while the pieces scroll past.
 */
function RentalBrowser({ rental, parts }: { rental: Rental; parts: Part[] }) {
  const [partIndex, setPartIndex] = useState(0);
  const { label, catalogue, noun } = parts[partIndex] ?? parts[0];
  const { categories } = catalogue;
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const category = chosen[label] ?? categories[0] ?? "";
  const setCategory = (c: string) => setChosen((prev) => ({ ...prev, [label]: c }));
  const products = catalogue.items.filter((c) => !category || c.category === category);
  const fallback = noun[0][0].toUpperCase() + noun[0].slice(1);

  return (
    <section id="rental" aria-label="Rental" className="section section--ivory" style={{ paddingTop: "clamp(56px, 10vw, 112px)", paddingBottom: "clamp(56px, 10vw, 112px)", borderTop: "1px solid var(--line-gold)", scrollMarginTop: 80 }}>
      <div className="container" style={{ marginBottom: "clamp(28px, 6vw, 48px)" }}>
        <SectionHead eyebrow={rental.eyebrow} title={rental.heading} />
      </div>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px, 6vw, 48px)" }}>
        <aside className="filters">
          {parts.length > 1 && (
            <div className="rental-switch" role="group" aria-label="Rent">
              {parts.map((p, i) => (
                <button key={p.label} type="button" aria-pressed={i === partIndex} onClick={() => setPartIndex(i)}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span className="label">Category</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categories.map((c) => (
                <button key={c} type="button" className="chip chip--rose" style={{ fontWeight: 600, padding: "0 16px" }} aria-pressed={category === c} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div style={{ flex: "999 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 style={{ fontSize: 32 }}>{category || label}</h2>
            <span className="muted" aria-live="polite" style={{ fontSize: 14 }}>
              Showing {products.length} {products.length === 1 ? noun[0] : noun[1]}
            </span>
          </div>
          <div className="grid-fill" style={minCol(220, { gap: 24 })}>
            {products.length === 0 && (
              <p className="muted" style={{ gridColumn: "1 / -1" }}>
                No {noun[1]} in this category yet. Ask us what’s available.
              </p>
            )}
            {products.map((p, i) => {
              const available = p.status === "Available";
              return (
                <div key={i} className="product">
                  <div className="product__media product__media--photo" style={{ background: i % 2 ? "var(--sand-2)" : "var(--sand)" }}>
                    {p.img && (
                      <>
                        <img src={p.img} alt="" aria-hidden="true" className="product__backdrop" loading="lazy" />
                        <img src={p.img} alt={p.name || p.category || fallback} className="product__photo" loading="lazy" />
                      </>
                    )}
                    {p.code && <span className="product__code">{p.code}</span>}
                  </div>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>{p.name || p.category || fallback}</span>
                  <span className="muted" style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
                    <span>
                      {p.price ? (
                        <>
                          Rent <strong style={{ color: "var(--ink)" }}>{p.price}</strong> {p.period}
                        </>
                      ) : (
                        "Ask for price"
                      )}
                    </span>
                    {p.status && <span style={{ color: available ? "var(--green)" : "var(--rose)", fontWeight: 700 }}>{p.status}</span>}
                  </span>
                  {p.sale && <span className="muted" style={{ fontSize: 13 }}>Buy: {p.sale}</span>}
                  {p.size && <span className="muted" style={{ fontSize: 13 }}>Sizes: {p.size}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
