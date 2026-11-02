"use client";

import { useEffect, useRef, useState } from "react";
import type { ActionResult } from "@/app/admin/actions";

/** The part of the picture to keep: each edge as a fraction of its width or height. */
type Box = { left: number; top: number; right: number; bottom: number };

const WHOLE: Box = { left: 0, top: 0, right: 1, bottom: 1 };

/** Smallest share of the picture's width or height that can be kept. */
const MIN_SIDE = 0.05;

const JPEG_QUALITY = 0.92;

const GRIPS = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function resized(box: Box, edges: string, dx: number, dy: number): Box {
  const next = { ...box };
  if (edges.includes("w")) next.left = clamp(box.left + dx, 0, box.right - MIN_SIDE);
  if (edges.includes("e")) next.right = clamp(box.right + dx, box.left + MIN_SIDE, 1);
  if (edges.includes("n")) next.top = clamp(box.top + dy, 0, box.bottom - MIN_SIDE);
  if (edges.includes("s")) next.bottom = clamp(box.bottom + dy, box.top + MIN_SIDE, 1);
  return next;
}

function moved(box: Box, dx: number, dy: number): Box {
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const left = clamp(box.left + dx, 0, 1 - width);
  const top = clamp(box.top + dy, 0, 1 - height);
  return { left, top, right: left + width, bottom: top + height };
}

/** Grips sit just inside the box, so they stay on the picture when the box reaches its edge. */
function gripStyle(edges: string): React.CSSProperties {
  const x = edges.includes("w") ? ["0", "0"] : edges.includes("e") ? ["100%", "-100%"] : ["50%", "-50%"];
  const y = edges.includes("n") ? ["0", "0"] : edges.includes("s") ? ["100%", "-100%"] : ["50%", "-50%"];
  return { left: x[0], top: y[0], transform: `translate(${x[1]}, ${y[1]})`, cursor: `${edges}-resize` };
}

/** Lets the admin drag out part of a picture. The result is saved as a new upload, so the picture it came from isn't touched. */
export default function CropDialog({
  src,
  onUpload,
  onCropped,
  onClose,
}: {
  src: string;
  onUpload: (form: FormData) => Promise<ActionResult>;
  onCropped: (url: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [box, setBox] = useState(WHOLE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  /** `edges` names the sides being dragged; none moves the whole box. */
  const drag = (e: React.PointerEvent<HTMLElement>, edges: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    const { width, height } = stage.current!.getBoundingClientRect();
    const from = box;
    const startX = e.clientX;
    const startY = e.clientY;
    const move = (m: PointerEvent) => {
      const dx = (m.clientX - startX) / width;
      const dy = (m.clientY - startY) / height;
      setBox(edges ? resized(from, edges, dx, dy) : moved(from, dx, dy));
    };
    target.setPointerCapture(e.pointerId);
    target.addEventListener("pointermove", move);
    target.addEventListener("lostpointercapture", () => target.removeEventListener("pointermove", move), { once: true });
  };

  const pixels = natural && {
    x: Math.round(box.left * natural.width),
    y: Math.round(box.top * natural.height),
    width: Math.round((box.right - box.left) * natural.width),
    height: Math.round((box.bottom - box.top) * natural.height),
  };

  const apply = () => {
    if (!pixels) return;
    setSaving(true);
    setError(null);
    const canvas = document.createElement("canvas");
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    canvas.getContext("2d")!.drawImage(picture.current!, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, pixels.width, pixels.height);
    const type = /\.jpe?g$/.test(src) ? "image/jpeg" : /\.webp$/.test(src) ? "image/webp" : "image/png";
    canvas.toBlob(
      async (blob) => {
        const form = new FormData();
        form.append("file", blob!, "cropped");
        const res = await onUpload(form).catch((): ActionResult => ({ ok: false, error: "The cropped picture couldn’t be saved. Try again." }));
        if (res.ok) return onCropped(res.url!);
        setError(res.error);
        setSaving(false);
      },
      type,
      JPEG_QUALITY,
    );
  };

  const untouched = box === WHOLE;

  return (
    <dialog ref={dialog} className="picker__dialog" aria-label="Crop image" onClose={onClose} onCancel={(e) => saving && e.preventDefault()}>
      <div className="picker__head">
        <strong style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>Crop image</strong>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {pixels && (
            <span className="adm-muted">
              {pixels.width} × {pixels.height} px
            </span>
          )}
          <button type="button" className="adm-btn adm-btn--sm adm-btn--light" disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" disabled={saving || untouched || !natural} onClick={apply}>
            {saving ? "Saving…" : "Apply crop"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="adm-error">
          {error}
        </p>
      )}
      <p className="adm-muted" style={{ margin: 0 }}>
        Drag the corners or edges to choose what to keep, or drag inside the box to move it.
      </p>
      <div ref={stage} className="crop__stage">
        <img ref={picture} src={src} alt="" draggable={false} onLoad={(e) => setNatural({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} />
        {natural && (
          <div
            className="crop__box"
            style={{ left: `${box.left * 100}%`, top: `${box.top * 100}%`, width: `${(box.right - box.left) * 100}%`, height: `${(box.bottom - box.top) * 100}%` }}
            onPointerDown={(e) => drag(e, "")}
          >
            {GRIPS.map((edges) => (
              <span key={edges} className="crop__grip" style={gripStyle(edges)} onPointerDown={(e) => drag(e, edges)} />
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
