import { applicationDefault, cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Server-only Firebase access for site content. It uses a service account, which bypasses the
 * security rules, so nothing here may reach the browser. Content stays on disk until
 * CONTENT_STORE=firebase.
 *
 * The service account comes from FIREBASE_SERVICE_ACCOUNT (the key file's JSON, or that JSON in
 * base64) where there is no key file, as on Vercel, else from the file in GOOGLE_APPLICATION_CREDENTIALS.
 */
export const firebaseEnabled = process.env.CONTENT_STORE === "firebase";

function credential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return applicationDefault();
  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return cert(JSON.parse(json) as ServiceAccount);
}

const app = () =>
  getApps()[0] ??
  initializeApp({
    credential: credential(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

export const firestore = () => getFirestore(app());
export const bucket = () => getStorage(app()).bucket();
export const adminAuth = () => getAuth(app());
