import type { Metadata } from "next";
import Link from "next/link";
import DressShop from "@/components/dresses/DressShop";
import { ArchImage, Divider, Highlight, Mandala, Toran } from "@/components/ui";
import { section } from "@/lib/content/pages";
import { getLive } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Navaras Dresses",
  description: "Costume rentals and custom stitching for stage, sangeet and arangetram.",
};

export default async function DressesPage() {
  const doc = (await getLive()).pages.dresses;
  const hero = section(doc, "hero");
  const catalogue = section(doc, "catalogue");
  const custom = section(doc, "custom");
  const arangetram = section(doc, "arangetram");
  const policies = section(doc, "policies");
  const perk = section(doc, "perk");
  const policyList = policies.list("list").filter((p) => p.title);

  const heroNode = hero.visible ? (
    <>
      <Toran />
      <div className="container split">
        <div className="stack" style={{ flex: "1 1 520px" }}>
          <p lang="sa" className="dev">
            {hero.text("kicker")}
          </p>
          <h1 className="display" style={{ fontSize: "clamp(36px, 4.37vw, 61px)", lineHeight: 1.03 }}>
            <Highlight text={hero.text("heading")} />
          </h1>
          <Divider />
          <p className="lead">{hero.text("text")}</p>
        </div>
        {hero.text("img") && (
          <div style={{ flex: "1 1 420px" }}>
            <ArchImage src={hero.text("img")} alt="Classical dance costume" />
          </div>
        )}
      </div>
    </>
  ) : null;

  return (
    <>
      <DressShop
        hero={heroNode}
        catalogue={
          catalogue.visible
            ? {
                occasions: catalogue.list("occasions").map((o) => o.label).filter(Boolean),
                sizes: catalogue
                  .text("sizes")
                  .split(",")
                  .map((s) => s.trim().toUpperCase())
                  .filter(Boolean),
                items: catalogue.list("items"),
              }
            : null
        }
        custom={
          custom.visible
            ? {
                heading: custom.text("heading"),
                steps: custom.list("steps").filter((s) => s.title),
                video: custom.text("video"),
                chart: custom.text("chart"),
                book: custom.text("book"),
              }
            : null
        }
      />

      {/* ARANGETRAM */}
      {arangetram.visible && (
        <section className="section" style={{ overflow: "hidden", background: "var(--yellow)" }}>
          <Mandala variant="light" style={{ right: -300, top: -260, width: 680, height: 680 }} />
          <div className="container split" style={{ gap: "clamp(28px, 6vw, 72px)" }}>
            {arangetram.text("img") && (
              <div style={{ flex: "1 1 420px", display: "flex", justifyContent: "center" }}>
                <div
                  className="arch-tile"
                  style={{
                    width: 380,
                    maxWidth: "100%",
                    aspectRatio: "3 / 4",
                    background: "var(--cream)",
                    border: "6px solid var(--ivory)",
                    boxShadow: "0 0 0 2px var(--gold), 0 24px 48px rgba(94, 26, 38, 0.18)",
                  }}
                >
                  <img src={arangetram.text("img")} alt="Dancer in full arangetram costume and jewellery" className="cover" />
                </div>
              </div>
            )}
            <div className="stack" style={{ flex: "1 1 480px", gap: 20 }}>
              <p lang="sa" className="dev" style={{ color: "var(--rose-deep)", fontWeight: 400 }}>
                {arangetram.text("kicker")}
              </p>
              <h2 className="h2" style={{ fontSize: "clamp(29px, 3.24vw, 40px)" }}>
                {arangetram.text("heading")}
              </h2>
              <Divider />
              <p style={{ fontSize: 16 }}>{arangetram.text("text")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {arangetram
                  .list("chips")
                  .filter((c) => c.label)
                  .map((c, i) => (
                    <span key={i} className="tag" style={{ borderColor: "var(--gold)", fontWeight: 700 }}>
                      {c.label}
                    </span>
                  ))}
              </div>
              {arangetram.text("btn") && (
                <Link href="/navaras-dance-company" className="btn btn--primary" style={{ alignSelf: "flex-start", minHeight: 52 }}>
                  {arangetram.text("btn")} →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* POLICIES */}
      {policies.visible && policyList.length > 0 && (
        <section id="policies" className="section section--cream" style={{ paddingTop: "clamp(56px, 10vw, 120px)", paddingBottom: "clamp(56px, 10vw, 120px)", scrollMarginTop: 80 }}>
          <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px, 6vw, 64px)" }}>
            <div className="stack" style={{ flex: "1 1 340px", gap: 16 }}>
              <p className="eyebrow">{policies.text("eyebrow")}</p>
              <h2 className="h2" style={{ fontSize: "clamp(29px, 3.24vw, 39px)" }}>
                {policies.text("heading")}
              </h2>
              <Divider />
            </div>
            <dl className="policies">
              {policyList.map((p, i) => (
                <div key={i} className="policies__row">
                  <dt>{p.title}</dt>
                  <dd style={{ whiteSpace: "pre-line" }}>{p.text || "Ask us for details."}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* STUDENT PERK */}
      {perk.visible && perk.text("discount") && (
        <section className="section section--cream" style={{ paddingTop: 0, paddingBottom: "clamp(56px, 10vw, 120px)" }}>
          <div className="container banner">
            <Mandala style={{ right: -160, top: "50%", marginTop: -220, width: 440, height: 440 }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="label" style={{ color: "var(--gold-soft)" }}>
                {perk.text("label")}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, lineHeight: 1.15 }}>
                {perk.text("heading").replaceAll("{discount}", perk.text("discount"))}
              </span>
            </div>
            {perk.text("btn") && (
              <Link href="/navaras-dance-company" className="btn btn--saffron" style={{ position: "relative", minHeight: 52 }}>
                {perk.text("btn")}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}
