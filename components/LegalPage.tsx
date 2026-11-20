import { Divider } from "@/components/ui";

/** A plain reading page for the privacy policy and terms. */
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <section className="section section--ivory" style={{ paddingTop: "clamp(48px, 8vw, 96px)", paddingBottom: "clamp(56px, 10vw, 112px)" }}>
      <article className="legal">
        <h1 className="display" style={{ fontSize: "clamp(34px, 4vw, 52px)", lineHeight: 1.08 }}>
          {title}
        </h1>
        <p className="muted" style={{ fontSize: 14 }}>
          Last updated {updated}
        </p>
        <Divider />
        {children}
      </article>
    </section>
  );
}
