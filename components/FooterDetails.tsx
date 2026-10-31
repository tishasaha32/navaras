"use client";

/** The whole footer behind one arrow on phones. Everywhere else it's always open (app/globals.css). */
export default function FooterDetails({ children }: { children: React.ReactNode }) {
  return (
    <details
      className="footer-all"
      onToggle={(e) => {
        // The footer ends the page, so what opens would otherwise be out of sight below it.
        if (e.currentTarget.open) e.currentTarget.scrollIntoView({ block: "start", behavior: "smooth" });
      }}
    >
      <summary className="footer-all__toggle" aria-label="Footer details" title="Footer details">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      {children}
    </details>
  );
}
