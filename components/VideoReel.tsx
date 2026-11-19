"use client";

import { useRef, useState } from "react";
import { VideoPlayer } from "@/components/MediaPlayer";

export type ReelItem = { src: string; title: string };

/** A row of videos that scrolls sideways, a few at a time. Starting one pauses the others. */
export default function VideoReel({ items, ratio = "4:5", label }: { items: ReelItem[]; ratio?: string; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: items.length <= 1 });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: reduced ? "auto" : "smooth" });
  };

  /** Only one video plays at a time. */
  const onPlay = (e: React.SyntheticEvent) => {
    track.current?.querySelectorAll("video").forEach((v) => {
      if (v !== e.target) v.pause();
    });
  };

  return (
    <div className="reel" role="group" aria-roledescription="carousel" aria-label={label}>
      <div ref={track} className="reel__track" onScroll={update} onPlayCapture={onPlay}>
        {items.map((it, i) => (
          <figure key={i} className="reel__item" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}${it.title ? `: ${it.title}` : ""}`}>
            <VideoPlayer src={it.src} title={it.title || `Video ${i + 1}`} ratio={ratio} />
            {it.title && <figcaption className="reel__caption">{it.title}</figcaption>}
          </figure>
        ))}
      </div>
      {items.length > 1 && (
        <div className="reel__nav">
          <button type="button" className="carousel__arrow" aria-label="Previous videos" disabled={edge.start} onClick={() => step(-1)}>
            ←
          </button>
          <button type="button" className="carousel__arrow" aria-label="More videos" disabled={edge.end} onClick={() => step(1)}>
            →
          </button>
        </div>
      )}
    </div>
  );
}
