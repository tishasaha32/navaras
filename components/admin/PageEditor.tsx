"use client";

import { useState } from "react";
import { savePage } from "@/app/admin/actions";
import { PAGE_SCHEMAS, type Field, type ListItem, type PageDoc, type PageKey, type SectionDef, type SubField } from "@/lib/content/pages";
import EditorHeader, { useSaveFlow } from "./EditorHeader";
import { ChevronIcon, PlusIcon, TrashIcon } from "./icons";
import { ImageField, ImageLibraryProvider } from "./ImageLibrary";

type Props = { pageKey: PageKey; initial: PageDoc; hasDraft: boolean; library: string[] };

export default function PageEditor({ pageKey, initial, hasDraft, library }: Props) {
  const schema = PAGE_SCHEMAS[pageKey];
  const [doc, setDoc] = useState(initial);
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const flow = useSaveFlow(hasDraft);

  const update = (fn: (draft: PageDoc) => void) => {
    setDoc((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    flow.markDirty();
  };

  const save = (mode: "draft" | "publish") => flow.run(mode, (m) => savePage(pageKey, doc, m));

  return (
    <ImageLibraryProvider library={library}>
      <EditorHeader
        crumb={`Admin / Pages / ${schema.label}`}
        title={schema.label}
        path={schema.path}
        status={flow.status}
        error={flow.error}
        pending={flow.pending}
        onSaveDraft={() => save("draft")}
        onPublish={() => save("publish")}
      />
      <div className="adm-wrap adm-body">
        <aside aria-label="On this page" className="adm-aside">
          <div className="adm-panel">
            <span className="adm-overline" style={{ padding: "0 8px 8px" }}>
              On this page
            </span>
            {schema.sections.map((s) => (
              <a key={s.id} href={`#sec-${s.id}`} className="adm-toc">
                <span>{s.title}</span>
                <small style={{ color: doc[s.id]?.visible === false ? "var(--a-muted)" : "var(--a-success)" }}>
                  {s.fixed ? "Always" : doc[s.id]?.visible === false ? "Hidden" : "Shown"}
                </small>
              </a>
            ))}
          </div>
          <div className="adm-note">
            <strong>How editing works</strong>
            <span>
              Edit any field below. Changes stay private until you press <strong>Publish changes</strong>. Use{" "}
              <strong>Save draft</strong> to keep work without publishing.
            </span>
          </div>
        </aside>

        <main className="adm-main">
          {schema.sections.map((s) => (
            <SectionCard
              key={s.id}
              def={s}
              doc={doc}
              open={!closed[s.id]}
              onToggleOpen={() => setClosed((c) => ({ ...c, [s.id]: !c[s.id] }))}
              update={update}
            />
          ))}
        </main>
      </div>
    </ImageLibraryProvider>
  );
}

function SectionCard({
  def,
  doc,
  open,
  onToggleOpen,
  update,
}: {
  def: SectionDef;
  doc: PageDoc;
  open: boolean;
  onToggleOpen: () => void;
  update: (fn: (draft: PageDoc) => void) => void;
}) {
  const sec = doc[def.id];
  const visible = sec.visible !== false;
  const setValue = (k: string, v: string | ListItem[]) => update((d) => void (d[def.id].values[k] = v));

  return (
    <section id={`sec-${def.id}`} aria-labelledby={`h-${def.id}`} className="adm-sec" data-open={open} data-hidden={!visible}>
      <div className="adm-sec__head">
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span className="adm-sec__title">
            <h2 id={`h-${def.id}`}>{def.title}</h2>
            {!visible && <span className="adm-pill">Hidden on site</span>}
          </span>
          <span className="adm-muted">{def.desc}</span>
        </div>
        <div className="adm-sec__tools">
          {!def.fixed && (
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              className="adm-switch"
              onClick={() => update((d) => void (d[def.id].visible = !visible))}
            >
              <span aria-hidden="true" className="adm-switch__track" />
              Show on site
            </button>
          )}
          <button
            type="button"
            className="adm-icon-btn adm-sec__chev"
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${def.title}`}
            onClick={onToggleOpen}
          >
            <ChevronIcon />
          </button>
        </div>
      </div>
      {open && (
        <div className="adm-grid">
          {def.fields.map((f) => (
            <FieldEditor key={f.k} field={f} value={sec.values[f.k]} siblings={sec.values} onChange={(v) => setValue(f.k, v)} />
          ))}
        </div>
      )}
    </section>
  );
}

function FieldEditor({
  field: f,
  value,
  siblings,
  onChange,
}: {
  field: Field;
  value: string | ListItem[] | undefined;
  siblings: Record<string, string | ListItem[]>;
  onChange: (v: string | ListItem[]) => void;
}) {
  const wide = f.t === "area" || f.t === "image" || f.t === "list";
  const str = typeof value === "string" ? value : "";
  return (
    <div className={wide ? "adm-wide" : undefined} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {f.t === "text" && (
        <label className="adm-field">
          {f.label}
          <input className="adm-input" value={str} placeholder={f.ph} onChange={(e) => onChange(e.target.value)} />
        </label>
      )}
      {f.t === "area" && (
        <label className="adm-field">
          {f.label}
          <textarea className="adm-input" rows={3} value={str} placeholder={f.ph} onChange={(e) => onChange(e.target.value)} />
        </label>
      )}
      {f.t === "select" && (
        <label className="adm-field">
          {f.label}
          <select className="adm-input" value={str} onChange={(e) => onChange(e.target.value)}>
            {f.opts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      )}
      {f.t === "image" && <ImageField label={f.label} value={str} onChange={onChange} />}
      {f.t === "list" && <ListEditor field={f} items={Array.isArray(value) ? value : []} siblings={siblings} onChange={onChange} />}
      {f.help && <p className="adm-help">{f.help}</p>}
    </div>
  );
}

function ListEditor({
  field: f,
  items,
  siblings,
  onChange,
}: {
  field: Extract<Field, { t: "list" }>;
  items: ListItem[];
  siblings: Record<string, string | ListItem[]>;
  onChange: (v: ListItem[]) => void;
}) {
  const set = (i: number, k: string, v: string) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  const add = () => {
    const blank: ListItem = Object.fromEntries(f.sub.map((s) => [s.k, s.t === "select" ? optionsFor(s, siblings)[0] ?? "" : ""]));
    onChange([...items, blank]);
  };
  const single = f.sub.length === 1;
  const itemLabel = (it: ListItem, i: number) => {
    const first = it[f.sub[0].k];
    return single || !first ? `${f.item} ${i + 1}` : first;
  };

  return (
    <>
      <div className="adm-list__label">
        <span>{f.label}</span>
        <span className="adm-muted">
          {items.length} {items.length === 1 ? f.item.toLowerCase() : f.items.toLowerCase()}
        </span>
      </div>
      <div className="adm-list">
        {items.map((it, i) => (
          <div key={i} className="adm-item">
            <div className="adm-item__head">
              <span>{itemLabel(it, i)}</span>
              <span className="adm-item__tools">
                <button type="button" className="adm-icon-btn" aria-label={`Move ${itemLabel(it, i)} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label={`Move ${itemLabel(it, i)} down`}
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  aria-label={`Remove ${itemLabel(it, i)}`}
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                >
                  <TrashIcon />
                </button>
              </span>
            </div>
            <div className="adm-item__grid">
              {f.sub.map((s) => (
                <SubFieldEditor key={s.k} sub={s} value={it[s.k] ?? ""} options={optionsFor(s, siblings)} onChange={(v) => set(i, s.k, v)} />
              ))}
            </div>
          </div>
        ))}
        <button type="button" className="adm-btn adm-btn--dashed" onClick={add}>
          <PlusIcon />
          Add {f.item.toLowerCase()}
        </button>
      </div>
    </>
  );
}

function optionsFor(s: SubField, siblings: Record<string, string | ListItem[]>): string[] {
  if (s.optsFrom) {
    const src = siblings[s.optsFrom];
    return Array.isArray(src) ? src.map((x) => x.label).filter(Boolean) : [];
  }
  return [...(s.opts ?? [])];
}

function SubFieldEditor({ sub: s, value, options, onChange }: { sub: SubField; value: string; options: string[]; onChange: (v: string) => void }) {
  if (s.t === "image") return <ImageField small label={s.label} value={value} onChange={onChange} />;
  if (s.t === "select") {
    const opts = value && !options.includes(value) ? [value, ...options] : options;
    return (
      <label className="adm-field adm-field--sm">
        {s.label}
        <select className="adm-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {opts.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label className={`adm-field adm-field--sm${s.t === "area" ? " adm-wide" : ""}`}>
      {s.label}
      {s.t === "area" ? (
        <textarea className="adm-input" rows={2} value={value} placeholder={s.ph} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="adm-input" value={value} placeholder={s.ph} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
