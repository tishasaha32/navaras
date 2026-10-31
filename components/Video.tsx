"use client";

import { useRef, useState } from "react";
import { embedUrl } from "@/lib/video";
import { PlayIcon } from "./ui";

function Player({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}

/** Play badge over an image that opens the video in a lightbox. Renders nothing without a link. */
export function PlayButton({ url, title }: { url: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  if (!url) return null;
  const src = embedUrl(url);
  if (!src) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="play-badge play-badge--button" aria-label={`Watch video: ${title}`}>
        <PlayIcon />
      </a>
    );
  }
  return (
    <>
      <button
        type="button"
        className="play-badge play-badge--button"
        aria-label={`Play video: ${title}`}
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
      >
        <PlayIcon />
      </button>
      <dialog ref={dialog} className="video-dialog" aria-label={title} onClose={() => setOpen(false)}>
        <div className="video-dialog__frame">{open && <Player src={src} title={title} />}</div>
        <button type="button" className="video-dialog__close" aria-label="Close video" onClick={() => dialog.current?.close()}>
          ✕
        </button>
      </dialog>
    </>
  );
}
