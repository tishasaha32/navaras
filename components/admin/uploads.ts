"use client";

import * as actions from "@/app/admin/actions";
import type { ActionResult } from "@/app/admin/actions";
import { compressImage } from "@/lib/compress-image";

/** Files uploaded from this tab since it loaded, so a save can delete any of them the content no longer uses. */
const made = new Set<string>();

const noted =
  (upload: (form: FormData) => Promise<ActionResult>) =>
  async (form: FormData): Promise<ActionResult> => {
    const res = await upload(form);
    if (res.ok && res.url) made.add(res.url.slice("/uploads/".length));
    return res;
  };

/** Every image is compressed to under 400 KB in the browser before it is sent to Storage. */
const compressed =
  (upload: (form: FormData) => Promise<ActionResult>) =>
  async (form: FormData): Promise<ActionResult> => {
    const file = form.get("file");
    if (file instanceof File) form.set("file", await compressImage(file));
    return upload(form);
  };

export const uploadImage = noted(compressed(actions.uploadImage));
export const uploadAudio = noted(actions.uploadAudio);
export const uploadVideo = noted(actions.uploadVideo);

export const uploadsThisVisit = () => [...made];
