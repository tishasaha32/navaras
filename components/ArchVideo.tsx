"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted, looping video in the arched frame, like a moving ArchImage. Visitors who ask for
 * reduced motion get it paused; everyone can pause it and turn the sound on.
 */
export default function ArchVideo({ src, title }: { src: string; title: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {}); // Some browsers refuse autoplay; the play button still works.
  }, []);

  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.paused) void v.play();
  };

  return (
    <div className="arch-wrap">
      <div className="arch">
        <div className="arch__ring" aria-hidden="true" />
        <video
          ref={video}
          src={src}
          title={title}
          className="arch__img"
          muted
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        />
        <div className="arch-video__controls">
          <button type="button" className="arch-video__btn" aria-label={playing ? "Pause video" : "Play video"} onClick={togglePlay}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d={playing ? "M7 5h4v14H7zM13 5h4v14h-4z" : "M8 5v14l11-7z"} />
            </svg>
          </button>
          <button type="button" className="arch-video__btn" aria-label={muted ? "Turn sound on" : "Turn sound off"} onClick={toggleSound}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d={muted ? "M4 9v6h4l5 4V5L8 9zM16 9l5 6m0-6-5 6" : "M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7zM16 5a9 9 0 0 1 0 14v-2a7 7 0 0 0 0-10z"} stroke={muted ? "currentColor" : undefined} strokeWidth={muted ? 2 : undefined} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
