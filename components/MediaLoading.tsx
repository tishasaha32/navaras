"use client";

import { useEffect } from "react";

/** Flags pictures that are still loading, so app/globals.css can show a loader in their place. */
export default function MediaLoading() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => {
      if (!img.complete) img.dataset.loading = "";
    };
    const clear = (e: Event) => {
      if (e.target instanceof HTMLImageElement) delete e.target.dataset.loading;
    };

    document.querySelectorAll("img").forEach(mark);
    const observer = new MutationObserver((records) => {
      for (const { target, addedNodes } of records) {
        if (target instanceof HTMLImageElement) mark(target);
        addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) mark(node);
          if (node instanceof Element) node.querySelectorAll("img").forEach(mark);
        });
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
    // Load and error don't bubble, so they're caught on the way down.
    document.addEventListener("load", clear, true);
    document.addEventListener("error", clear, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("load", clear, true);
      document.removeEventListener("error", clear, true);
    };
  }, []);

  return null;
}
