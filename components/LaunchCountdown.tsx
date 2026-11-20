"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

function split(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return { hours: Math.floor(total / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60 };
}

/**
 * Counts down to the launch, then reloads the page so the visitor gets the real one at the same
 * address. It counts on the server's clock, so a visitor's wrong clock can't open the site early.
 */
export default function LaunchCountdown({ launchAt, serverNow }: { launchAt: number; serverNow: number }) {
  const [left, setLeft] = useState(launchAt - serverNow);

  useEffect(() => {
    const offset = serverNow - Date.now();
    let reload: number | undefined;
    const tick = () => {
      const ms = launchAt - (Date.now() + offset);
      setLeft(ms);
      if (ms <= 0) {
        window.clearInterval(timer);
        reload = window.setTimeout(() => window.location.reload(), 1200);
      }
    };
    const timer = window.setInterval(tick, 1000);
    tick();
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(reload);
    };
  }, [launchAt, serverNow]);

  if (left <= 0) {
    return (
      <p className="countdown__open" role="status">
        We’re open — welcome to Navaras!
      </p>
    );
  }

  const { hours, minutes, seconds } = split(left);
  const units = [
    ["Hours", hours],
    ["Minutes", minutes],
    ["Seconds", seconds],
  ] as const;

  return (
    <div className="countdown" role="timer" aria-label={`${hours} hours, ${minutes} minutes and ${seconds} seconds to go`}>
      {units.map(([label, value], i) => (
        <div key={label} className="countdown__part">
          {i > 0 && (
            <span className="countdown__sep" aria-hidden="true">
              :
            </span>
          )}
          <div className="countdown__unit" aria-hidden="true">
            <span className="countdown__num">{pad(value)}</span>
            <span className="countdown__label">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
