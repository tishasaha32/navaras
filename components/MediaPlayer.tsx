"use client";

import { useEffect, useRef, useState } from "react";

type Props = { src: string; title: string };

const clock = (seconds: number) => {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function useMedia<T extends HTMLMediaElement>() {
  const ref = useRef<T>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shape, setShape] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const readDetails = () => {
    const m = ref.current;
    if (!m) return;
    if (Number.isFinite(m.duration)) setDuration(m.duration);
    if (m instanceof HTMLVideoElement && m.videoHeight) setShape(m.videoWidth / m.videoHeight);
    if (m.readyState > 0) setLoading(false);
  };

  // The file's details can finish loading before React attaches its handlers.
  useEffect(readDetails, []);

  return {
    playing,
    time,
    duration,
    shape,
    loading,
    failed,
    media: {
      ref,
      onLoadedMetadata: readDetails,
      onDurationChange: readDetails,
      onWaiting: () => setLoading(true),
      onPlaying: () => setLoading(false),
      onCanPlay: () => setLoading(false),
      onError: () => {
        setLoading(false);
        setFailed(true);
      },
      onTimeUpdate: (e: React.SyntheticEvent<T>) => setTime(e.currentTarget.currentTime),
      onPlay: () => setPlaying(true),
      onPause: () => setPlaying(false),
    },
    toggle: () => {
      const m = ref.current;
      if (!m) return;
      if (m.error) m.load();
      setFailed(false);
      if (m.paused) m.play().catch(console.error);
      else m.pause();
    },
    retry: () => {
      setFailed(false);
      setLoading(true);
      ref.current?.load();
    },
    seek: (t: number) => {
      if (ref.current) ref.current.currentTime = t;
      setTime(t);
    },
  };
}

function Seek({ time, duration, onSeek }: { time: number; duration: number; onSeek: (t: number) => void }) {
  return (
    <input
      type="range"
      className="media-seek"
      aria-label="Seek"
      aria-valuetext={`${clock(time)} of ${clock(duration)}`}
      min={0}
      max={duration}
      step="any"
      value={Math.min(time, duration)}
      disabled={!duration}
      style={{ "--pct": `${duration ? (time / duration) * 100 : 0}%` } as React.CSSProperties}
      onChange={(e) => onSeek(Number(e.target.value))}
    />
  );
}

function Glyph({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const PLAY = "M8 5v14l11-7z";
const PAUSE = "M7 5h4v14H7zM13 5h4v14h-4z";

export function AudioPlayer({ src, title }: Props) {
  const p = useMedia<HTMLAudioElement>();
  return (
    <div className="audio-player" role="group" aria-label={title || "Audio"}>
      <audio src={src} preload="metadata" {...p.media} />
      <button type="button" className="audio-player__toggle" aria-label={p.playing ? "Pause" : "Play"} onClick={p.toggle}>
        <Glyph d={p.playing ? PAUSE : PLAY} />
      </button>
      <div className="audio-player__main">
        {title && <span className="audio-player__title">{title}</span>}
        <div className="audio-player__line">
          <Seek time={p.time} duration={p.duration} onSeek={p.seek} />
          <span className="media-time">
            {clock(p.time)} / {clock(p.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

type VideoProps = Props & { size?: string; align?: string; ratio?: string | null; children?: React.ReactNode };

export function VideoPlayer({ src, title, size, align, ratio, children }: VideoProps) {
  const p = useMedia<HTMLVideoElement>();
  const [w, h] = ratio ? ratio.split(":").map(Number) : [];
  const shape = w ? w / h : p.shape;
  const frame = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  /** Lessons can hold many videos: each one starts loading only as it nears the screen. */
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!frame.current) return;
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        watcher.disconnect();
      },
      { rootMargin: "400px" },
    );
    watcher.observe(frame.current);
    return () => watcher.disconnect();
  }, []);

  const toggleMuted = () => {
    const video = p.media.ref.current;
    if (video) video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (frame.current?.requestFullscreen) void frame.current.requestFullscreen();
    // iPhones can only make the video itself fullscreen.
    else (p.media.ref.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
  };

  return (
    <div
      ref={frame}
      className="video-player"
      data-align={align}
      data-ratio={ratio ?? undefined}
      style={{ "--size": size, "--shape": shape } as React.CSSProperties}
      role="group"
      aria-label={title || "Video"}
    >
      <div className="video-player__screen">
        <video src={near ? src : undefined} title={title} preload="metadata" playsInline onClick={p.toggle} onVolumeChange={(e) => setMuted(e.currentTarget.muted)} {...p.media} />
        {p.failed ? (
          <div className="video-player__failed" role="alert">
            <span>This video couldn’t load.</span>
            <button type="button" className="btn btn--saffron btn--sm" onClick={p.retry}>
              Try again
            </button>
          </div>
        ) : p.loading ? (
          <span className="video-player__loader" role="status" aria-label="Loading video" />
        ) : (
          !p.playing && (
            <button type="button" className="video-player__big" aria-label="Play" onClick={p.toggle}>
              <Glyph d={PLAY} size={34} />
            </button>
          )
        )}
      </div>
      <div className="video-player__bar">
        <Seek time={p.time} duration={p.duration} onSeek={p.seek} />
        <div className="video-player__row">
          <button type="button" className="video-player__btn" aria-label={p.playing ? "Pause" : "Play"} onClick={p.toggle}>
            <Glyph d={p.playing ? PAUSE : PLAY} />
          </button>
          <span className="media-time">
            {clock(p.time)} / {clock(p.duration)}
          </span>
          <button type="button" className="video-player__btn" style={{ marginLeft: "auto" }} aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMuted}>
            <Glyph d={muted ? "M4 9v6h4l5 4V5L8 9zM16 9l5 6m0-6-5 6" : "M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7zM16 5a9 9 0 0 1 0 14v-2a7 7 0 0 0 0-10z"} />
          </button>
          <button type="button" className="video-player__btn" aria-label="Full screen" onClick={toggleFullscreen}>
            <Glyph d="M4 4h6v2H6v4H4zM14 4h6v6h-2V6h-4zM4 14h2v4h4v2H4zM18 14h2v6h-6v-2h4z" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
