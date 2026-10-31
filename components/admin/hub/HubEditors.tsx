"use client";

import { useState } from "react";
import { uploadAudio } from "@/app/admin/actions";
import { HUB_PATH, QUIZ_TYPES, slugify, type Chapter, type Hub, type HubSection, type Quiz, type Status } from "@/lib/content/hub";
import RichTextEditor from "../RichTextEditor";
import { ImageField, usePickImage } from "../ImageLibrary";
import { PlusIcon } from "../icons";
import type { Selection, Update } from "./HubBuilder";

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function newChapter(thumb: string): Chapter {
  return {
    id: newId("chapter"),
    slug: "",
    status: "draft",
    title: "Untitled chapter",
    body: "",
    thumb,
  };
}

export function newQuiz(): Quiz {
  return {
    id: newId("quiz"),
    slug: "",
    status: "draft",
    title: "Untitled quiz",
    type: QUIZ_TYPES[0],
    pass: 60,
    questions: [{ text: "", options: ["", ""], answer: 0, explain: "" }],
  };
}

const LETTERS = "ABCDEFGH";

function swap<T>(list: T[], i: number, j: number) {
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
}

/* ---------- Shared bits ---------- */

function StatusToggle({ label, value, onChange }: { label: string; value: Status; onChange: (s: Status) => void }) {
  return (
    <div role="group" aria-label={label} className="adm-segmented">
      {(["draft", "published"] as const).map((s) => (
        <button key={s} type="button" aria-pressed={value === s} data-tone={s} onClick={() => onChange(s)}>
          {s === "draft" ? "Draft" : "Published"}
        </button>
      ))}
    </div>
  );
}

function DangerZone({ text, label, onDelete }: { text: string; label: string; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="adm-danger-zone">
      <span>{text}</span>
      {confirm ? (
        <span style={{ display: "flex", gap: 8 }}>
          <button type="button" className="adm-btn adm-btn--sm" onClick={() => setConfirm(false)}>
            Cancel
          </button>
          <button type="button" className="adm-btn adm-btn--sm adm-btn--danger-solid" onClick={onDelete}>
            Yes, delete {label}
          </button>
        </span>
      ) : (
        <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm(true)}>
          Delete {label}
        </button>
      )}
    </div>
  );
}

function BackLink({ section, select }: { section: HubSection; select: (s: Selection) => void }) {
  return (
    <button type="button" className="adm-link-btn" style={{ padding: 0, alignSelf: "flex-start" }} onClick={() => select({ k: "section", s: section.id })}>
      ← {section.title || "Untitled section"}
    </button>
  );
}

/** Finds the section (and optional child) inside a draft so editors can mutate it. */
function inDraft(d: Hub, sectionId: string) {
  return d.sections.find((s) => s.id === sectionId)!;
}

/* ---------- Section ---------- */

export function SectionEditor({
  hub,
  section: s,
  update,
  select,
  onAddChapter,
  onAddQuiz,
  onDeleted,
}: {
  hub: Hub;
  section: HubSection;
  update: Update;
  select: (sel: Selection) => void;
  onAddChapter: () => void;
  onAddQuiz: () => void;
  onDeleted: () => void;
}) {
  const set = <K extends keyof HubSection>(k: K, v: HubSection[K]) => update((d) => void (inDraft(d, s.id)[k] = v));
  const moveChapter = (i: number, dir: -1 | 1) => update((d) => swap(inDraft(d, s.id).chapters, i, i + dir));
  const moveQuiz = (i: number, dir: -1 | 1) => update((d) => swap(inDraft(d, s.id).quizzes, i, i + dir));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="adm-editor-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="adm-overline adm-overline--rose">Section</span>
          <h2>{s.title || "Untitled section"}</h2>
        </div>
        <StatusToggle label="Section status" value={s.status} onChange={(v) => set("status", v)} />
      </div>

      <div className="adm-card adm-card--grid">
        <label className="adm-field">
          Section title
          <input className="adm-input" value={s.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="adm-field">
          Devanagari title
          <input className="adm-input" lang="sa" value={s.dev} onChange={(e) => set("dev", e.target.value)} />
        </label>
        <label className="adm-field">
          Category
          <select className="adm-input" value={s.cat} onChange={(e) => set("cat", e.target.value)}>
            {!hub.categories.some((c) => c.id === s.cat) && <option value={s.cat}>Choose a category</option>}
            {hub.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="adm-field">
          Page address
          <span className="adm-readonly">
            {HUB_PATH}/{slugify(s.title)}
          </span>
        </div>
        <label className="adm-field adm-wide">
          Short description
          <textarea className="adm-input" rows={2} value={s.desc} onChange={(e) => set("desc", e.target.value)} />
          <span className="adm-help">Shown on the section’s card in the library.</span>
        </label>
        <div className="adm-wide">
          <ImageField label="Cover image" value={s.img} onChange={(v) => set("img", v)} />
        </div>
      </div>

      <div className="adm-two">
        <div className="adm-card">
          <div className="adm-card__head">
            <h3>Chapters</h3>
            <span className="adm-muted">Free to read</span>
          </div>
          {s.chapters.length === 0 && <span className="adm-muted">No chapters yet.</span>}
          {s.chapters.map((c, i) => (
            <div key={c.id} className="adm-row">
              <span className="adm-row__num">{i + 1}</span>
              <button type="button" className="adm-row__main" onClick={() => select({ k: "chapter", s: s.id, id: c.id })}>
                {c.title || "Untitled chapter"}
                {c.status === "draft" && <small>Draft</small>}
              </button>
              <button type="button" className="adm-icon-btn" aria-label={`Move ${c.title} up`} disabled={i === 0} onClick={() => moveChapter(i, -1)}>
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                aria-label={`Move ${c.title} down`}
                disabled={i === s.chapters.length - 1}
                onClick={() => moveChapter(i, 1)}
              >
                ↓
              </button>
            </div>
          ))}
          <button type="button" className="adm-btn adm-btn--dashed" onClick={onAddChapter}>
            + Add chapter
          </button>
        </div>
        <div className="adm-card">
          <div className="adm-card__head">
            <h3>Quizzes</h3>
            <span className="adm-muted">Login required</span>
          </div>
          {s.quizzes.length === 0 && <span className="adm-muted">No quizzes yet.</span>}
          {s.quizzes.map((x, i) => (
            <div key={x.id} className="adm-row">
              <button type="button" className="adm-row__main" onClick={() => select({ k: "quiz", s: s.id, id: x.id })}>
                {x.title || "Untitled quiz"}
                <small>
                  {x.type} · {x.questions.length} {x.questions.length === 1 ? "question" : "questions"}
                  {x.status === "draft" && " · Draft"}
                </small>
              </button>
              <button type="button" className="adm-icon-btn" aria-label={`Move ${x.title} up`} disabled={i === 0} onClick={() => moveQuiz(i, -1)}>
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                aria-label={`Move ${x.title} down`}
                disabled={i === s.quizzes.length - 1}
                onClick={() => moveQuiz(i, 1)}
              >
                ↓
              </button>
            </div>
          ))}
          <button type="button" className="adm-btn adm-btn--dashed" onClick={onAddQuiz}>
            + Add quiz
          </button>
        </div>
      </div>

      <DangerZone
        text="Deleting a section removes its chapters and quizzes from the Hub."
        label="section"
        onDelete={() => {
          update((d) => void (d.sections = d.sections.filter((x) => x.id !== s.id)));
          onDeleted();
        }}
      />
    </div>
  );
}

/* ---------- Chapter ---------- */

export function ChapterEditor({
  section: s,
  chapter: c,
  update,
  select,
}: {
  section: HubSection;
  chapter: Chapter;
  update: Update;
  select: (sel: Selection) => void;
}) {
  const pick = usePickImage();
  const idx = s.chapters.findIndex((x) => x.id === c.id);
  const edit = (fn: (ch: Chapter) => void) => update((d) => fn(inDraft(d, s.id).chapters.find((x) => x.id === c.id)!));
  const set = <K extends keyof Chapter>(k: K, v: Chapter[K]) => edit((ch) => void (ch[k] = v));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="adm-editor-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <BackLink section={s} select={select} />
          <span className="adm-overline adm-overline--rose">
            Chapter {idx + 1} of {s.chapters.length}
          </span>
          <h2>{c.title || "Untitled chapter"}</h2>
        </div>
        <StatusToggle label="Chapter status" value={c.status} onChange={(v) => set("status", v)} />
      </div>

      <div className="adm-card">
        <label className="adm-field">
          Chapter title
          <input className="adm-input" value={c.title} onChange={(e) => set("title", e.target.value)} />
          <span className="adm-help">
            Page address: {HUB_PATH}/{slugify(s.title)}/{slugify(c.title)}
          </span>
        </label>
        <ImageField label="Thumbnail" value={c.thumb} hint="Shown at the top of the chapter. JPG or PNG, at least 1200px wide" removable onChange={(v) => set("thumb", v)} />
        <div className="adm-field">
          <label htmlFor={`body-${c.id}`}>Lesson content</label>
          <RichTextEditor
            id={`body-${c.id}`}
            value={c.body}
            placeholder="Write the lesson: headings, shlokas as quotes, images, audio, columns, tables…"
            onChange={(html) => set("body", html)}
            onPickImage={() => pick()}
            onUploadAudio={uploadAudio}
          />
        </div>
      </div>

      <div className="adm-info">Chapters are always free to read — visitors don’t need to log in.</div>

      <DangerZone
        text="Remove this chapter from the section. Learners’ read marks for it are dropped."
        label="chapter"
        onDelete={() => {
          update((d) => {
            const sec = inDraft(d, s.id);
            sec.chapters = sec.chapters.filter((x) => x.id !== c.id);
          });
          select({ k: "section", s: s.id });
        }}
      />
    </div>
  );
}

/* ---------- Quiz ---------- */

export function QuizEditor({
  section: s,
  quiz: z,
  update,
  select,
}: {
  section: HubSection;
  quiz: Quiz;
  update: Update;
  select: (sel: Selection) => void;
}) {
  const edit = (fn: (q: Quiz) => void) => update((d) => fn(inDraft(d, s.id).quizzes.find((x) => x.id === z.id)!));
  const set = <K extends keyof Quiz>(k: K, v: Quiz[K]) => edit((q) => void (q[k] = v));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="adm-editor-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <BackLink section={s} select={select} />
          <span className="adm-overline adm-overline--rose">Quiz</span>
          <h2>{z.title || "Untitled quiz"}</h2>
        </div>
        <StatusToggle label="Quiz status" value={z.status} onChange={(v) => set("status", v)} />
      </div>

      <div className="adm-card adm-card--grid">
        <label className="adm-field">
          Quiz title
          <input className="adm-input" value={z.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="adm-field">
          Quiz type
          <select className="adm-input" value={z.type} onChange={(e) => set("type", e.target.value)}>
            {!QUIZ_TYPES.includes(z.type as (typeof QUIZ_TYPES)[number]) && <option>{z.type}</option>}
            {QUIZ_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          Pass mark (%)
          <input
            type="number"
            min={0}
            max={100}
            className="adm-input"
            value={z.pass}
            onChange={(e) => set("pass", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          />
        </label>
        <div className="adm-field">
          Page address
          <span className="adm-readonly">
            {HUB_PATH}/{slugify(s.title)}/{slugify(z.title)}
          </span>
        </div>
      </div>

      <div className="adm-info">
        Learners must log in to take quizzes. Their answers and best score are saved to their account. Every question is answered by picking
        one option — use two options (True / False) for true-or-false questions.
      </div>

      {z.questions.map((q, qi) => (
        <div key={qi} className="adm-question">
          <div className="adm-card__head" style={{ alignItems: "center" }}>
            <h3>Question {qi + 1}</h3>
            <span style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className="adm-icon-btn"
                aria-label={`Move question ${qi + 1} up`}
                disabled={qi === 0}
                onClick={() => edit((x) => swap(x.questions, qi, qi - 1))}
              >
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                aria-label={`Move question ${qi + 1} down`}
                disabled={qi === z.questions.length - 1}
                onClick={() => edit((x) => swap(x.questions, qi, qi + 1))}
              >
                ↓
              </button>
              <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => edit((x) => void x.questions.splice(qi, 1))}>
                Remove question
              </button>
            </span>
          </div>
          <label className="adm-field">
            Question
            <textarea
              className="adm-input"
              rows={2}
              value={q.text}
              placeholder="Type the question"
              onChange={(e) => edit((x) => void (x.questions[qi].text = e.target.value))}
            />
          </label>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            Answers <span className="adm-muted" style={{ fontWeight: 400 }}>— tap the circle to mark the correct one</span>
          </span>
          {q.options.map((o, oi) => {
            const correct = q.answer === oi;
            return (
              <div key={oi} className="adm-option">
                <button
                  type="button"
                  className="adm-option__mark"
                  aria-pressed={correct}
                  aria-label={`Mark answer ${LETTERS[oi]} as correct`}
                  onClick={() => edit((x) => void (x.questions[qi].answer = oi))}
                >
                  {correct ? "✓" : LETTERS[oi]}
                </button>
                <input
                  className="adm-input"
                  aria-label={`Answer ${LETTERS[oi]}`}
                  value={o}
                  placeholder={`Answer ${LETTERS[oi]}`}
                  onChange={(e) => edit((x) => void (x.questions[qi].options[oi] = e.target.value))}
                />
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  aria-label={`Remove answer ${LETTERS[oi]}`}
                  disabled={q.options.length <= 2}
                  onClick={() =>
                    edit((x) => {
                      const qq = x.questions[qi];
                      qq.options.splice(oi, 1);
                      if (qq.answer === oi) qq.answer = 0;
                      else if (qq.answer > oi) qq.answer -= 1;
                    })
                  }
                >
                  ✕
                </button>
              </div>
            );
          })}
          {q.options.length < LETTERS.length && (
            <button type="button" className="adm-link-btn" style={{ alignSelf: "flex-start" }} onClick={() => edit((x) => void x.questions[qi].options.push(""))}>
              + Add answer
            </button>
          )}
          <label className="adm-field">
            Explanation shown after answering
            <textarea
              className="adm-input"
              rows={2}
              value={q.explain}
              placeholder="Why this answer is right"
              onChange={(e) => edit((x) => void (x.questions[qi].explain = e.target.value))}
            />
          </label>
        </div>
      ))}
      {z.questions.length === 0 && <div className="adm-empty">No questions yet. Add the first one below.</div>}
      <button
        type="button"
        className="adm-btn adm-btn--dashed"
        onClick={() => edit((x) => void x.questions.push({ text: "", options: ["", ""], answer: 0, explain: "" }))}
      >
        <PlusIcon />
        Add question
      </button>
      <p className="adm-help">Questions without text or with fewer than two answers are left out when you publish.</p>

      <DangerZone
        text="Learners’ past scores for this quiz will also be removed."
        label="quiz"
        onDelete={() => {
          update((d) => {
            const sec = inDraft(d, s.id);
            sec.quizzes = sec.quizzes.filter((x) => x.id !== z.id);
          });
          select({ k: "section", s: s.id });
        }}
      />
    </div>
  );
}

/* ---------- Categories ---------- */

export function CategoriesEditor({ hub, update }: { hub: Hub; update: Update }) {
  const count = (id: string) => hub.sections.filter((s) => s.cat === id).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="adm-overline adm-overline--rose">Library filters</span>
        <h2 style={{ fontSize: 32 }}>Categories</h2>
        <span className="adm-muted">Categories group sections in the library and appear as filter buttons.</span>
      </div>
      <div className="adm-card">
        {hub.categories.map((k, i) => {
          const n = count(k.id);
          return (
            <div key={k.id} className="adm-cat">
              <input
                className="adm-input"
                aria-label="Category name"
                value={k.name}
                placeholder="Category name"
                onChange={(e) => update((d) => void (d.categories[i].name = e.target.value))}
              />
              <input
                className="adm-input"
                lang="sa"
                aria-label="Devanagari name"
                value={k.dev}
                placeholder="Devanagari"
                onChange={(e) => update((d) => void (d.categories[i].dev = e.target.value))}
              />
              <span className="adm-cat__count">
                {n} {n === 1 ? "section" : "sections"}
              </span>
              <button type="button" className="adm-icon-btn" aria-label={`Move ${k.name} up`} disabled={i === 0} onClick={() => update((d) => swap(d.categories, i, i - 1))}>
                ↑
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                aria-label={`Move ${k.name} down`}
                disabled={i === hub.categories.length - 1}
                onClick={() => update((d) => swap(d.categories, i, i + 1))}
              >
                ↓
              </button>
              <button
                type="button"
                className="adm-icon-btn adm-icon-btn--danger"
                aria-label={`Delete ${k.name}`}
                title={n ? "Move its sections to another category first" : "Delete category"}
                disabled={n > 0}
                onClick={() => update((d) => void d.categories.splice(i, 1))}
              >
                ✕
              </button>
            </div>
          );
        })}
        <span className="adm-help">A category can only be deleted once it has no sections.</span>
        <button
          type="button"
          className="adm-btn adm-btn--dashed"
          onClick={() => update((d) => void d.categories.push({ id: newId("cat"), name: "New category", dev: "" }))}
        >
          + Add category
        </button>
      </div>
    </div>
  );
}
