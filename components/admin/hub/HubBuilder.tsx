"use client";

import { useMemo, useState } from "react";
import { saveHub } from "@/app/admin/actions";
import { HUB_PATH, type Hub, type HubSection } from "@/lib/content/hub";
import EditorHeader, { useSaveFlow } from "../EditorHeader";
import { ChevronRightIcon, PlusIcon, QuizIcon } from "../icons";
import { ImageLibraryProvider } from "../ImageLibrary";
import { CategoriesEditor, ChapterEditor, QuizEditor, SectionEditor, newChapter, newId, newQuiz } from "./HubEditors";

export type Selection =
  | { k: "section"; s: string }
  | { k: "chapter"; s: string; id: string }
  | { k: "quiz"; s: string; id: string }
  | { k: "cats" };

export type Update = (fn: (draft: Hub) => void) => void;

function firstSelection(hub: Hub): Selection {
  const s = hub.sections[0];
  if (!s) return { k: "cats" };
  return s.chapters[0] ? { k: "chapter", s: s.id, id: s.chapters[0].id } : { k: "section", s: s.id };
}

export default function HubBuilder({ initial, hasDraft, library }: { initial: Hub; hasDraft: boolean; library: string[] }) {
  const [hub, setHub] = useState(initial);
  const [sel, setSel] = useState<Selection>(() => firstSelection(initial));
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const s = firstSelection(initial);
    return s.k === "cats" ? {} : { [s.s]: true };
  });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const flow = useSaveFlow(hasDraft);

  const update: Update = (fn) => {
    setHub((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    flow.markDirty();
  };

  const select = (next: Selection) => {
    setSel(next);
    if (next.k !== "cats") setOpen((o) => ({ ...o, [next.s]: true }));
  };

  const save = (mode: "draft" | "publish") =>
    flow.run(
      mode,
      (m) => saveHub(hub, m),
      (res) => {
        // Pick up slugs computed by the server (and questions cleaned up on publish).
        if ("hub" in res && res.hub) setHub(res.hub as Hub);
      },
    );

  const counts = useMemo(() => {
    let chapters = 0;
    let quizzes = 0;
    let drafts = 0;
    for (const s of hub.sections) {
      chapters += s.chapters.length;
      quizzes += s.quizzes.length;
      drafts += [s, ...s.chapters, ...s.quizzes].filter((x) => x.status === "draft").length;
    }
    return { sections: hub.sections.length, chapters, quizzes, drafts };
  }, [hub]);

  const catName = (id: string) => hub.categories.find((c) => c.id === id)?.name ?? "Uncategorised";

  const q = search.trim().toLowerCase();
  const shown = hub.sections.filter(
    (s) =>
      (filter === "all" || s.cat === filter) &&
      (!q || s.title.toLowerCase().includes(q) || s.chapters.some((c) => c.title.toLowerCase().includes(q))),
  );

  const addSection = () => {
    const id = newId("section");
    const cat = filter !== "all" ? filter : hub.categories[0]?.id ?? "";
    update((d) => {
      d.sections.push({
        id,
        slug: "",
        status: "draft",
        cat,
        title: "Untitled section",
        dev: "",
        desc: "",
        img: "/images/dancer-classical.svg",
        chapters: [],
        quizzes: [],
      });
    });
    setSearch("");
    select({ k: "section", s: id });
  };

  const addChapter = (s: HubSection) => {
    const c = newChapter(s.img);
    update((d) => void d.sections.find((x) => x.id === s.id)!.chapters.push(c));
    select({ k: "chapter", s: s.id, id: c.id });
  };

  const addQuiz = (s: HubSection) => {
    const qz = newQuiz();
    update((d) => void d.sections.find((x) => x.id === s.id)!.quizzes.push(qz));
    select({ k: "quiz", s: s.id, id: qz.id });
  };

  const section = sel.k !== "cats" ? hub.sections.find((s) => s.id === sel.s) : undefined;
  const chapter = sel.k === "chapter" ? section?.chapters.find((c) => c.id === sel.id) : undefined;
  const quiz = sel.k === "quiz" ? section?.quizzes.find((x) => x.id === sel.id) : undefined;

  return (
    <ImageLibraryProvider library={library}>
      <EditorHeader
        crumb="Admin / Natyashastra Hub"
        title="Natyashastra Hub"
        dev="नाट्यशास्त्र"
        path={HUB_PATH}
        meta={`${counts.sections} sections · ${counts.chapters} chapters · ${counts.quizzes} quizzes · ${counts.drafts} drafts`}
        status={flow.status}
        error={flow.error}
        pending={flow.pending}
        onSaveDraft={() => save("draft")}
        onPublish={() => save("publish")}
      />

      <div className="adm-wrap adm-body">
        <aside aria-label="Hub content" className="adm-tree">
          <div className="adm-tree__head">
            <h2>Content</h2>
            <button type="button" className="adm-btn adm-btn--sm adm-btn--maroon" onClick={addSection}>
              <PlusIcon />
              New section
            </button>
          </div>
          <label className="adm-field adm-field--sm">
            Search
            <input type="search" className="adm-input" value={search} placeholder="Section or chapter name" onChange={(e) => setSearch(e.target.value)} />
          </label>
          <div className="adm-tree__filters">
            <label className="adm-field adm-field--sm" style={{ flex: 1 }}>
              Category
              <select className="adm-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All categories</option>
                {hub.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={`adm-btn adm-btn--sm${sel.k === "cats" ? " adm-btn--maroon" : ""}`}
              aria-pressed={sel.k === "cats"}
              onClick={() => select({ k: "cats" })}
            >
              Categories
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {shown.map((s) => {
              const isOpen = Boolean(open[s.id]) || Boolean(q);
              const active = sel.k !== "cats" && sel.s === s.id;
              return (
                <div key={s.id} className="adm-tree__sec" data-active={active}>
                  <div className="adm-tree__row">
                    <button
                      type="button"
                      className="adm-tree__toggle"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${s.title}`}
                      onClick={() => setOpen((o) => ({ ...o, [s.id]: !isOpen }))}
                    >
                      <ChevronRightIcon />
                    </button>
                    <button
                      type="button"
                      className="adm-tree__pick"
                      aria-current={sel.k === "section" && sel.s === s.id ? "true" : undefined}
                      onClick={() => select({ k: "section", s: s.id })}
                    >
                      <span className="adm-tree__title">
                        <span aria-hidden="true" className={`adm-dot${s.status === "published" ? " adm-dot--published" : ""}`} />
                        {s.title || "Untitled section"}
                      </span>
                      <span className="adm-tree__meta">
                        {catName(s.cat)} · {s.chapters.length} ch · {s.quizzes.length} {s.quizzes.length === 1 ? "quiz" : "quizzes"}
                        {s.status === "draft" && " · Draft"}
                      </span>
                    </button>
                  </div>
                  {isOpen && (
                    <div className="adm-tree__kids">
                      <span className="adm-overline">Chapters</span>
                      {s.chapters.map((c, i) => (
                        <button
                          key={c.id}
                          type="button"
                          className="adm-tree__item"
                          aria-current={sel.k === "chapter" && sel.id === c.id ? "true" : undefined}
                          onClick={() => select({ k: "chapter", s: s.id, id: c.id })}
                        >
                          <span className="adm-tree__num">{i + 1}</span>
                          <span style={{ flex: 1 }}>{c.title || "Untitled chapter"}</span>
                          {c.status === "draft" && <span className="adm-tree__draft">Draft</span>}
                        </button>
                      ))}
                      <button type="button" className="adm-link-btn" onClick={() => addChapter(s)}>
                        + Add chapter
                      </button>
                      <span className="adm-overline">Quizzes</span>
                      {s.quizzes.map((x) => (
                        <button
                          key={x.id}
                          type="button"
                          className="adm-tree__item"
                          aria-current={sel.k === "quiz" && sel.id === x.id ? "true" : undefined}
                          onClick={() => select({ k: "quiz", s: s.id, id: x.id })}
                        >
                          <QuizIcon />
                          <span style={{ flex: 1 }}>{x.title || "Untitled quiz"}</span>
                          <span className={x.status === "draft" ? "adm-tree__draft" : "adm-tree__meta"}>
                            {x.status === "draft" ? "Draft" : `${x.questions.length} Q`}
                          </span>
                        </button>
                      ))}
                      <button type="button" className="adm-link-btn" onClick={() => addQuiz(s)}>
                        + Add quiz
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {shown.length === 0 && (
              <span className="adm-muted" style={{ padding: 12 }}>
                {hub.sections.length ? "No sections match your search." : "No sections yet. Create the first one."}
              </span>
            )}
          </div>
        </aside>

        <main className="adm-main">
          {sel.k === "cats" && <CategoriesEditor hub={hub} update={update} />}
          {sel.k === "section" && section && (
            <SectionEditor
              key={section.id}
              hub={hub}
              section={section}
              update={update}
              select={select}
              onAddChapter={() => addChapter(section)}
              onAddQuiz={() => addQuiz(section)}
              onDeleted={() => setSel(firstSelection({ ...hub, sections: hub.sections.filter((s) => s.id !== section.id) }))}
            />
          )}
          {sel.k === "chapter" && section && chapter && (
            <ChapterEditor key={chapter.id} section={section} chapter={chapter} update={update} select={select} />
          )}
          {sel.k === "quiz" && section && quiz && <QuizEditor key={quiz.id} section={section} quiz={quiz} update={update} select={select} />}
          {sel.k !== "cats" && !section && (
            <div className="adm-empty">
              <p>Pick a section on the left, or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </ImageLibraryProvider>
  );
}
