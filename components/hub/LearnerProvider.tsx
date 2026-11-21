"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { firebaseBackend } from "@/lib/learner/firebase-backend";
import { LearnerError, emptyProgress, type Learner, type LearnerBackend, type Progress } from "@/lib/learner/types";

const backend: LearnerBackend = firebaseBackend;

type Change = (p: Progress) => Progress;

type Ctx = {
  /** False until we know whether someone is logged in. Show no login prompts before then. */
  ready: boolean;
  learner: Learner | null;
  progress: Progress;
  /** True if saved progress couldn't be loaded, so changes won't be saved. */
  progressUnavailable: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setRead: (chapterId: string, read: boolean) => void;
  recordQuiz: (quizId: string, pct: number) => void;
  visit: (sectionId: string, chapterId: string) => void;
};

const LearnerContext = createContext<Ctx | null>(null);

export function useLearner(): Ctx {
  const ctx = useContext(LearnerContext);
  if (!ctx) throw new Error("useLearner must be used inside <LearnerProvider>.");
  return ctx;
}

export { LearnerError };

export default function LearnerProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [progressUnavailable, setProgressUnavailable] = useState(false);
  const learnerRef = useRef<Learner | null>(null);
  /** Saving waits for the load, so a save can never replace saved progress with an empty copy. */
  const progressLoaded = useRef(false);
  const queued = useRef<Change[]>([]);

  /** Logs the learner in straight away; their progress arrives when it has loaded. */
  const adopt = useCallback(async (l: Learner | null) => {
    learnerRef.current = l;
    progressLoaded.current = false;
    queued.current = [];
    setLearner(l);
    setProgress(emptyProgress());
    setProgressUnavailable(false);
    if (!l) return;
    try {
      const loaded = await backend.loadProgress(l);
      if (learnerRef.current !== l) return;
      const changes = queued.current;
      const next = changes.reduce((p, fn) => fn(p), loaded);
      queued.current = [];
      progressLoaded.current = true;
      setProgress(next);
      if (changes.length) void backend.saveProgress(l, next);
    } catch (e) {
      console.error(e);
      if (learnerRef.current === l) setProgressUnavailable(true);
    }
  }, []);

  useEffect(() => {
    backend
      .current()
      .then((l) => void adopt(l))
      .catch(console.error)
      .finally(() => setReady(true));
  }, [adopt]);

  const change = useCallback((fn: Change) => {
    const l = learnerRef.current;
    if (!l) return;
    if (!progressLoaded.current) queued.current.push(fn);
    setProgress((prev) => {
      const next = fn(prev);
      if (progressLoaded.current) void backend.saveProgress(l, next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      learner,
      progress,
      progressUnavailable,
      signInWithGoogle: async () => void adopt(await backend.signInWithGoogle()),
      signOut: async () => {
        await backend.signOut();
        await adopt(null);
      },
      setRead: (id, read) =>
        change((p) => {
          const next = { ...p.read };
          if (read) next[id] = Date.now();
          else delete next[id];
          return { ...p, read: next };
        }),
      recordQuiz: (id, pct) =>
        change((p) => {
          const prev = p.quizzes[id];
          return {
            ...p,
            quizzes: {
              ...p.quizzes,
              [id]: { best: Math.max(prev?.best ?? 0, pct), last: pct, attempts: (prev?.attempts ?? 0) + 1, at: Date.now() },
            },
          };
        }),
      visit: (section, chapter) => change((p) => ({ ...p, last: { section, chapter, at: Date.now() } })),
    }),
    [ready, learner, progress, progressUnavailable, adopt, change],
  );

  return <LearnerContext.Provider value={value}>{children}</LearnerContext.Provider>;
}
