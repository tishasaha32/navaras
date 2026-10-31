import { z } from "zod";
import { assignSlugs, type Hub } from "./hub";
import { isAllowedImagePath } from "./images";
import { sanitizeRichText } from "./sanitize";

const image = z.union([z.literal(""), z.string().refine(isAllowedImagePath, "Pick an image from the library.")]);
const short = z.string().trim().max(300);
const long = z.string().trim().max(5000);

const id = z.string().regex(/^[a-z0-9-]{1,80}$/, "Invalid id.");
const status = z.enum(["draft", "published"]);

const hubSchema = z.object({
  categories: z
    .array(z.object({ id, name: short.min(1, "Every category needs a name."), dev: short }))
    .max(50),
  sections: z
    .array(
      z.object({
        id,
        slug: z.string().max(80).catch(""),
        status,
        cat: z.string().max(80),
        title: short.min(1, "Every section needs a title."),
        dev: short,
        desc: long,
        img: image,
        chapters: z
          .array(
            z.object({
              id,
              slug: z.string().max(80).catch(""),
              status,
              title: short.min(1, "Every chapter needs a title."),
              body: z.string().max(100_000).transform(sanitizeRichText),
              thumb: image,
            }),
          )
          .max(200),
        quizzes: z
          .array(
            z.object({
              id,
              slug: z.string().max(80).catch(""),
              status,
              title: short.min(1, "Every quiz needs a title."),
              type: short,
              pass: z.coerce.number().int().min(0).max(100).catch(60),
              questions: z
                .array(
                  z.object({
                    text: long,
                    options: z.array(short).max(8),
                    answer: z.number().int().min(0),
                    explain: long,
                  }),
                )
                .max(100),
            }),
          )
          .max(50),
      }),
    )
    .max(200),
});

/** Validates the Hub. When publishing, half-written questions and blank answers are dropped. */
export function parseHub(data: unknown, publishing: boolean): { ok: true; hub: Hub } | { ok: false; error: string } {
  const parsed = hubSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid content." };
  const hub = parsed.data as Hub;

  const ids = new Set<string>();
  for (const s of hub.sections) {
    for (const x of [s, ...s.chapters, ...s.quizzes]) {
      if (ids.has(x.id)) return { ok: false, error: "Two items share the same id. Reload the page and try again." };
      ids.add(x.id);
    }
  }
  const cats = new Set(hub.categories.map((c) => c.id));
  for (const s of hub.sections) {
    if (!cats.has(s.cat)) s.cat = hub.categories[0]?.id ?? "";
    for (const q of s.quizzes) {
      for (const qq of q.questions) qq.answer = Math.min(qq.answer, Math.max(0, qq.options.length - 1));
      if (!publishing) continue;
      // Drop blank answers and empty questions, keeping the marked answer pointing at the same option.
      q.questions = q.questions
        .map((qq) => {
          const correct = qq.options[qq.answer];
          const options = qq.options.filter((o) => o.trim());
          return { ...qq, options, answer: Math.max(0, options.indexOf(correct ?? "")) };
        })
        .filter((qq) => qq.text && qq.options.length >= 2);
    }
  }
  return { ok: true, hub: assignSlugs(hub) };
}
