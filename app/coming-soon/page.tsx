import type { Metadata } from "next";
import LaunchCountdown from "@/components/LaunchCountdown";
import { Divider, Mandala, Toran } from "@/components/ui";
import { LAUNCH_AT } from "@/lib/launch";

/** Shown in place of every public page until the launch (see middleware.ts). */

// Rendered per visit: the countdown starts from the server's clock.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Opening soon",
  robots: { index: false },
};

const INDIA = "Asia/Kolkata";
const day = new Intl.DateTimeFormat("en-GB", { timeZone: INDIA, weekday: "long", day: "numeric", month: "long" }).format(LAUNCH_AT);
const time = new Intl.DateTimeFormat("en-US", { timeZone: INDIA, hour: "numeric", minute: "2-digit" }).format(LAUNCH_AT);

export default function ComingSoon() {
  return (
    <main className="launch">
      <Toran />
      <Mandala style={{ width: 760, height: 760, left: "50%", top: "50%", marginLeft: -380, marginTop: -380, opacity: 0.28 }} />
      <div className="launch__inner">
        <img src="/images/logo.png" alt="Navaras" className="launch__logo" />
        <p lang="hi" className="dev">
          नवरस
        </p>
        <h1 className="display">The stage is almost set</h1>
        <Divider />
        <p className="lead">
          Dance, celebration and costume, rooted in the Natyashastra. We open on {day} at {time} IST.
        </p>
        <LaunchCountdown launchAt={LAUNCH_AT} serverNow={Date.now()} />
      </div>
    </main>
  );
}
