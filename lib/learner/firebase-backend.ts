import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LearnerError, emptyProgress, type Learner, type LearnerBackend, type Progress } from "./types";

/**
 * Accounts live in Firebase Authentication. Firestore holds the rest:
 *   learners/{uid}                   name, email, phone
 *   learners/{uid}/private/progress  the learner's `Progress`
 */

const profileRef = (uid: string) => doc(db, "learners", uid);
const progressRef = (uid: string) => doc(db, "learners", uid, "private", "progress");

const LOAD_TIMEOUT_MS = 8000;

const MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
  "auth/cancelled-popup-request": "Google sign-in was closed before it finished.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups and try again.",
  "auth/invalid-phone-number": "Enter a valid phone number, including the country code.",
  "auth/invalid-verification-code": "That code isn’t right. Please check it and try again.",
  "auth/code-expired": "That code has expired. Please ask for a new one.",
  "auth/captcha-check-failed": "We couldn’t verify this browser. Please try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a while and try again.",
  "auth/network-request-failed": "Check your connection and try again.",
};

/** Runs a Firebase call, turning its errors into messages the auth form can show. */
async function guarded<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!(e instanceof FirebaseError)) throw e;
    if (!MESSAGES[e.code]) console.error(e);
    throw new LearnerError(MESSAGES[e.code] ?? "Something went wrong. Please try again.");
  }
}

const learnerFor = (user: User): Learner => ({
  id: user.uid,
  name: user.displayName ?? "",
  email: user.email ?? "",
  phone: user.phoneNumber ?? "",
});

/** Being logged in only depends on Auth, so a failed profile save must not fail the login. */
function signedIn(user: User): Learner {
  const { id, ...profile } = learnerFor(user);
  setDoc(profileRef(id), profile).catch(console.error);
  return { id, ...profile };
}

export const firebaseBackend: LearnerBackend = {
  async current() {
    await auth.authStateReady();
    return auth.currentUser && learnerFor(auth.currentUser);
  },

  signInWithGoogle: () => guarded(async () => signedIn((await signInWithPopup(auth, new GoogleAuthProvider())).user)),

  sendPhoneCode: (phone, recaptcha) =>
    guarded(async () => {
      // reCAPTCHA can't render twice into one element, so every attempt gets a fresh one.
      const host = recaptcha.appendChild(document.createElement("div"));
      const verifier = new RecaptchaVerifier(auth, host, { size: "invisible" });
      try {
        const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
        return (code) => guarded(async () => signedIn((await confirmation.confirm(code)).user));
      } finally {
        verifier.clear();
        host.remove();
      }
    }),

  async signOut() {
    await signOut(auth);
  },

  async loadProgress(learner) {
    // Firestore retries forever when it can't reach the database, so give up rather than wait.
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timed out loading progress.")), LOAD_TIMEOUT_MS);
    });
    const snap = await Promise.race([getDoc(progressRef(learner.id)), timeout]);
    return { ...emptyProgress(), ...(snap.data() as Partial<Progress> | undefined) };
  },

  async saveProgress(learner, progress) {
    try {
      await setDoc(progressRef(learner.id), progress);
    } catch (e) {
      console.error(e);
    }
  },
};
