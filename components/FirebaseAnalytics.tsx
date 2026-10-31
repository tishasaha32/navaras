"use client";

import { useEffect } from "react";

/** Starts Google Analytics. Firebase is loaded here on demand so it stays out of the pages' main bundle. */
export default function FirebaseAnalytics() {
  useEffect(() => {
    void (async () => {
      const [{ app }, { getAnalytics, isSupported }] = await Promise.all([import("@/lib/firebase"), import("firebase/analytics")]);
      if (await isSupported()) getAnalytics(app);
    })();
  }, []);
  return null;
}
