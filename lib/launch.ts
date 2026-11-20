/**
 * The site opens to visitors at this moment. Until then middleware.ts shows every public page
 * as the countdown (app/coming-soon); from then on the site runs normally, with no redeploy.
 * It is one instant for everyone, written in India time (+05:30).
 */
export const LAUNCH_AT = Date.parse("2026-11-21T09:00:00+05:30");

export const isLaunched = (now = Date.now()) => now >= LAUNCH_AT;

/** The countdown's own address; visitors never need to type it. */
export const COUNTDOWN_PATH = "/coming-soon";
