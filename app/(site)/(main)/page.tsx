import Link from "next/link";
import { ArchImage, ArrowIcon, Divider, Highlight, Mandala, Toran, minCol } from "@/components/ui";
import { section } from "@/lib/content/pages";
import { getLive } from "@/lib/content/store";

export default async function Home() {
  const doc = (await getLive()).pages.landing;
  const hero = section(doc, "hero");
  const hub = section(doc, "hub");
  const services = section(doc, "services");
  return (
    <>
      {/* HERO */}
      {hero.visible && (
      <section className="hero-section">
        <Toran />
        <div className="container split">
          <div className="stack" style={{ flex: "1 1 540px" }}>
            <p lang="hi" className="dev">
              {hero.text("kicker")}
            </p>
            <h1 className="display">
              <Highlight text={hero.text("heading")} />
            </h1>
            <Divider />
            <p className="lead">{hero.text("text")}</p>
            <div className="btn-row" style={{ marginTop: 6 }}>
              {hero.text("b1") && (
                <a href={hero.text("b1h") || "#hub-intro"} className="btn btn--primary">
                  {hero.text("b1")}
                </a>
              )}
              {hero.text("b2") && (
                <a href={hero.text("b2h") || "#services"} className="btn btn--outline">
                  {hero.text("b2")}
                </a>
              )}
            </div>
          </div>
          {hero.text("img") && (
            <div style={{ flex: "1 1 440px" }}>
              <ArchImage src={hero.text("img")} alt="A classical dancer in a red and gold costume, mid-pose, under a warm spotlight" />
            </div>
          )}
        </div>
      </section>
      )}

      {/* NATYASHASTRA HUB INTRO */}
      {hub.visible && (
      <section id="hub-intro" className="section section--maroon" style={{ paddingTop: "clamp(56px, 10vw, 120px)", paddingBottom: "clamp(56px, 10vw, 120px)" }}>
        <Mandala style={{ right: -340, top: -300, width: 680, height: 680 }} />
        <div className="container split" style={{ flexWrap: "wrap-reverse" }}>
          {hub.text("img") && (
            <div style={{ flex: "1 1 440px" }}>
              <ArchImage src={hub.text("img")} alt="An open book of dance drawings on a carved stand, between brass lamps" dark />
            </div>
          )}
          <div className="stack" style={{ flex: "1 1 540px" }}>
            <p style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
              <span lang="sa" className="dev" style={{ fontSize: 23, color: "var(--gold-soft)" }}>
                {hub.text("kicker")}
              </span>
              <span className="eyebrow" style={{ color: "var(--blush)" }}>
                {hub.text("eyebrow")}
              </span>
            </p>
            <h2 style={{ fontSize: "clamp(32px, 3.56vw, 45px)", lineHeight: 1.06, textWrap: "balance" }}>{hub.text("heading")}</h2>
            <Divider />
            <p className="lead" style={{ color: "var(--blush)" }}>
              {hub.text("text")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {hub.list("chips").map((t, i) => (
                <span key={i} className="tag tag--dark">
                  {t.label}
                  <span lang="sa" style={{ fontFamily: "var(--font-display)", color: "var(--gold-soft)" }}>
                    {t.dev}
                  </span>
                </span>
              ))}
            </div>
            {hub.text("btn") && (
            <Link
              href={hub.text("btnh") || "/natyashastra-hub"}
              className="btn btn--saffron"
              style={{ alignSelf: "flex-start", marginTop: 8, minHeight: 58, padding: "0 34px", fontSize: 16 }}
            >
              {hub.text("btn")}
              <ArrowIcon />
            </Link>
            )}
          </div>
        </div>
      </section>
      )}

      {/* SERVICES */}
      {services.visible && (
      <section id="services" className="section section--jaal" style={{ paddingTop: "clamp(56px, 10vw, 120px)", paddingBottom: "clamp(56px, 10vw, 120px)", borderBottom: "none" }}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 56px)" }}>
          <div className="section-head" style={{ maxWidth: 760 }}>
            <p className="eyebrow">{services.text("eyebrow")}</p>
            <h2 className="h2" style={{ fontSize: "clamp(31px, 3.4vw, 44px)" }}>
              {services.text("heading")}
            </h2>
            <Divider />
          </div>
          <div className="grid-auto" style={minCol(320, { gap: 32 })}>
            {services.list("cards").map((s, i) => (
              <Link key={i} href={s.href || "/"} className="service-card">
                <div className="service-card__media">{s.img && <img src={s.img} alt="" className="cover" />}</div>
                <div className="service-card__body">
                  <span lang="hi" className="dev" style={{ fontSize: 20, fontWeight: 400 }}>
                    {s.dev}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 37, fontWeight: 600, lineHeight: 1 }}>
                    {s.title}
                  </span>
                  <span className="label">{s.unit}</span>
                  <span className="muted" style={{ maxWidth: 300 }}>
                    {s.desc}
                  </span>
                  {s.btn && <span style={{ marginTop: 8, fontWeight: 700, color: "var(--rose)" }}>{s.btn} →</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}
    </>
  );
}
