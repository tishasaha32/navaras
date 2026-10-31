"use client";

import { useEffect, useRef } from "react";

const GAP = 48; // garland spacing, matches the toran tiles
const COUNT = 80; // enough for a 3840px-wide screen

/**
 * The toran across the top of a section: a still string and leaves, plus garlands that
 * sway on their own and swing harder when a pointer or finger brushes past them.
 */
export default function Toran() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const garlands = Array.from(root.querySelectorAll<HTMLElement>(".toran__garland"));
    const lastPush = new Map<number, number>();
    let lastX: number | null = null;
    let frame = 0;

    const push = (i: number, angle: number) => {
      const el = garlands[i];
      const now = performance.now();
      if (!el || now - (lastPush.get(i) ?? 0) < 350) return;
      lastPush.set(i, now);
      el.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: `rotate(${angle}deg)`, offset: 0.18 },
          { transform: `rotate(${-angle * 0.55}deg)`, offset: 0.45 },
          { transform: `rotate(${angle * 0.28}deg)`, offset: 0.7 },
          { transform: `rotate(${-angle * 0.1}deg)`, offset: 0.88 },
          { transform: "rotate(0deg)" },
        ],
        { duration: 1700, easing: "ease-out", composite: "add" },
      );
    };

    const onMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const dx = lastX === null ? 0 : x - lastX;
      lastX = x;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        if (y < r.top || y > r.bottom + 12 || x < r.left || x > r.right) return;
        const i = Math.round((x - r.left) / GAP);
        // Swing in the direction the pointer travels; a tap gives a gentle nudge.
        const dir = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(-dx);
        const strength = Math.min(16, 6 + Math.abs(dx) * 0.6);
        push(i, dir * strength);
        push(i - 1, dir * strength * 0.5);
        push(i + 1, dir * strength * 0.5);
        push(i - 2, dir * strength * 0.22);
        push(i + 2, dir * strength * 0.22);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="toran" aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => (
        <span key={i} className="toran__garland" style={{ left: i * GAP - GAP / 2, animationDelay: `${-((i * 1.37) % 7)}s` }} />
      ))}
    </div>
  );
}
