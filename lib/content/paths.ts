import path from "path";

/** Where content lives on disk (override the folder with CONTENT_DIR). */
export const DATA_DIR = process.env.CONTENT_DIR ?? path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
