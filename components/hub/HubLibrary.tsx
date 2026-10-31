"use client";

import Link from "next/link";
import { useState } from "react";
import { Divider, LockIcon, Mandala, Sparkle, Toran } from "@/components/ui";
import { HUB_PATH, type HubSummary } from "@/lib/content/hub";
import { STATUS_BADGE, currentSection, nextInSection, sectionStats, totals } from "@/lib/learner/stats";
import { loginHref } from "./HubBar";
import { BookIcon, QuizIcon } from "./icons";
import { useLearner } from "./LearnerProvider";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function HubLibrary({ hub, initialCategory }: { hub: HubSummary; initialCategory?: string }) {
  const { ready, learner, progress } = useLearner();
  const [filter, setFilter] = useState(hub.categories.some((c) => c.id === initialCategory) ? initialCategory! : "all");
  const t = totals(hub, progress);
  const catName = (id: string) => hub.categories.find((c) => c.id === id)?.name ?? "";
  const shown = hub.sections.filter((s) => filter === "all" || s.cat === filter);
  const usedCats = hub.categories.filter((c) => hub.sections.some((s) => s.cat === c.id));

  const cur = learner ? currentSection(hub, progress) : undefined;
  const curStats = cur && sectionStats(cur, progress);
  const curNext = cur && nextInSection(cur, progress);

  return (
    <>
      {/* HERO */}
      <section className="hero-section" style={{ padding: "96px 32px 72px" }}>
        <Toran />
        <Mandala variant="light" style={{ left: -320, top: -180, width: 640, height: 640 }} />
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center", justifyContent: "space-between" }}>
          <div className="stack" style={{ flex: "1 1 560px", minWidth: 0, gap: 16 }}>
            <p lang="sa" className="dev" style={{ fontSize: 23, fontWeight: 400 }}>
              नाट्यशास्त्र
            </p>
            <h1 className="display" style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}>
              Natyashastra Hub
            </h1>
            <Divider />
            <p className="muted" style={{ fontSize: 17, maxWidth: 620 }}>
              {learner
                ? `Welcome back${learner.name && `, ${learner.name}`}. Pick a section to keep reading, or take a quiz to test yourself.`
                : "The theory behind classical Indian dance, organised into sections and chapters. Reading is free for everyone — log in to save your progress and take the quizzes."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <span className="count-pill">{plural(hub.sections.length, "section", "sections")}</span>
              <span className="count-pill">{plural(t.chapters, "chapter", "chapters")}</span>
              <span className="count-pill">{plural(t.quizzes, "quiz", "quizzes")}</span>
            </div>
          </div>

          {!ready && <div className="hub-login-card" aria-hidden="true" style={{ visibility: "hidden", minHeight: 280 }} />}

          {ready && !learner && (
            <div className="hub-login-card">
              <span className="label" style={{ color: "var(--gold-soft)" }}>
                Reading is free
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 25, fontWeight: 600, lineHeight: 1.2 }}>
                Log in to track your progress and take quizzes.
              </span>
              <ul className="sparkle-list" style={{ gap: 8, fontSize: 15 }}>
                {["Read every chapter, photos and videos — no account needed", "Mark chapters as read and see your progress", "Take quizzes and keep your scores"].map(
                  (p) => (
                    <li key={p} style={{ alignItems: "center" }}>
                      <Sparkle stroke="#F2C46D" />
                      {p}
                    </li>
                  ),
                )}
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <Link href={loginHref(HUB_PATH)} className="btn btn--saffron btn--sm" style={{ minHeight: 50 }}>
                  Log in
                </Link>
                <Link href={loginHref(HUB_PATH)} style={{ color: "var(--gold-soft)", fontWeight: 700 }}>
                  Create a free account
                </Link>
              </div>
            </div>
          )}

          {learner && cur && curStats && curNext && (
            <div className="hub-continue">
              <span className="label" style={{ color: "var(--rose)" }}>
                Continue where you left off
              </span>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div className="arch-thumb" style={{ width: 84, height: 104 }}>
                  {cur.img && <img src={cur.img} alt="" className="cover" />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, lineHeight: 1.15 }}>{cur.title}</span>
                  <span className="muted" style={{ fontSize: 14 }}>
                    Next: {curNext.title}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div aria-hidden="true" className="progress" style={{ height: 10 }}>
                  <div style={{ width: `${curStats.pct}%` }} />
                </div>
                <span className="muted" style={{ fontSize: 13 }}>
                  {curStats.read} of {curStats.total} chapters read
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <Link href={curNext.href} className="btn btn--primary btn--sm" style={{ minHeight: 50 }}>
                  Continue reading
                </Link>
                <Link href={`${HUB_PATH}/my-learning`} style={{ fontWeight: 700 }}>
                  Go to My learning →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LIBRARY */}
      <section id="library" className="section section--jaal" style={{ paddingTop: 96, paddingBottom: 104, scrollMarginTop: 60 }}>
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <div className="section-head">
            <p className="eyebrow">Library</p>
            <h2 className="h2" style={{ fontSize: "clamp(30px, 3.4vw, 44px)" }}>
              Choose a section
            </h2>
            <Divider />
            {usedCats.length > 1 && (
              <div role="group" aria-label="Filter by category" style={{ marginTop: 8, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                {[{ id: "all", name: "All sections", dev: "" }, ...usedCats].map((c) => (
                  <button key={c.id} type="button" className="chip chip--dev" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
                    {c.name}
                    {c.dev && <span lang="sa">{c.dev}</span>}
                  </button>
                ))}
              </div>
            )}
            <span aria-live="polite" className="muted" style={{ fontSize: 14 }}>
              Showing {shown.length} of {plural(hub.sections.length, "section", "sections")}
            </span>
          </div>

          {hub.sections.length === 0 ? (
            <p className="muted" style={{ textAlign: "center" }}>
              New sections are on their way. Check back soon.
            </p>
          ) : (
            <div className="grid-fill" style={{ "--min": "330px", gap: 24 } as React.CSSProperties}>
              {shown.map((s) => {
                const st = sectionStats(s, progress);
                const next = nextInSection(s, progress);
                const inProgress = learner && st.status === "In progress";
                const cta = !learner ? "Start reading" : st.status === "Completed" ? "Review" : st.status === "In progress" ? "Continue" : "Start";
                const href = learner && st.status === "Completed" ? (s.chapters[0] ? `${HUB_PATH}/${s.slug}/${s.chapters[0].slug}` : next?.href) : next?.href;
                return (
                  <article key={s.id} className="sec-card">
                    <div className="sec-card__media">
                      {s.img && <img src={s.img} alt="" className="cover" />}
                      {catName(s.cat) && <span className="sec-card__cat">{catName(s.cat)}</span>}
                      {learner && (
                        <span className="sec-card__status" style={{ background: STATUS_BADGE[st.status].bg, color: STATUS_BADGE[st.status].ink }}>
                          {st.status}
                        </span>
                      )}
                    </div>
                    <div className="sec-card__body">
                      <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
                        <h3 className="sec-card__title">{s.title}</h3>
                        <span lang="sa" className="sec-card__dev">
                          {s.dev}
                        </span>
                      </span>
                      <span className="muted">{s.desc}</span>
                      <span className="sec-card__meta">
                        <span>
                          <BookIcon />
                          {plural(s.chapters.length, "chapter", "chapters")}
                        </span>
                        <span>
                          <QuizIcon />
                          {plural(s.quizzes.length, "quiz", "quizzes")}
                        </span>
                      </span>
                      {learner ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                          <div aria-hidden="true" className="progress" style={{ height: 8 }}>
                            <div style={{ width: `${st.pct}%` }} />
                          </div>
                          <span className="muted" style={{ fontSize: 13 }}>
                            {st.read} of {plural(st.total, "chapter", "chapters")} read · {st.quizDone} of {plural(s.quizzes.length, "quiz", "quizzes")} taken
                          </span>
                        </div>
                      ) : (
                        ready && (
                          <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginTop: 4 }}>
                            <LockIcon size={14} />
                            Quizzes and progress need a free login
                          </span>
                        )
                      )}
                      {href && (
                        <Link href={href} className={`btn btn--sm ${inProgress ? "btn--primary" : "btn--outline"}`} style={{ marginTop: "auto", alignSelf: "flex-start", minHeight: 46 }}>
                          {cta} →
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS (logged out) */}
      {ready && !learner && (
        <section className="section section--cream" style={{ paddingTop: 104, paddingBottom: 104 }}>
          <div className="container" style={{ maxWidth: 1120, display: "flex", flexDirection: "column", gap: 40 }}>
            <div className="section-head">
              <p className="eyebrow">How the Hub works</p>
              <h2 className="h2" style={{ fontSize: "clamp(28px, 3.2vw, 40px)" }}>
                Read freely. Log in when you want to track.
              </h2>
              <Divider />
            </div>
            <ol className="grid-auto" style={{ "--min": "260px", margin: 0, padding: 0, listStyle: "none", gap: 20 } as React.CSSProperties}>
              {[
                ["१", "Read any chapter", "Every chapter, photo and video is open to everyone."],
                ["२", "Create a free account", "Log in with Google or your phone number."],
                ["३", "Track and test yourself", "Mark chapters as read, take quizzes and keep your scores."],
              ].map(([n, title, text], i) => (
                <li key={n} className={`card card--center${i === 2 ? " card--maroon" : ""}`}>
                  <span lang="hi" className="numeral" style={i === 2 ? { borderColor: "var(--gold-soft)", color: "var(--gold-soft)" } : undefined}>
                    {n}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>{title}</span>
                  <span style={{ color: i === 2 ? "var(--blush)" : "var(--muted)" }}>{text}</span>
                </li>
              ))}
            </ol>
            <Link href={loginHref(HUB_PATH)} className="btn btn--primary" style={{ alignSelf: "center" }}>
              Create a free account
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
