/**
 * Learner accounts and progress for the Natyashastra Hub.
 * The UI only talks to a `LearnerBackend`; `firebase-backend.ts` is the live implementation.
 */

/** `name` is empty for phone logins, `email` for phone logins and `phone` for Google ones. */
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

/** Second step of phone sign-in: checks the code that was texted. */
export type ConfirmPhoneCode = (code: string) => Promise<Learner>;

export interface LearnerBackend {
  /** Restores the signed-in learner, if any. */
  current(): Promise<Learner | null>;
  signInWithGoogle(): Promise<Learner>;
  /** Texts a code to `phone` (with country code); `recaptcha` is an empty element for the bot check. */
  sendPhoneCode(phone: string, recaptcha: HTMLElement): Promise<ConfirmPhoneCode>;
  signOut(): Promise<void>;
  loadProgress(learner: Learner): Promise<Progress>;
  saveProgress(learner: Learner, progress: Progress): Promise<void>;
}
