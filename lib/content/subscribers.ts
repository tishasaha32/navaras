import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { firebaseEnabled, firestore } from "@/lib/firebase-admin";
import { DATA_DIR } from "./paths";

/**
 * Newsletter subscribers: in Firestore under subscribers/ (one document per address, so signing up
 * twice changes nothing), or in data/subscribers.json until content moves to Firebase.
 * Only the server reads or writes these; see them in the Firebase console.
 */
const FILE = path.join(DATA_DIR, "subscribers.json");

type Subscriber = { email: string; subscribedAt: string };

/** Adds the address; `false` when it was already subscribed. */
export async function addSubscriber(email: string): Promise<boolean> {
  const address = email.trim().toLowerCase();
  const entry: Subscriber = { email: address, subscribedAt: new Date().toISOString() };

  if (firebaseEnabled) {
    // The id is a hash, since an address can hold characters a document id can't.
    const ref = firestore().collection("subscribers").doc(createHash("sha256").update(address).digest("hex"));
    try {
      await ref.create(entry);
      return true;
    } catch (err) {
      if ((err as { code?: number }).code === 6) return false; // ALREADY_EXISTS
      throw err;
    }
  }

  const list: Subscriber[] = JSON.parse(await fs.readFile(FILE, "utf8").catch(() => "[]"));
  if (list.some((s) => s.email === address)) return false;
  list.push(entry);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
  return true;
}
