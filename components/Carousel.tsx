"use client";

import { useRef, useState } from "react";

/** Slides in a scroll-snapping track, so they swipe on touch screens without any script. */
export default function Carousel({ slides, ratio }: { slides: React.ReactNode[]; ratio?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="carousel" data-ratio={ratio} role="group" aria-roledescription="carousel" aria-label="Carousel">
      <div
        ref={track}
        className="carousel__track"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {slides.map((slide, i) => (
          <div key={i} className="carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
            {slide}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="carousel__nav">
          <button type="button" className="carousel__arrow" aria-label="Previous slide" disabled={index === 0} onClick={() => go(index - 1)}>
            ←
          </button>
          <div className="carousel__dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className="carousel__dot"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button type="button" className="carousel__arrow" aria-label="Next slide" disabled={index === slides.length - 1} onClick={() => go(index + 1)}>
            →
          </button>
        </div>
      )}
    </div>
  );
}
