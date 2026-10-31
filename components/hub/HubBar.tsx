"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HUB_PATH } from "@/lib/content/hub";
import { useLearner } from "./LearnerProvider";

export const loginHref = (next: string) => `${HUB_PATH}/login?next=${encodeURIComponent(next)}`;

export default function HubBar({ chapterIds }: { chapterIds: string[] }) {
  const pathname = usePathname();
  const { ready, learner, progress, progressUnavailable } = useLearner();
  if (pathname === `${HUB_PATH}/login`) return null;

  const read = chapterIds.filter((id) => progress.read[id]).length;
  const pct = chapterIds.length ? Math.round((read / chapterIds.length) * 100) : 0;

  return (
    <div className="hub-bar">
      <div className="container hub-bar__inner">
        <span className="hub-bar__brand">
          <span lang="sa">नाट्यशास्त्र</span>
          <span>Hub</span>
        </span>
        {ready && !learner && (
          <span className="muted" style={{ fontSize: 14 }}>
            Reading is free ·{" "}
            <Link href={loginHref(pathname)} style={{ fontWeight: 700 }}>
              Log in
            </Link>{" "}
            to save progress and take quizzes
          </span>
        )}
        {learner && (
          <span className="hub-bar__progress">
            {progressUnavailable ? (
              <span role="status" style={{ color: "var(--rose-deep)" }}>
                Your progress can’t be saved right now
              </span>
            ) : (
              <>
                <span>
                  {read} of {chapterIds.length} chapters read
                </span>
                <span aria-hidden="true" className="progress" style={{ width: 140, height: 8, background: "var(--ivory)" }}>
                  <div style={{ width: `${pct}%` }} />
                </span>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
