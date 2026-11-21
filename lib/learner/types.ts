/**
 * Learner accounts and progress for the Natyashastra Hub.
 * The UI only talks to a `LearnerBackend`; `firebase-backend.ts` is the live implementation.
 */

/** `phone` is only set for learners who logged in by phone before Google became the only way in. */
export type Learner = { id: string; name: string; email: string; phone: string };

export type QuizRecord = { best: number; last: number; attempts: number; at: number };

export type Progress = {
  /** Chapter id → when it was marked as read. */
  read: Record<string, number>;
  /** Quiz id → scores. */
  quizzes: Record<string, QuizRecord>;
  /** The chapter the learner opened most recently. */
  last?: { section: string; chapter: string; at: number };
};

export const emptyProgress = (): Progress => ({ read: {}, quizzes: {} });

export class LearnerError extends Error {}

export interface LearnerBackend {
  /** Restores the signed-in learner, if any. */
  current(): Promise<Learner | null>;
  signInWithGoogle(): Promise<Learner>;
  signOut(): Promise<void>;
  loadProgress(learner: Learner): Promise<Progress>;
  saveProgress(learner: Learner, progress: Progress): Promise<void>;
}
