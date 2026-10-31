"use client";

import Link from "next/link";
import { useState } from "react";
import { Mandala, Toran } from "@/components/ui";
import { HUB_PATH, itemHref, type HubSummary } from "@/lib/content/hub";
import { STATUS_BADGE, currentSection, nextInSection, sectionStats, totals, type SectionStatus } from "@/lib/learner/stats";
import { loginHref } from "./HubBar";
import { CheckCircle, QuizIcon } from "./icons";
import { useLearner } from "./LearnerProvider";

const TABS: ("all" | SectionStatus)[] = ["all", "In progress", "Completed", "Not started"];

export default function MyLearning({ hub }: { hub: HubSummary }) {
  const { ready, learner, progress } = useLearner();
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");

  if (!ready) return <section className="hero-section" style={{ minHeight: 600 }} aria-busy="true" />;

  if (!learner) {
    return (
      <section className="hero-section" style={{ padding: "104px 32px" }}>
        <Toran />
        <div className="container section-head" style={{ gap: 18 }}>
          <p className="eyebrow">My learning</p>
          <h1 className="display" style={{ fontSize: "clamp(34px, 4vw, 52px)" }}>
            Log in to see your progress
          </h1>
          <p className="muted" style={{ fontSize: 17, maxWidth: 560 }}>
            Your chapters read, quiz scores and where you left off are saved to your free account.
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link href={loginHref(`${HUB_PATH}/my-learning`)} className="btn btn--primary">
              Log in
            </Link>
            <Link href={HUB_PATH} className="btn btn--outline">
              Browse the library
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const t = totals(hub, progress);
  const stats = hub.sections.map((s) => ({ s, st: sectionStats(s, progress) }));
  const cur = currentSection(hub, progress);
  const curStats = cur && sectionStats(cur, progress);
  const curNext = cur && nextInSection(cur, progress);
  const completed = stats.filter((x) => x.st.status === "Completed").length;
  const quizIds = new Set(hub.sections.flatMap((s) => s.quizzes.map((q) => q.id)));
  const scores = Object.entries(progress.quizzes)
    .filter(([id]) => quizIds.has(id))
    .map(([, r]) => r.best);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

  const rows = stats.filter((x) => tab === "all" || x.st.status === tab);
  const toTake = [] as { title: string; section: string; type: string; href: string }[];
  const done = [] as { title: string; section: string; score: number; href: string }[];
  for (const { s, st } of stats) {
    for (const q of s.quizzes) {
      const r = progress.quizzes[q.id];
      if (r) done.push({ title: q.title, section: s.title, score: r.best, href: itemHref(s, q) });
      else if (st.read > 0) toTake.push({ title: q.title, section: s.title, type: q.type, href: itemHref(s, q) });
    }
  }
  const recent = hub.sections
    .flatMap((s) => s.chapters.filter((c) => progress.read[c.id]).map((c) => ({ c, s, at: progress.read[c.id] })))
    .sort((a, b) => b.at - a.at)
    .slice(0, 4);
  const byCat = hub.categories
    .map((k) => {
      let read = 0;
      let total = 0;
      for (const s of hub.sections.filter((x) => x.cat === k.id)) {
        for (const c of s.chapters) {
          total++;
          if (progress.read[c.id]) read++;
        }
      }
      return { ...k, read, total };
    })
    .filter((k) => k.total > 0);
  const catName = (id: string) => hub.categories.find((c) => c.id === id)?.name ?? "";

  return (
    <>
      <section className="hero-section" style={{ padding: "96px 32px 40px" }}>
        <Toran />
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="eyebrow">My learning</span>
              <h1 className="display" style={{ fontSize: "clamp(36px, 4.2vw, 54px)" }}>
                Namaste{learner.name && `, ${learner.name}`}
              </h1>
              <span className="muted" style={{ fontSize: 17 }}>
                Here’s where you are in the Natyashastra Hub.
              </span>
              <span className="muted" style={{ fontSize: 14 }}>
                Logged in as {learner.email || learner.phone}
              </span>
            </div>
            <Link href={HUB_PATH} className="btn btn--outline btn--sm" style={{ minHeight: 48 }}>
              Browse the library
            </Link>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "stretch" }}>
            {cur && curStats && curNext && (
              <div className="ml-current">
                <Mandala style={{ right: -260, top: -240, width: 600, height: 600 }} />
                <div className="arch-thumb ml-current__img">{cur.img && <img src={cur.img} alt="" className="cover" />}</div>
                <div style={{ position: "relative", flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  <span className="label" style={{ color: "var(--gold-soft)" }}>
                    {curStats.status === "Not started" ? "Up next" : "Currently reading"}
                    {catName(cur.cat) && ` · ${catName(cur.cat)}`}
                  </span>
                  <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, lineHeight: 1.1 }}>{cur.title}</span>
                    <span lang="sa" style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--gold-soft)" }}>
                      {cur.dev}
                    </span>
                  </span>
                  <span style={{ color: "var(--blush)" }}>
                    Next up:{" "}
                    <strong style={{ color: "var(--ivory)" }}>
                      {curNext.pos ? `Chapter ${curNext.pos} · ` : ""}
                      {curNext.title}
                    </strong>
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 460 }}>
                    <div
                      role="progressbar"
                      aria-label="Section progress"
                      aria-valuemin={0}
                      aria-valuemax={curStats.total}
                      aria-valuenow={curStats.read}
                      className="progress"
                      style={{ height: 10, background: "var(--maroon-deep)" }}
                    >
                      <div style={{ width: `${curStats.pct}%` }} />
                    </div>
                    <span style={{ fontSize: 13, color: "var(--blush)" }}>
                      {curStats.read} of {curStats.total} chapters read · {curStats.quizDone} of {cur.quizzes.length} quizzes taken
                    </span>
                  </div>
                  <Link href={curNext.href} className="btn btn--saffron btn--sm" style={{ alignSelf: "flex-start", marginTop: 6, minHeight: 50 }}>
                    Continue reading →
                  </Link>
                </div>
              </div>
            )}

            <div className="ml-stats">
              {[
                { label: "Chapters read", value: String(t.read), of: ` / ${t.chapters}`, pct: t.pct, color: "var(--saffron)" },
                { label: "Sections completed", value: String(completed), of: ` / ${hub.sections.length}`, pct: pct(completed, hub.sections.length), color: "var(--green)" },
                { label: "Quizzes taken", value: String(scores.length), of: ` / ${t.quizzes}`, pct: pct(scores.length, t.quizzes), color: "var(--rose)" },
                { label: "Average quiz score", value: scores.length ? `${avg}%` : "—", of: "", pct: avg, color: "var(--maroon)" },
              ].map((x) => (
                <div key={x.label} className="ml-stat">
                  <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                    {x.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, lineHeight: 1 }}>
                    {x.value}
                    <span className="muted" style={{ fontSize: 16 }}>
                      {x.of}
                    </span>
                  </span>
                  <div aria-hidden="true" className="progress" style={{ height: 6 }}>
                    <div style={{ width: `${x.pct}%`, background: x.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--cream" style={{ padding: "24px 32px 104px" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          <div className="ml-panel" style={{ flex: "999 1 600px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 28 }}>Your sections</h2>
              <div role="group" aria-label="Filter by status" className="segmented" style={{ background: "var(--sand)", border: "none" }}>
                {TABS.map((k) => (
                  <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)} style={{ fontSize: 13 }}>
                    {k === "all" ? "All" : k} <span style={{ opacity: 0.75 }}>{k === "all" ? stats.length : stats.filter((x) => x.st.status === k).length}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {rows.length === 0 && (
                <p className="muted" style={{ padding: "16px 4px", borderTop: "1px solid #F0E0C2" }}>
                  Nothing here yet.
                </p>
              )}
              {rows.map(({ s, st }) => {
                const href = st.status === "Completed" ? (s.chapters[0] ? itemHref(s, s.chapters[0]) : null) : nextInSection(s, progress)?.href;
                return (
                  <div key={s.id} className="ml-row">
                    <div className="arch-thumb" style={{ width: 56, height: 70 }}>
                      {s.img && <img src={s.img} alt="" className="cover" />}
                    </div>
                    <div style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span className="label">{catName(s.cat)}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, lineHeight: 1.15 }}>{s.title}</span>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                        <div aria-hidden="true" className="progress" style={{ flex: 1, maxWidth: 220, minWidth: 80, height: 6 }}>
                          <div style={{ width: `${st.pct}%` }} />
                        </div>
                        <span className="muted" style={{ fontSize: 13 }}>
                          {st.read}/{st.total} chapters · {st.quizDone}/{s.quizzes.length} quizzes
                        </span>
                      </div>
                    </div>
                    <span className="status-pill" style={{ background: STATUS_BADGE[st.status].bg, color: STATUS_BADGE[st.status].ink }}>
                      {st.status}
                    </span>
                    {href && (
                      <Link href={href} className="btn btn--outline btn--sm" style={{ minHeight: 44 }}>
                        {st.status === "Completed" ? "Review" : st.status === "In progress" ? "Continue" : "Start"}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
            <div className="ml-panel">
              <h2 style={{ fontSize: 24 }}>Quizzes</h2>
              <span className="label" style={{ color: "var(--rose)" }}>
                Ready to take
              </span>
              {toTake.length === 0 && <span className="muted" style={{ fontSize: 14 }}>Read a chapter to unlock its section’s quizzes here.</span>}
              {toTake.map((q) => (
                <Link key={q.href} href={q.href} className="ml-item">
                  <QuizIcon />
                  <span style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                    <strong>{q.title}</strong>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {q.section} · {q.type}
                    </span>
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--rose)" }}>Start</span>
                </Link>
              ))}
              {done.length > 0 && (
                <span className="label" style={{ color: "var(--green)", marginTop: 6 }}>
                  Completed
                </span>
              )}
              {done.map((q) => (
                <Link key={q.href} href={q.href} className="ml-item ml-item--done">
                  <CheckCircle />
                  <span style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                    <strong>{q.title}</strong>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {q.section}
                    </span>
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: "var(--green)" }}>{q.score}%</span>
                </Link>
              ))}
            </div>

            <div className="ml-panel">
              <h2 style={{ fontSize: 24 }}>Recently read</h2>
              {recent.length === 0 && <span className="muted" style={{ fontSize: 14 }}>Chapters you mark as read show up here.</span>}
              {recent.map(({ c, s }) => (
                <Link key={c.id} href={itemHref(s, c)} className="ml-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
                  <strong>{c.title}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {s.title}
                  </span>
                </Link>
              ))}
            </div>

            {byCat.length > 0 && (
              <div className="ml-panel" style={{ gap: 14 }}>
                <h2 style={{ fontSize: 24 }}>By category</h2>
                {byCat.map((k) => (
                  <div key={k.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 15 }}>
                      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, fontWeight: 700 }}>
                        {k.name}
                        <span lang="sa" style={{ fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--rose)" }}>
                          {k.dev}
                        </span>
                      </span>
                      <span className="muted">
                        {k.read}/{k.total}
                      </span>
                    </div>
                    <div aria-hidden="true" className="progress" style={{ height: 8 }}>
                      <div style={{ width: `${pct(k.read, k.total)}%`, background: "var(--rose)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
