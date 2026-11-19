"use client";

import * as actions from "@/app/admin/actions";
import type { ActionResult } from "@/app/admin/actions";

/** Files uploaded from this tab since it loaded, so a save can delete any of them the content no longer uses. */
const made = new Set<string>();

const noted =
  (upload: (form: FormData) => Promise<ActionResult>) =>
  async (form: FormData): Promise<ActionResult> => {
    const res = await upload(form);
    if (res.ok && res.url) made.add(res.url.slice("/uploads/".length));
    return res;
  };

export const uploadImage = noted(actions.uploadImage);
export const uploadAudio = noted(actions.uploadAudio);
export const uploadVideo = noted(actions.uploadVideo);

export const uploadsThisVisit = () => [...made];
