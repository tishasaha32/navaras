import { z } from "zod";
import { isAllowedImagePath } from "./images";
import { DRESS_CATEGORIES, JEWELLERY_CATEGORIES } from "./pages";
import { RENTAL_PERIODS, RENTAL_STATUSES, type Rental, type RentalKind } from "./rental";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

const item = (categories: string[]) =>
  z.object({
    id: z.string().min(1).max(64),
    code: text(20),
    name: text(120).min(1, "Every piece needs a name."),
    category: z.enum(categories as [string, ...string[]], { message: "Choose a category." }),
    size: text(60).default(""),
    price: text(60),
    period: z.enum(RENTAL_PERIODS),
    sale: text(160),
    status: z.enum(RENTAL_STATUSES),
    img: z.string().max(300).refine((v) => v === "" || isAllowedImagePath(v), "Choose the photo from the image library."),
  });

const list = (categories: string[]) =>
  z.array(item(categories)).max(2000).superRefine((items, ctx) => {
    const seen = new Map<string, number>();
    items.forEach((it, i) => {
      const code = it.code.toUpperCase();
      if (!code) return;
      if (seen.has(code)) ctx.addIssue({ code: "custom", path: [i, "code"], message: `Two pieces share the product ID ${it.code}.` });
      else seen.set(code, i);
    });
  });

const schema = z.object({ dresses: list(DRESS_CATEGORIES), jewellery: list(JEWELLERY_CATEGORIES) });

/** Checks a whole rental shop from the editor; a problem names the piece it's about. */
export function parseRental(data: unknown): { ok: true; rental: Rental } | { ok: false; error: string } {
  const parsed = schema.safeParse(data);
  if (parsed.success) return { ok: true, rental: parsed.data };
  const issue = parsed.error.issues[0];
  const [kind, index] = issue.path as [RentalKind?, number?];
  const piece = kind && typeof index === "number" ? (data as Rental)?.[kind]?.[index] : undefined;
  const where = piece ? `${piece.code || piece.name || `${kind === "dresses" ? "Dress" : "Piece"} ${index! + 1}`}: ` : "";
  return { ok: false, error: `${where}${issue.message}` };
}
