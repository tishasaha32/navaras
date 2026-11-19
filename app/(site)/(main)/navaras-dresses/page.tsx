import type { Metadata } from "next";
import Link from "next/link";
import ArchVideo from "@/components/ArchVideo";
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
  const jewellery = section(doc, "jewellery");
  const custom = section(doc, "custom");
  const perk = section(doc, "perk");

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
          {hero.text("btn") && custom.visible && (
            <div className="btn-row" style={{ marginTop: 6 }}>
              <a href="#custom-stitching" className="btn btn--primary">
                {hero.text("btn")}
              </a>
            </div>
          )}
        </div>
        {hero.text("reel") ? (
          <div style={{ flex: "1 1 420px" }}>
            <ArchVideo src={hero.text("reel")} title="Navaras Dresses costumes and jewellery" tall />
          </div>
        ) : (
          hero.text("img") && (
            <div style={{ flex: "1 1 420px" }}>
              <ArchImage src={hero.text("img")} alt="Classical dance costume" />
            </div>
          )
        )}
      </div>
    </>
  ) : null;

  return (
    <>
      <DressShop
        hero={heroNode}
        rental={{ eyebrow: catalogue.text("eyebrow"), heading: catalogue.text("heading") }}
        catalogue={
          catalogue.visible
            ? {
                categories: catalogue.list("categories").map((c) => c.label).filter(Boolean),
                items: catalogue.list("items"),
              }
            : null
        }
        jewellery={
          jewellery.visible
            ? {
                categories: jewellery.list("categories").map((c) => c.label).filter(Boolean),
                items: jewellery.list("items"),
              }
            : null
        }
        custom={
          custom.visible
            ? {
                eyebrow: custom.text("eyebrow"),
                heading: custom.text("heading"),
                steps: custom.list("steps").filter((s) => s.title),
                video: custom.text("video"),
                chart: custom.text("chart"),
                sendTo: custom.text("to"),
              }
            : null
        }
      />

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
