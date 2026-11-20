import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/** These values identify the project; access is controlled by the rules in firestore.rules and storage.rules. */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Without this the build fails with Firebase's bare "auth/invalid-api-key" when the host has no env vars.
if (!firebaseConfig.apiKey) {
  throw new Error(
    "NEXT_PUBLIC_FIREBASE_API_KEY is not set. Add the NEXT_PUBLIC_FIREBASE_* values from .env.example to .env.local, " +
      "or to the host's environment variables (on Vercel: Project → Settings → Environment Variables), then build again.",
  );
}

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
