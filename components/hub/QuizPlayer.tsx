"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LockIcon, Mandala } from "@/components/ui";
import { itemHref, type HubSection, type Quiz, type SectionSummary } from "@/lib/content/hub";
import { loginHref } from "./HubBar";
import { useLearner } from "./LearnerProvider";

const LETTERS = "ABCDEFGH";

type Stage = "intro" | "question" | "results";

export default function QuizPlayer({
  section: s,
  quiz,
  nextSection,
  firstChapterHref,
}: {
  section: HubSection;
  quiz: Quiz;
  nextSection?: SectionSummary;
  firstChapterHref?: string;
}) {
  const pathname = usePathname();
  const { ready, learner, progress, recordQuiz } = useLearner();
  const [stage, setStage] = useState<Stage>("intro");
  const [qi, setQi] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [bestBefore, setBestBefore] = useState<number | null>(null);

  const questions = quiz.questions;
  const total = questions.length;
  const record = progress.quizzes[quiz.id];
  const right = answers.filter((a, i) => questions[i] && a === questions[i].answer).length;

  const start = () => {
    setBestBefore(record?.best ?? null);
    setStage("question");
    setQi(0);
    setChoice(null);
    setChecked(false);
    setAnswers([]);
  };

  const check = () => {
    if (choice === null || checked) return;
    setChecked(true);
    setAnswers((a) => [...a, choice]);
  };

  const next = () => {
    if (qi >= total - 1) {
      // `answers` already includes this question's answer (added when it was checked).
      recordQuiz(quiz.id, Math.round((right / total) * 100));
      setStage("results");
    } else {
      setQi(qi + 1);
      setChoice(null);
      setChecked(false);
    }
  };

  const nextFirst = nextSection && (nextSection.chapters[0] ?? nextSection.quizzes[0]);

  return (
    <>
      <span className="label" style={{ fontSize: 13 }}>
        Quiz · {quiz.type}
      </span>
      <h1 style={{ fontSize: "clamp(32px, 3.8vw, 48px)", lineHeight: 1.05 }}>{quiz.title}</h1>
      <span className="muted" style={{ fontSize: 16 }}>
        Part of {s.title}
      </span>

      {ready && !learner && (
        <div className="quiz-panel quiz-panel--center" style={{ padding: "56px 32px" }}>
          <Mandala style={{ left: "50%", top: "50%", width: 640, height: 640, margin: "-320px 0 0 -320px" }} />
          <span aria-hidden="true" className="quiz-lock">
            <LockIcon size={34} />
          </span>
          <span className="quiz-panel__title">Log in to take this quiz</span>
          <span style={{ position: "relative", maxWidth: 460, color: "var(--blush)" }}>
            Quizzes need a free account so we can save your answers and scores. The chapters stay free to read.
          </span>
          <div className="btn-row" style={{ position: "relative", justifyContent: "center" }}>
            <Link href={loginHref(pathname)} className="btn btn--saffron">
              Log in
            </Link>
            <Link href={loginHref(pathname)} className="btn btn--ghost-light">
              Create a free account
            </Link>
          </div>
          {firstChapterHref && (
            <Link href={firstChapterHref} style={{ position: "relative", color: "var(--gold-soft)", fontWeight: 700 }}>
              ← Keep reading the chapters
            </Link>
          )}
        </div>
      )}

      {learner && stage === "intro" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="grid-auto" style={{ "--min": "140px", gap: 12 } as React.CSSProperties}>
            {[
              ["Questions", String(total)],
              ["Pass mark", `${quiz.pass}%`],
              ["Your best score", record ? `${record.best}%` : "—"],
              ["Attempts", String(record?.attempts ?? 0)],
            ].map(([k, v]) => (
              <div key={k} className="quiz-stat">
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div className="quiz-panel">
            <Mandala style={{ right: -220, top: -220, width: 520, height: 520 }} />
            <h2 style={{ position: "relative", fontSize: 24 }}>Before you start</h2>
            <ul className="quiz-rules">
              <li>Pick one answer, then check it. You’ll see why it’s right before moving on.</li>
              <li>There’s no time limit — take it at your own pace.</li>
              <li>Your score is saved to your account. Retake it any time to improve your best.</li>
            </ul>
            <button type="button" className="btn btn--saffron" style={{ position: "relative", alignSelf: "flex-start", marginTop: 8, fontSize: 17 }} onClick={start}>
              Start quiz →
            </button>
          </div>
        </div>
      )}

      {learner && stage === "question" && questions[qi] && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
            <span className="label" style={{ fontSize: 13 }}>
              Question {qi + 1} of {total}
            </span>
            <span className="count-pill" style={{ fontSize: 13 }}>
              Score so far: {right} / {answers.length}
            </span>
          </div>
          <ol aria-label="Progress" className="quiz-steps" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
            {questions.map((q, i) => {
              const done = i < answers.length;
              const good = done && answers[i] === q.answer;
              const cur = i === qi;
              return (
                <li
                  key={i}
                  aria-label={`Question ${i + 1}${done ? (good ? ", correct" : ", incorrect") : cur ? ", current" : ""}`}
                  data-state={done ? (good ? "right" : "wrong") : cur ? "current" : "todo"}
                />
              );
            })}
          </ol>
          <QuestionCard
            q={questions[qi]}
            choice={choice}
            checked={checked}
            last={qi >= total - 1}
            onPick={(i) => !checked && setChoice(i)}
            onCheck={check}
            onNext={next}
          />
        </div>
      )}

      {learner && stage === "results" && (
        <Results
          quiz={quiz}
          right={right}
          answers={answers}
          bestBefore={bestBefore}
          onRetake={start}
          next={nextSection && nextFirst ? { href: itemHref(nextSection, nextFirst), label: `Next section: ${nextSection.title}` } : undefined}
        />
      )}
    </>
  );
}

function QuestionCard({
  q,
  choice,
  checked,
  last,
  onPick,
  onCheck,
  onNext,
}: {
  q: Quiz["questions"][number];
  choice: number | null;
  checked: boolean;
  last: boolean;
  onPick: (i: number) => void;
  onCheck: () => void;
  onNext: () => void;
}) {
  const ok = choice === q.answer;
  return (
    <div className="quiz-card">
      <h2 id="quiz-q" style={{ fontSize: 28, lineHeight: 1.2 }}>
        {q.text}
      </h2>
      <div role="radiogroup" aria-labelledby="quiz-q" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {q.options.map((label, i) => {
          const chosen = choice === i;
          const isAns = checked && i === q.answer;
          const isWrong = checked && chosen && i !== q.answer;
          const state = isAns ? "right" : isWrong ? "wrong" : chosen ? "chosen" : "idle";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={chosen}
              aria-disabled={checked}
              className="quiz-option"
              data-state={state}
              onClick={() => onPick(i)}
            >
              <span aria-hidden="true" className="quiz-option__dot">
                {isAns ? "✓" : isWrong ? "✕" : LETTERS[i]}
              </span>
              <span style={{ flex: 1 }}>{label}</span>
            </button>
          );
        })}
      </div>
      {checked && (
        <div role="status" className="quiz-feedback" data-state={ok ? "right" : "wrong"}>
          <span aria-hidden="true" className="quiz-feedback__dot">
            {ok ? "✓" : "!"}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong>{ok ? "Correct!" : `Not quite — the answer is ${q.options[q.answer]}.`}</strong>
            {q.explain && <span>{q.explain}</span>}
          </span>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <span className="muted" style={{ fontSize: 14 }}>
          {checked ? "" : choice === null ? "Choose an answer to continue." : "Ready? Check your answer."}
        </span>
        {checked ? (
          <button type="button" className="btn btn--dark" onClick={onNext}>
            {last ? "See results" : "Next question"} →
          </button>
        ) : (
          <button type="button" className="btn btn--primary" disabled={choice === null} onClick={onCheck}>
            Check answer
          </button>
        )}
      </div>
    </div>
  );
}

function Results({
  quiz,
  right,
  answers,
  bestBefore,
  onRetake,
  next,
}: {
  quiz: Quiz;
  right: number;
  answers: number[];
  bestBefore: number | null;
  onRetake: () => void;
  next?: { href: string; label: string };
}) {
  const total = quiz.questions.length;
  const pct = Math.round((right / total) * 100);
  const passed = pct >= quiz.pass;
  const newBest = bestBefore === null || pct > bestBefore;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="quiz-panel quiz-panel--center" style={{ padding: "40px 32px" }}>
        <Mandala style={{ left: "50%", top: "50%", width: 640, height: 640, margin: "-320px 0 0 -320px" }} />
        <div className="quiz-score" style={{ boxShadow: `0 0 0 6px ${passed ? "#4F7A3A" : "#E89A2C"}, 0 0 0 8px var(--gold)` }}>
          <strong>{pct}%</strong>
          <span>
            {right} of {total} correct
          </span>
        </div>
        <span className="quiz-panel__title" style={{ marginTop: 6 }}>
          {passed ? (pct === 100 ? "Perfect score!" : "Well done — you passed") : "Almost there"}
        </span>
        <span style={{ position: "relative", maxWidth: 520, color: "var(--blush)" }}>
          {passed
            ? "Your score is saved. Carry on to the next section when you’re ready."
            : "Read the chapters again and retake the quiz — your best score is the one that counts."}
        </span>
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          <span className="status-pill" style={{ background: passed ? "var(--green)" : "#FDEBD0", color: passed ? "#fff" : "#7A4A0C" }}>
            {passed ? "Passed" : "Not passed yet"}
          </span>
          {newBest && (
            <span className="status-pill" style={{ background: "var(--saffron)", color: "var(--ink)" }}>
              New best score
            </span>
          )}
          <span className="status-pill" style={{ background: "var(--maroon-deep)", border: "1px solid var(--bronze)" }}>
            Saved to your account
          </span>
        </div>
        <div className="btn-row" style={{ position: "relative", justifyContent: "center", marginTop: 8 }}>
          <button type="button" className="btn btn--ghost-light" onClick={onRetake}>
            Retake quiz
          </button>
          {next && (
            <Link href={next.href} className="btn btn--saffron">
              {next.label} →
            </Link>
          )}
        </div>
      </div>
      <div className="card" style={{ padding: 26, gap: 4 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Review your answers</h2>
        {quiz.questions.map((q, i) => {
          const a = answers[i];
          const good = a === q.answer;
          return (
            <div key={i} className="quiz-review">
              <span aria-hidden="true" className="quiz-review__dot" style={{ background: good ? "var(--green)" : "#A8261B" }}>
                {good ? "✓" : "✕"}
              </span>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, lineHeight: 1.3 }}>
                  {i + 1}. {q.text}
                </span>
                <span>
                  <span className="muted">Your answer:</span> <strong style={{ color: good ? "#2F5A22" : "#8A1F16" }}>{a != null ? q.options[a] : "Not answered"}</strong>
                </span>
                {!good && (
                  <span>
                    <span className="muted">Correct answer:</span> <strong style={{ color: "#2F5A22" }}>{q.options[q.answer]}</strong>
                  </span>
                )}
                {q.explain && <span style={{ color: "#5A3A28" }}>{q.explain}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
