import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthPanel from "@/components/hub/AuthPanel";
import { Divider, Mandala, Sparkle, Toran } from "@/components/ui";

export const metadata: Metadata = {
  title: "Log in — Natyashastra Hub",
};

const perks = [
  "Save your place in every section",
  "Mark chapters as read as you finish them",
  "Take quizzes and keep your scores",
  "Pick up where you left off",
];

export default function LoginPage() {
  return (
    <section className="hero-section" style={{ padding: "clamp(56px, 10vw, 104px) clamp(16px, 5vw, 32px) clamp(64px, 10vw, 120px)" }}>
      <Toran />
      <div className="auth-shell">
        <div className="auth-aside">
          <Mandala style={{ left: -220, bottom: -260, width: 560, height: 560 }} />
          <p lang="sa" className="dev" style={{ position: "relative", fontSize: 23, color: "var(--gold-soft)" }}>
            नाट्यशास्त्र
          </p>
          <h1 style={{ position: "relative", fontSize: "clamp(29px, 3.24vw, 37px)", lineHeight: 1.08 }}>
            Track your Natyashastra journey.
          </h1>
          <Divider style={{ position: "relative" }} />
          <ul className="sparkle-list" style={{ position: "relative", gap: 14 }}>
            {perks.map((p) => (
              <li key={p}>
                <Sparkle stroke="#F2C46D" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/natyashastra-hub" style={{ position: "relative", marginTop: "auto", color: "var(--gold-soft)", fontWeight: 700 }}>
            ← Back to the library
          </Link>
        </div>
        <Suspense>
          <AuthPanel />
        </Suspense>
      </div>
    </section>
  );
}
