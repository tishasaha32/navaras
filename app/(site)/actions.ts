"use server";

import { addSubscriber } from "@/lib/content/subscribers";

export type SubscribeResult = { ok: true; message: string } | { ok: false; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The footer newsletter sign-up. */
export async function subscribe(form: FormData): Promise<SubscribeResult> {
  // A field people never see: anything that fills it in is a bot, and is quietly turned away.
  if (String(form.get("website") ?? "")) return { ok: true, message: "Thanks — you’re subscribed." };

  const email = String(form.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "Enter your email address." };
  if (email.length > 254 || !EMAIL.test(email)) return { ok: false, message: "That doesn’t look like an email address." };

  try {
    const added = await addSubscriber(email);
    return { ok: true, message: added ? "Thanks — you’re subscribed." : "You’re already subscribed. Thank you!" };
  } catch (err) {
    console.error("Newsletter sign-up failed", err);
    return { ok: false, message: "Something went wrong. Please try again in a moment." };
  }
}
