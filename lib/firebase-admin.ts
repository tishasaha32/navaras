import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Server-only Firebase access for site content. It uses the service account in
 * GOOGLE_APPLICATION_CREDENTIALS, which bypasses the security rules, so nothing here may
 * reach the browser. Content stays on disk until CONTENT_STORE=firebase.
 */
export const firebaseEnabled = process.env.CONTENT_STORE === "firebase";

const app = () =>
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

export const firestore = () => getFirestore(app());
export const bucket = () => getStorage(app()).bucket();
export const adminAuth = () => getAuth(app());
