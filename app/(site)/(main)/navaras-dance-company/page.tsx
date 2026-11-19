import type { Metadata } from "next";
import Link from "next/link";
import Levels from "@/components/dance/Levels";
import TrialBooking from "@/components/dance/TrialBooking";
import { VideoPlayer } from "@/components/MediaPlayer";
import { PlayButton } from "@/components/Video";
import { ArchImage, Divider, Highlight, Mandala, SectionHead, Sparkle, Toran, minCol } from "@/components/ui";
import { section } from "@/lib/content/pages";
import { getLive } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Navaras Dance Company",
  description: "Classical and semi-classical dance classes, taught live online for kids, teens and adults.",
};

export default async function DanceCompanyPage() {
  const doc = (await getLive()).pages.dance;
  const hero = section(doc, "hero");
  const levels = section(doc, "levels");
  const batches = section(doc, "batches");
  const reviews = section(doc, "reviews");
  const reviewList = reviews.list("list").filter((r) => r.video);
  const quoteList = reviews.list("quotes").filter((q) => q.text);
  const trial = section(doc, "trial");
  const portal = section(doc, "portal");
  const hubLink = section(doc, "hubLink");

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
              <h1 className="display" style={{ fontSize: "clamp(36px, 4.37vw, 61px)", lineHeight: 1.03 }}>
                <Highlight text={hero.text("heading")} />
              </h1>
              <Divider />
              <p className="lead">{hero.text("text")}</p>
              <div className="btn-row" style={{ marginTop: 6 }}>
                {hero.text("b1") && (
                  <a href="#trial" className="btn btn--primary">
                    {hero.text("b1")}
                  </a>
                )}
              </div>
            </div>
            {hero.text("img") && (
              <div style={{ flex: "1 1 460px" }}>
                <ArchImage src={hero.text("img")} alt="Bharatanatyam dancer in a maroon and gold costume, mid-pose and smiling">
                  <PlayButton url={hero.text("video")} title="Navaras Dance Company class" />
                </ArchImage>
              </div>
            )}
          </div>
        </section>
      )}

      {/* PATHWAYS */}
      {levels.visible && (
        <section className="section section--jaal">
          <Levels levels={levels.list("list")} dev={levels.text("kicker")} title={levels.text("heading")} />
        </section>
      )}

      {/* BATCHES */}
      {batches.visible && (
        <section className="section section--cream">
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 48px)" }}>
            <SectionHead eyebrow={batches.text("eyebrow")} title={batches.text("heading")} />
            <div className="grid-auto" style={minCol(300, { gap: 24, maxWidth: 1000, width: "100%", margin: "0 auto" })}>
              {batches.list("list").map((b, i) => {
                const featured = b.style?.startsWith("Highlighted");
                const lines = (s?: string) => (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
                const pros = lines(b.pros);
                const cons = lines(b.cons);
                const listHead = { fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: featured ? "var(--yellow)" : "var(--rose)" } as const;
                return (
                  <div
                    key={i}
                    className="card"
                    style={featured ? { background: "var(--rose)", color: "#fff", boxShadow: "0 0 0 4px var(--cream), 0 0 0 5px var(--line-gold)" } : undefined}
                  >
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600 }}>{b.name}</span>
                    {b.who && <span style={featured ? { color: "var(--yellow)" } : undefined} className={featured ? undefined : "muted"}>{b.who}</span>}
                    {pros.length > 0 && (
                      <>
                        <span style={{ ...listHead, marginTop: 16 }}>Why choose it</span>
                        <ul className="sparkle-list" style={{ fontSize: 15, gap: 8 }}>
                          {pros.map((p, j) => (
                            <li key={j}>
                              <Sparkle fill={featured ? "var(--yellow)" : undefined} stroke={featured ? "#fff" : undefined} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {cons.length > 0 && (
                      <>
                        <span style={{ ...listHead, marginTop: 12 }}>Keep in mind</span>
                        <ul className="sparkle-list" style={{ fontSize: 15, gap: 8, color: featured ? "#FFF1F4" : "var(--muted)" }}>
                          {cons.map((c, j) => (
                            <li key={j}>
                              <span aria-hidden="true" style={{ flex: "none", width: 20, textAlign: "center", fontWeight: 700 }}>–</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <span style={{ marginTop: "auto", paddingTop: 16, fontSize: 20, fontWeight: 700 }}>
                      {b.price || (
                        <a href="#trial" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 4 }}>
                          Ask us
                        </a>
                      )}
                      {b.price && b.per && (
                        <span className={featured ? undefined : "muted"} style={{ fontSize: 14, fontWeight: 500, color: featured ? "#FFF1F4" : undefined }}>
                          {" "}
                          {b.per}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      {reviews.visible && (reviewList.length > 0 || quoteList.length > 0) && (
        <section className="section section--maroon" style={{ paddingTop: "clamp(56px, 10vw, 112px)", paddingBottom: "clamp(56px, 10vw, 112px)" }}>
          <Mandala style={{ right: -340, top: -300, width: 680, height: 680 }} />
          <div className="container" style={{ position: "relative", display: "flex", flexDirection: "column", gap: "clamp(28px, 6vw, 48px)" }}>
            <div className="section-head">
              <p className="eyebrow" style={{ color: "var(--blush)" }}>
                {reviews.text("eyebrow")}
              </p>
              <h2 className="h2" style={{ color: "var(--ivory)" }}>
                {reviews.text("heading")}
              </h2>
              <Divider />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "clamp(20px, 4vw, 40px)" }}>
              {reviewList.map((r, i) => (
                <div key={i} style={{ flex: "0 1 380px", minWidth: 0 }}>
                  <VideoPlayer src={r.video} title={r.name ? `Review from ${r.name}` : "Student review"} ratio="4:5" />
                </div>
              ))}
            </div>
            {quoteList.length > 0 && (
              <div className="review-quotes">
                {quoteList.map((q, i) => (
                  <figure key={i} className="review-quote">
                    <span aria-hidden="true" className="review-quote__mark">
                      “
                    </span>
                    <blockquote>{q.text}</blockquote>
                    <figcaption>
                      {q.name && <strong>{q.name}</strong>}
                      {q.from && <span>{q.from}</span>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TRIAL BOOKING */}
      {trial.visible && (
        <section id="trial" className="section section--ivory" style={{ overflow: "hidden", borderTop: "1px solid var(--line)", scrollMarginTop: 80 }}>
          <Mandala variant="light" style={{ left: -320, bottom: -320, width: 640, height: 640 }} />
          <div className="container split">
            <div className="stack" style={{ flex: "1 1 400px", gap: 18 }}>
              <p className="eyebrow">{trial.text("eyebrow")}</p>
              <h2 className="h2" style={{ fontSize: "clamp(29px, 3.24vw, 40px)" }}>
                {trial.text("heading")}
              </h2>
              <Divider />
              <p className="muted" style={{ fontSize: 16 }}>
                {trial.text("text")}
              </p>
            </div>
            <div style={{ flex: "1 1 560px" }}>
              <TrialBooking slots={trial.list("slots")} sendTo={trial.text("to")} />
            </div>
          </div>
        </section>
      )}

      {/* PORTAL */}
      {portal.visible && (
        <section id="portal" className="section section--cream" style={{ paddingTop: "clamp(56px, 10vw, 120px)", paddingBottom: "clamp(56px, 10vw, 120px)", scrollMarginTop: 80 }}>
          <div className="container split">
            <div className="stack" style={{ flex: "1 1 400px", gap: 18 }}>
              <p className="eyebrow">{portal.text("eyebrow")}</p>
              <h2 className="h2" style={{ fontSize: "clamp(28px, 3.08vw, 37px)", lineHeight: 1.1 }}>
                {portal.text("heading")}
              </h2>
              <Divider />
              <ul className="sparkle-list">
                {portal
                  .list("features")
                  .filter((f) => f.text)
                  .map((f, i) => (
                    <li key={i} style={{ alignItems: "center" }}>
                      <Sparkle />
                      {f.text}
                    </li>
                  ))}
              </ul>
            </div>
            {portal.text("video") ? (
              <div style={{ flex: "1 1 560px", minWidth: 0 }}>
                <VideoPlayer src={portal.text("video")} title="A tour of the student portal" />
              </div>
            ) : portal.text("img") && (
              <div
                className="arch-tile"
                style={{ flex: "1 1 560px", height: 420, borderRadius: 24, boxShadow: "0 0 0 6px var(--ivory), 0 0 0 7px var(--line-gold)" }}
              >
                <img src={portal.text("img")} alt="Student portal" className="cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* HUB LINK */}
      {hubLink.visible && (
        <section className="section section--cream" style={{ paddingTop: 0, paddingBottom: "clamp(56px, 10vw, 120px)" }}>
          <div className="container banner">
            <Mandala reverse style={{ right: -160, top: "50%", marginTop: -220, width: 440, height: 440 }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6 }}>
              <span lang="sa" style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--gold-soft)" }}>
                {hubLink.text("kicker")}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, lineHeight: 1.15 }}>{hubLink.text("heading")}</span>
              <span style={{ color: "var(--blush)" }}>{hubLink.text("text")}</span>
            </div>
            {hubLink.text("btn") && (
              <Link href="/natyashastra-hub" className="btn btn--saffron" style={{ position: "relative", minHeight: 52 }}>
                {hubLink.text("btn")}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}
