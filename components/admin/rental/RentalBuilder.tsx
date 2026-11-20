"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { saveRental } from "@/app/admin/actions";
import type { Rental, RentalItem, RentalKind } from "@/lib/content/rental";
import { PlusIcon } from "../icons";
import { ImageField, ImageLibraryProvider } from "../ImageLibrary";
import { uploadsThisVisit } from "../uploads";

const PERIODS = ["per day", "per 3 days", "per week"];
const STATUSES: [string, string][] = [
  ["", "Don’t show"],
  ["Available", "Available"],
  ["Booked", "Booked"],
  ["Out for cleaning", "Out for cleaning"],
];
const NOUN: Record<RentalKind, [string, string]> = { dresses: ["dress", "dresses"], jewellery: ["piece", "pieces"] };

type Status = "saved" | "dirty" | "error";
const STATUS_LABEL: Record<Status, string> = { saved: "Saved · live on the site", dirty: "Unsaved changes", error: "Not saved" };

/** The next free product ID in a category, following its pieces' prefix (A013 → A014). */
function nextCode(items: RentalItem[], category: string): string {
  const codes = items.filter((i) => i.category === category).map((i) => i.code.match(/^([A-Za-z]+)(\d+)$/)).filter(Boolean) as RegExpMatchArray[];
  if (!codes.length) return "";
  const prefix = codes[0][1].toUpperCase();
  const width = codes[0][2].length;
  const max = Math.max(...codes.filter((m) => m[1].toUpperCase() === prefix).map((m) => Number(m[2])));
  return prefix + String(max + 1).padStart(width, "0");
}

/** The admin's rental shop: add, edit and delete dresses and jewellery. Saving puts the changes on the Dresses page. */
export default function RentalBuilder({ initial, library, categories }: { initial: Rental; library: string[]; categories: Record<RentalKind, string[]> }) {
  const router = useRouter();
  const [rental, setRental] = useState(initial);
  const [kind, setKind] = useState<RentalKind>("dresses");
  const [selected, setSelected] = useState<string | null>(initial.dresses[0]?.id ?? null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("saved");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (status !== "dirty") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const items = rental[kind];
  const item = items.find((i) => i.id === selected) ?? null;
  const [one, many] = NOUN[kind];

  const q = search.trim().toLowerCase();
  const shown = useMemo(
    () => items.filter((i) => (filter === "all" || i.category === filter) && (!q || `${i.code} ${i.name}`.toLowerCase().includes(q))),
    [items, filter, q],
  );
  const dupes = useMemo(() => {
    const seen = new Map<string, number>();
    for (const i of items) if (i.code) seen.set(i.code.toUpperCase(), (seen.get(i.code.toUpperCase()) ?? 0) + 1);
    return seen;
  }, [items]);

  const change = (fn: (r: Rental) => Rental) => {
    setRental(fn);
    setStatus("dirty");
  };
  const setField = <K extends keyof RentalItem>(k: K, v: RentalItem[K]) =>
    change((r) => ({ ...r, [kind]: r[kind].map((i) => (i.id === selected ? { ...i, [k]: v } : i)) }));

  const switchKind = (k: RentalKind) => {
    setKind(k);
    setFilter("all");
    setSearch("");
    setSelected(rental[k][0]?.id ?? null);
  };

  const add = () => {
    const category = filter !== "all" ? filter : categories[kind][0];
    const fresh: RentalItem = { id: crypto.randomUUID(), code: nextCode(items, category), name: "", category, size: "", price: "", period: "per day", sale: "", status: "", img: "" };
    change((r) => ({ ...r, [kind]: [...r[kind], fresh] }));
    setSearch("");
    setSelected(fresh.id);
  };

  const remove = () => {
    if (!item) return;
    if (!window.confirm(`Delete ${item.name || `this ${one}`}${item.code ? ` (${item.code})` : ""}? It leaves the site when you save.`)) return;
    const i = shown.findIndex((x) => x.id === item.id);
    const next = shown[i + 1] ?? shown[i - 1] ?? null;
    change((r) => ({ ...r, [kind]: r[kind].filter((x) => x.id !== item.id) }));
    setSelected(next?.id ?? null);
  };

  const save = () =>
    start(async () => {
      setError(null);
      try {
        const res = await saveRental(rental, uploadsThisVisit());
        if (!res.ok) {
          setError(res.error);
          setStatus("error");
          return;
        }
        setStatus("saved");
        router.refresh();
      } catch {
        setError("Could not reach the server. Check your connection and try again.");
        setStatus("error");
      }
    });

  return (
    <ImageLibraryProvider library={library}>
      <div className="adm-head">
        <div className="adm-wrap adm-head__inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <span className="adm-head__crumb">Admin / Dresses</span>
            <h1>
              Dresses &amp; jewellery<span lang="sa">आहार्य</span>
            </h1>
            <div className="adm-head__meta">
              <span className="adm-path">/navaras-dresses</span>
              <span role="status" className={`adm-status adm-status--${status === "saved" ? "live" : status}`}>
                {pending ? "Saving…" : STATUS_LABEL[status]}
              </span>
              <span className="adm-muted">
                {rental.dresses.length} dresses · {rental.jewellery.length} jewellery pieces
              </span>
            </div>
            {error && (
              <p role="alert" className="adm-error">
                {error}
              </p>
            )}
          </div>
          <div className="adm-head__actions">
            <a href="/navaras-dresses#rental" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--light">
              View page
            </a>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={pending || status === "saved"}>
              Save changes
            </button>
          </div>
        </div>
      </div>

      <div className="adm-wrap adm-body">
        <aside aria-label="Rental pieces" className="adm-tree">
          <div className="adm-rental-switch" role="group" aria-label="Show">
            {(["dresses", "jewellery"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => switchKind(k)}>
                {k === "dresses" ? "Dresses" : "Jewellery"} <span>{rental[k].length}</span>
              </button>
            ))}
          </div>
          <div className="adm-tree__head">
            <h2>{kind === "dresses" ? "Dresses" : "Jewellery"}</h2>
            <button type="button" className="adm-btn adm-btn--sm adm-btn--maroon" onClick={add}>
              <PlusIcon />
              Add {one}
            </button>
          </div>
          <label className="adm-field adm-field--sm">
            Search
            <input type="search" className="adm-input" value={search} placeholder="Name or product ID" onChange={(e) => setSearch(e.target.value)} />
          </label>
          <label className="adm-field adm-field--sm">
            Category
            <select className="adm-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categories[kind].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <span className="adm-muted" style={{ fontSize: 13 }}>
            Showing {shown.length} of {items.length} {many}
          </span>
          <div className="adm-rental-list">
            {shown.map((i) => (
              <button key={i.id} type="button" className="adm-tree__item adm-rental-row" aria-current={i.id === selected ? "true" : undefined} onClick={() => setSelected(i.id)}>
                <span className="adm-rental-row__thumb">{i.img && <img src={i.img} alt="" loading="lazy" />}</span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span className="adm-rental-row__name">{i.name || `New ${one}`}</span>
                  <span className="adm-tree__meta">{[i.code, i.price && `${i.price} ${i.period}`].filter(Boolean).join(" · ") || i.category}</span>
                </span>
              </button>
            ))}
            {shown.length === 0 && <span className="adm-muted" style={{ padding: 12 }}>{items.length ? `No ${many} match.` : `No ${many} yet. Add the first one.`}</span>}
          </div>
        </aside>

        <main className="adm-main">
          {item ? (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="adm-editor-head">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="adm-overline adm-overline--rose">{kind === "dresses" ? "Dress" : "Jewellery"}</span>
                  <h2>{item.name || `New ${one}`}</h2>
                </div>
                <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={remove}>
                  Delete
                </button>
              </div>

              <div className="adm-card adm-card--grid">
                <label className="adm-field">
                  Name
                  <input className="adm-input" value={item.name} placeholder={kind === "dresses" ? "e.g. Purple Anarkali" : "e.g. Rose Gold Mang Tika"} onChange={(e) => setField("name", e.target.value)} />
                  <span className="adm-help">Shown on the card, usually the colour and the type.</span>
                </label>
                <label className="adm-field">
                  Product ID
                  <input className="adm-input" value={item.code} placeholder="e.g. A014" onChange={(e) => setField("code", e.target.value.toUpperCase())} />
                  {item.code && (dupes.get(item.code.toUpperCase()) ?? 0) > 1 ? (
                    <span className="adm-help" style={{ color: "var(--a-danger)" }}>
                      Another {one} already uses this ID.
                    </span>
                  ) : (
                    <span className="adm-help">The badge on the photo, so customers can quote it.</span>
                  )}
                </label>
                <label className="adm-field">
                  Category
                  <select className="adm-input" value={item.category} onChange={(e) => setField("category", e.target.value)}>
                    {categories[kind].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="adm-field">
                  Availability
                  <select className="adm-input" value={item.status} onChange={(e) => setField("status", e.target.value)}>
                    {STATUSES.map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-field">
                  Rent
                  <input className="adm-input" value={item.price} placeholder="e.g. ₹600" onChange={(e) => setField("price", e.target.value)} />
                  <span className="adm-help">Leave empty to show “Ask for price”.</span>
                </label>
                <label className="adm-field">
                  Rental period
                  <select className="adm-input" value={item.period} onChange={(e) => setField("period", e.target.value)}>
                    {PERIODS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label className="adm-field">
                  Sale price
                  <input className="adm-input" value={item.sale} placeholder="e.g. ₹1,500 with fabric, ₹1,000 without" onChange={(e) => setField("sale", e.target.value)} />
                  <span className="adm-help">Optional. Shown as “Buy: …”.</span>
                </label>
                {kind === "dresses" && (
                  <label className="adm-field">
                    Sizes
                    <input className="adm-input" value={item.size} placeholder="e.g. S, M" onChange={(e) => setField("size", e.target.value)} />
                    <span className="adm-help">Optional.</span>
                  </label>
                )}
                <div className="adm-wide">
                  <ImageField label="Photo" value={item.img} onChange={(v) => setField("img", v)} hint="Upload or pick a photo. Uploads are compressed to under 400 KB." />
                </div>
              </div>
            </div>
          ) : (
            <div className="adm-empty">
              <p>Pick a {one} on the left, or add a new one.</p>
            </div>
          )}
        </main>
      </div>
    </ImageLibraryProvider>
  );
}
