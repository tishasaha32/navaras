import type { Metadata } from "next";
import ArchVideo from "@/components/ArchVideo";
import { whatsappHref } from "@/components/Footer";
import { PlayButton } from "@/components/Video";
import VideoReel from "@/components/VideoReel";
import QuoteForm from "@/components/weddings/QuoteForm";
import StepIcon from "@/components/weddings/StepIcon";
import { ArchImage, Divider, Highlight, Mandala, SectionHead, Toran, minCol } from "@/components/ui";
import { IMG } from "@/lib/content/images-builtin";
import { section } from "@/lib/content/pages";
import { getLive } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Navaras Weddings",
  description: "Sangeet and wedding choreography for couples and whole families — rehearsed online, performed together.",
};

const NUMERALS = ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०"];
const TILE_BG = ["var(--sand)", "var(--sand-2)"];

/** The picture each package shows when none is chosen, in the default order. */
const PACKAGE_IMAGES = [IMG.packageCouple, IMG.packageEntry, IMG.packageFamily, IMG.packageShow];

export default async function WeddingsPage() {
  const { pages } = await getLive();
  const doc = pages.weddings;
  const hero = section(doc, "hero");
  const packages = section(doc, "packages");
  const online = section(doc, "online");
  const steps = section(doc, "steps");
  const portfolio = section(doc, "portfolio");
  const quote = section(doc, "quote");
  const whatsapp = section(pages.landing, "footer").text("wa");
  const stepList = steps.list("list").filter((s) => s.title);
  const quotes = portfolio.list("quotes").filter((t) => t.quote);
  const reel = portfolio.list("videos").filter((v) => v.video);
  const linked = portfolio.list("videos").filter((v) => !v.video && (v.img || v.url));

  return (
    <>
      {/* HERO */}
      {hero.visible && (
        <section className="hero-section">
          <Toran />
          <div className="container split">
            <div className="stack" style={{ flex: "1 1 520px" }}>
              <p lang="hi" className="dev">
                {hero.text("kicker")}
              </p>
              <h1 className="display">
                <Highlight text={hero.text("heading")} />
              </h1>
              <Divider />
              <p className="lead">{hero.text("text")}</p>
              <div className="btn-row" style={{ marginTop: 6 }}>
                {hero.text("b1") && quote.visible && (
                  <a href="#quote" className="btn btn--primary">
                    {hero.text("b1")}
                  </a>
                )}
                {hero.text("b2") && portfolio.visible && (
                  <a href="#portfolio" className="btn btn--outline">
                    {hero.text("b2")}
                  </a>
                )}
              </div>
            </div>
            {hero.text("reel") ? (
              <div style={{ flex: "1 1 460px" }}>
                <ArchVideo src={hero.text("reel")} title="Navaras Weddings highlight reel" />
              </div>
            ) : (
              hero.text("img") && (
                <div style={{ flex: "1 1 460px" }}>
                  <ArchImage src={hero.text("img")} alt="Couple dance highlight reel">
                    <PlayButton url={hero.text("video")} title="Navaras Weddings highlight reel" />
                  </ArchImage>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* PACKAGES */}
      {packages.visible && (
        <section className="section section--jaal">
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 48px)" }}>
            <SectionHead eyebrow={packages.text("eyebrow")} title={packages.text("heading")} />
            <div className="grid-auto" style={minCol(260)}>
              {packages.list("list").map((p, i) =>
                p.style?.startsWith("Featured") ? (
                  <div key={i} className="card card--center card--maroon package" style={{ boxShadow: "0 0 0 4px var(--sand), 0 0 0 5px var(--gold)" }}>
                    <img src={p.img || IMG.packageShow} alt="" className="package__art" loading="lazy" />
                    <span className="label" style={{ color: "var(--gold-soft)" }}>
                      The full experience
                    </span>
                    <span className="package__title">{p.name}</span>
                    {p.includes && <p style={{ fontSize: 14, whiteSpace: "pre-line", color: "var(--blush)" }}>{p.includes}</p>}
                    {p.price && (
                      <span className="package__price" style={{ color: "var(--gold-soft)" }}>
                        {p.price}
                      </span>
                    )}
                  </div>
                ) : (
                  <div key={i} className="card card--center package">
                    <img src={p.img || (PACKAGE_IMAGES[i] ?? IMG.packageCouple)} alt="" className="package__art" loading="lazy" />
                    <span className="package__title">{p.name}</span>
                    {p.includes && (
                      <p className="muted" style={{ fontSize: 14, whiteSpace: "pre-line" }}>
                        {p.includes}
                      </p>
                    )}
                    {p.price && <span className="package__price">{p.price}</span>}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* FARAWAY FAMILIES */}
      {online.visible && (
        <section className="section section--cream" style={{ paddingTop: "clamp(56px, 10vw, 120px)", paddingBottom: "clamp(56px, 10vw, 120px)", overflowX: "clip" }}>
          <div className="container split" style={{ gap: "clamp(28px, 6vw, 72px)" }}>
            {online.text("img") && (
              <div style={{ flex: "1 1 440px", display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", width: 480, maxWidth: "100%", aspectRatio: "1 / 1" }}>
                  <img
                    src="/images/mandala-light.svg"
                    alt=""
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-6%", top: "-6%", width: "112%", height: "112%", maxWidth: "none" }}
                  />
                  <div
                    className="arch-tile"
                    style={{
                      position: "absolute",
                      left: "20%",
                      top: "10%",
                      width: "60%",
                      height: "80%",
                      border: "6px solid var(--ivory)",
                      boxShadow: "0 0 0 2px var(--gold), 0 24px 48px rgba(94, 26, 38, 0.16)",
                    }}
                  >
                    <img src={online.text("img")} alt="Relatives rehearsing on a video call" className="cover" />
                  </div>
                </div>
              </div>
            )}
            <div className="stack" style={{ flex: "1 1 480px", gap: 20 }}>
              <p className="eyebrow">{online.text("eyebrow")}</p>
              <h2 className="h2" style={{ fontSize: "clamp(29px, 3.24vw, 40px)" }}>
                {online.text("heading")}
              </h2>
              <Divider />
              <p className="muted" style={{ fontSize: 16 }}>
                {online.text("text")}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {online
                  .list("chips")
                  .filter((c) => c.label)
                  .map((c, i) => (
                    <span key={i} className="tag">
                      {c.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      {steps.visible && stepList.length > 0 && (
        <section className="section section--maroon">
          <Mandala style={{ left: "50%", bottom: -560, marginLeft: -380, width: 760, height: 760, maxWidth: "none" }} />
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 48px)" }}>
            <SectionHead dev={steps.text("kicker")} title={steps.text("heading")} light />
            <ol className="grid-auto" style={minCol(190, { margin: 0, padding: 0, listStyle: "none", gap: 18 })}>
              {stepList.map((s, i) => {
                const last = i === stepList.length - 1 && stepList.length > 1;
                return (
                  <li key={i} className="step" style={last ? { background: "var(--saffron)", color: "var(--ink)", border: "none" } : undefined}>
                    <span style={{ color: last ? "var(--maroon)" : "var(--gold-soft)" }}>
                      <StepIcon index={i} />
                    </span>
                    <span
                      lang="hi"
                      className="numeral"
                      style={last ? { borderColor: "var(--maroon)", color: "var(--maroon)" } : { borderColor: "var(--gold-soft)", color: "var(--gold-soft)" }}
                    >
                      {NUMERALS[i] ?? i + 1}
                    </span>
                    <span className="step__label">{s.title}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* PORTFOLIO */}
      {portfolio.visible && (
        <section id="portfolio" className="section section--cream" style={{ paddingTop: "clamp(56px, 10vw, 120px)", paddingBottom: "clamp(56px, 10vw, 120px)", scrollMarginTop: 80 }}>
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 48px)" }}>
            <SectionHead eyebrow={portfolio.text("eyebrow")} title={portfolio.text("heading")} />
            {reel.length > 0 && <VideoReel items={reel.map((v) => ({ src: v.video, title: v.title }))} label={portfolio.text("heading") || "Past sangeets"} />}
            {linked.length > 0 && (
              <div className="grid-auto" style={minCol(300, { gap: 24 })}>
                {linked.map((v, i) => (
                  <figure key={i} style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="arch-tile" style={{ aspectRatio: "4 / 5", background: TILE_BG[i % 2] }}>
                      {v.img && <img src={v.img} alt={v.title || `Sangeet ${i + 1}`} className="cover" />}
                      <PlayButton url={v.url} title={v.title || `Sangeet ${i + 1}`} />
                    </div>
                    {v.title && (
                      <figcaption className="muted" style={{ textAlign: "center", fontWeight: 600 }}>
                        {v.title}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
            {quotes.length > 0 && (
              <div className="grid-auto" style={minCol(320, { gap: 24 })}>
                {quotes.map((t, i) => (
                  <figure key={i} className="card card--center" style={{ margin: 0, padding: 36, gap: 14 }}>
                    <span aria-hidden="true" style={{ fontFamily: "var(--font-display)", fontSize: 45, lineHeight: 0.6, color: "var(--saffron)" }}>
                      “
                    </span>
                    <blockquote style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.4 }}>{t.quote}</blockquote>
                    <figcaption className="muted" style={{ fontSize: 14, fontWeight: 600 }}>
                      {[t.name, t.city].filter(Boolean).join(" · ")}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* QUOTE FORM */}
      {quote.visible && (
        <section id="quote" className="section section--jaal" style={{ paddingTop: "clamp(56px, 10vw, 120px)", paddingBottom: "clamp(56px, 10vw, 120px)", borderBottom: "none", scrollMarginTop: 80 }}>
          <QuoteForm
            eyebrow={quote.text("eyebrow")}
            title={quote.text("heading")}
            submitLabel={quote.text("btn")}
            whatsappLabel={quote.text("waBtn")}
            whatsapp={whatsappHref(whatsapp || quote.text("to"), "Hi! I’d like a quote for wedding choreography.")}
            levels={quote.list("levels").map((l) => l.label).filter(Boolean)}
            sendTo={quote.text("to")}
            bundle={quote.text("bundle")}
          />
        </section>
      )}
    </>
  );
}
