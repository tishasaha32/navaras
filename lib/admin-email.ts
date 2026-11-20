/** The one Google account that can use the admin. Checked on the server; the browser only uses it to show the Admin link. */
export const ADMIN_EMAIL = "tishasaha32@gmail.com";

export const isAdminEmail = (email: string | null | undefined, verified: boolean | undefined) =>
  verified === true && (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
