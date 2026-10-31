"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import RichText from "@/components/RichText";
import { LockIcon } from "@/components/ui";
import { HUB_PATH, itemHref, type HubSection, type HubSummary, type SectionSummary } from "@/lib/content/hub";
import { sectionStats } from "@/lib/learner/stats";
import { loginHref } from "./HubBar";
import { CheckCircle, QuizIcon } from "./icons";
import { useLearner } from "./LearnerProvider";
import QuizPlayer from "./QuizPlayer";

type View = { kind: "chapter" | "quiz"; index: number };

type Props = {
  section: HubSection;
  view: View;
  summary: HubSummary;
  categoryName: string;
  nextSection?: SectionSummary;
};

export default function SectionReader({ section: s, view, summary, categoryName, nextSection }: Props) {
  const pathname = usePathname();
  const { ready, learner, progress, visit } = useLearner();
  const sum = summary.sections.find((x) => x.id === s.id)!;
  const st = sectionStats(sum, progress);
  const chapter = view.kind === "chapter" ? s.chapters[view.index] : undefined;

  useEffect(() => {
    if (learner && chapter) visit(s.id, chapter.id);
    // Record each chapter once per visit, not on every progress change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learner?.id, chapter?.id]);

  const others = summary.sections.filter((x) => x.id !== s.id);

  return (
    <section className="section section--cream" style={{ padding: "32px 32px 104px" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <nav aria-label="Breadcrumb" className="muted" style={{ fontSize: 14 }}>
          <ol className="crumbs">
            <li>
              <Link href={HUB_PATH} style={{ fontWeight: 600 }}>
                Library
              </Link>
            </li>
            {categoryName && (
              <li>
                <Link href={`${HUB_PATH}?category=${encodeURIComponent(s.cat)}#library`}>{categoryName}</Link>
              </li>
            )}
            <li aria-current="page" style={{ fontWeight: 600, color: "var(--ink)" }}>
              {s.title}
            </li>
          </ol>
        </nav>

        <div className="reader">
          <aside aria-label="Section contents" className="reader-aside">
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div className="arch-thumb" style={{ width: 70, height: 88 }}>
                {s.img && <img src={s.img} alt="" className="cover" />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                {categoryName && <span className="label">{categoryName}</span>}
                <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, lineHeight: 1.15 }}>{s.title}</span>
                <span lang="sa" style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--rose)" }}>
                  {s.dev}
                </span>
              </div>
            </div>

            {learner ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  role="progressbar"
                  aria-label="Chapters read in this section"
                  aria-valuemin={0}
                  aria-valuemax={st.total}
                  aria-valuenow={st.read}
                  className="progress"
                  style={{ height: 8 }}
                >
                  <div style={{ width: `${st.pct}%` }} />
                </div>
                <span className="muted" style={{ fontSize: 13 }}>
                  {st.read} of {st.total} chapters read
                </span>
              </div>
            ) : (
              ready && (
                <div className="reader-note">
                  Reading is free. <Link href={loginHref(pathname)}>Log in</Link> to save your progress and take the quizzes.
                </div>
              )
            )}

            {s.chapters.length > 0 && (
              <div className="reader-group">
                <span className="label" style={{ color: "var(--rose)", padding: "0 8px 6px" }}>
                  Chapters
                </span>
                {s.chapters.map((c, i) => {
                  const done = Boolean(learner && progress.read[c.id]);
                  return (
                    <Link key={c.id} href={itemHref(s, c)} className="reader-link" aria-current={chapter?.id === c.id ? "page" : undefined}>
                      {c.thumb ? (
                        <img src={c.thumb} alt="" className="reader-thumb" />
                      ) : (
                        <span aria-hidden="true" className="reader-num">
                          {i + 1}
                        </span>
                      )}
                      <span style={{ flex: 1 }}>{c.title}</span>
                      {done && <CheckCircle size={24} />}
                    </Link>
                  );
                })}
              </div>
            )}

            {s.quizzes.length > 0 && (
              <div className="reader-group">
                <span className="label" style={{ color: "var(--rose)", padding: "0 8px 6px" }}>
                  Quizzes
                </span>
                {s.quizzes.map((q, i) => {
                  const rec = progress.quizzes[q.id];
                  const tag = learner ? (rec ? `${rec.best}%` : "Not taken") : ready ? "Login" : "";
                  return (
                    <Link
                      key={q.id}
                      href={itemHref(s, q)}
                      className="reader-link reader-link--quiz"
                      aria-current={view.kind === "quiz" && view.index === i ? "page" : undefined}
                    >
                      {learner ? <QuizIcon /> : <LockIcon size={18} />}
                      <span style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                        <span>{q.title}</span>
                        <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>
                          {q.type}
                        </span>
                      </span>
                      {tag && <span className={`reader-tag${learner && rec ? " reader-tag--done" : ""}`}>{tag}</span>}
                    </Link>
                  );
                })}
              </div>
            )}

            {others.length > 0 && (
              <div className="reader-group" style={{ paddingTop: 14, borderTop: "1px dashed var(--line-input)" }}>
                <span className="label" style={{ padding: "0 8px 6px" }}>
                  Other sections
                </span>
                {others.map((o) => {
                  const first = o.chapters[0] ?? o.quizzes[0];
                  if (!first) return null;
                  const os = sectionStats(o, progress);
                  return (
                    <Link key={o.id} href={itemHref(o, first)} className="reader-link reader-link--other">
                      <span>{o.title}</span>
                      <span className="muted" style={{ fontSize: 12 }}>
                        {learner ? `${os.read}/${os.total}` : `${o.chapters.length} ch`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </aside>

          <article className="reader-article">
            {chapter && <ChapterView section={s} index={view.index} nextSection={nextSection} />}
            {view.kind === "quiz" && (
              <QuizPlayer
                section={s}
                quiz={s.quizzes[view.index]}
                nextSection={nextSection}
                firstChapterHref={s.chapters[0] ? itemHref(s, s.chapters[0]) : undefined}
              />
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

function ChapterView({ section: s, index, nextSection }: { section: HubSection; index: number; nextSection?: SectionSummary }) {
  const pathname = usePathname();
  const { ready, learner, progress, setRead } = useLearner();
  const c = s.chapters[index];
  const isRead = Boolean(progress.read[c.id]);
  const prev = s.chapters[index - 1];
  const nextCh = s.chapters[index + 1];
  const firstQuiz = s.quizzes[0];
  const nextSectionFirst = nextSection && (nextSection.chapters[0] ?? nextSection.quizzes[0]);
  const next = nextCh
    ? { href: itemHref(s, nextCh), label: `Next: ${nextCh.title}` }
    : firstQuiz
      ? { href: itemHref(s, firstQuiz), label: "Take the quiz" }
      : nextSection && nextSectionFirst
        ? { href: itemHref(nextSection, nextSectionFirst), label: `Next section: ${nextSection.title}` }
        : null;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <span className="label" style={{ fontSize: 13 }}>
          Chapter {index + 1} of {s.chapters.length}
        </span>
        {learner && (
          <span className="status-pill" style={{ background: isRead ? "var(--green)" : "var(--sand)", color: isRead ? "#fff" : "var(--muted)" }}>
            {isRead ? "✓ Read" : "Not read yet"}
          </span>
        )}
      </div>
      <h1 style={{ fontSize: "clamp(32px, 3.8vw, 48px)", lineHeight: 1.05 }}>{c.title}</h1>

      {c.body && <RichText html={c.body} className="lesson" />}

      {ready && !learner && (
        <div className="reader-cta">
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600 }}>Want to save your progress?</span>
            <span style={{ fontSize: 14, color: "var(--blush)" }}>Log in to mark chapters as read and take this section’s quizzes.</span>
          </span>
          <Link href={loginHref(pathname)} className="btn btn--saffron btn--sm" style={{ minHeight: 48 }}>
            Log in
          </Link>
        </div>
      )}

      <div className="reader-actions">
        {learner ? (
          <button
            type="button"
            className="btn"
            aria-pressed={isRead}
            style={{ background: isRead ? "var(--green)" : "var(--rose)", color: "#fff" }}
            onClick={() => setRead(c.id, !isRead)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isRead ? "Marked as read" : "Mark as read"}
          </button>
        ) : (
          <span className="muted" style={{ fontSize: 14 }}>
            Chapter {index + 1} of {s.chapters.length}
          </span>
        )}
        <div className="btn-row" style={{ gap: 10 }}>
          {prev ? (
            <Link href={itemHref(s, prev)} className="btn btn--outline btn--sm">
              ← Previous
            </Link>
          ) : (
            <span className="btn btn--outline btn--sm" aria-disabled="true" style={{ opacity: 0.4 }}>
              ← Previous
            </span>
          )}
          {next && (
            <Link href={next.href} className="btn btn--dark btn--sm">
              {next.label} →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
