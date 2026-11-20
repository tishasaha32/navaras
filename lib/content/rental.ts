import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { firebaseEnabled, firestore } from "@/lib/firebase-admin";
import { DATA_DIR } from "./paths";
import { SEED_DRESSES, SEED_JEWELLERY } from "./rental-seed";

/**
 * The rental shop's dresses and jewellery, edited at /admin/dresses and shown on the Dresses page.
 * In Firestore as content/rental, or data/rental.json until content moves to Firebase. Until the
 * first save, the shop is what rental-seed.ts started it with.
 */
export type RentalKind = "dresses" | "jewellery";

export type RentalItem = {
  /** Stable, so edits and deletes always find the right piece even when its code changes. */
  id: string;
  code: string;
  name: string;
  category: string;
  /** Dresses only: e.g. "S, M". */
  size: string;
  price: string;
  period: string;
  sale: string;
  /** "" shows no availability label. */
  status: string;
  img: string;
};

export type Rental = Record<RentalKind, RentalItem[]>;

export const RENTAL_PERIODS = ["per day", "per 3 days", "per week"] as const;
export const RENTAL_STATUSES = ["", "Available", "Booked", "Out for cleaning"] as const;

const FILE = path.join(DATA_DIR, "rental.json");
const doc = () => firestore().collection("content").doc("rental");
const seed = (): Rental => ({ dresses: SEED_DRESSES, jewellery: SEED_JEWELLERY });

export const newRentalId = () => randomUUID();

/** The current shop, read fresh. */
export async function readRental(): Promise<Rental> {
  if (firebaseEnabled) {
    const snap = await doc().get();
    const data = snap.data() as Partial<Rental> | undefined;
    return data?.dresses && data?.jewellery ? { dresses: data.dresses, jewellery: data.jewellery } : seed();
  }
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Rental;
  } catch {
    return seed();
  }
}

/** On globalThis so a save clears what every page holds; visitors reuse one read for a minute. */
const shared = globalThis as typeof globalThis & { rentalCache?: { rental: Rental; at: number } | null };
const CACHE_MS = 60 * 1000;

/** The shop for visitors' pages. */
export async function getRental(): Promise<Rental> {
  const cached = shared.rentalCache;
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.rental;
  const rental = await readRental();
  shared.rentalCache = { rental, at: Date.now() };
  return rental;
}

let queue: Promise<unknown> = Promise.resolve();

/** Replaces the whole shop, one save at a time. Returns what it held before. */
export function writeRental(rental: Rental): Promise<Rental> {
  const run = queue.then(async () => {
    const before = await readRental();
    if (firebaseEnabled) await doc().set({ dresses: rental.dresses, jewellery: rental.jewellery, updatedAt: new Date().toISOString() });
    else {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(rental, null, 2), "utf8");
    }
    shared.rentalCache = { rental, at: Date.now() };
    return before;
  });
  queue = run.catch(() => undefined);
  return run;
}
