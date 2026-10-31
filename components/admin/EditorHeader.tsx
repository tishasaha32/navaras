"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ActionResult } from "@/app/admin/actions";

export type EditStatus = "live" | "dirty" | "draft" | "published" | "error";

const LABELS: Record<EditStatus, string> = {
  live: "Published · live on the site",
  dirty: "Unsaved changes",
  draft: "Draft saved · not live yet",
  published: "Published just now",
  error: "Not saved",
};

/**
 * Draft / publish flow shared by the page editors and the Hub builder:
 * tracks unsaved changes, warns before leaving, and runs the save action.
 */
export function useSaveFlow(hasDraft: boolean) {
  const router = useRouter();
  const [status, setStatus] = useState<EditStatus>(hasDraft ? "draft" : "live");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (status !== "dirty") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const run = (mode: "draft" | "publish", save: (mode: "draft" | "publish") => Promise<ActionResult>, onSaved?: (res: ActionResult) => void) =>
    start(async () => {
      setError(null);
      try {
        const res = await save(mode);
        if (!res.ok) {
          setError(res.error);
          setStatus("error");
          return;
        }
        onSaved?.(res);
        setStatus(mode === "publish" ? "published" : "draft");
        router.refresh();
      } catch {
        setError("Could not reach the server. Check your connection and try again.");
        setStatus("error");
      }
    });

  return { status, error, pending, markDirty: () => setStatus("dirty"), run };
}

export default function EditorHeader({
  crumb,
  title,
  dev,
  path,
  meta,
  status,
  error,
  pending,
  onSaveDraft,
  onPublish,
}: {
  crumb: string;
  title: string;
  dev?: string;
  path: string;
  meta?: string;
  status: EditStatus;
  error: string | null;
  pending: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="adm-head">
      <div className="adm-wrap adm-head__inner">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <span className="adm-head__crumb">{crumb}</span>
          <h1>
            {title}
            {dev && <span lang="sa">{dev}</span>}
          </h1>
          <div className="adm-head__meta">
            <span className="adm-path">{path}</span>
            <span role="status" className={`adm-status adm-status--${status}`}>
              {pending ? "Saving…" : LABELS[status]}
            </span>
            {meta && <span className="adm-muted">{meta}</span>}
          </div>
          {error && (
            <p role="alert" className="adm-error">
              {error}
            </p>
          )}
        </div>
        <div className="adm-head__actions">
          <Link
            href={`/admin/preview?path=${encodeURIComponent(path)}`}
            target="_blank"
            className="adm-btn adm-btn--light"
            title="Opens the site with your saved draft. Save draft first to include recent edits."
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </Link>
          <button type="button" className="adm-btn" onClick={onSaveDraft} disabled={pending}>
            Save draft
          </button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={onPublish} disabled={pending}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            Publish changes
          </button>
        </div>
      </div>
    </div>
  );
}
