import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { whatsappHref } from "@/components/Footer";
import { Divider, Toran, WhatsAppIcon } from "@/components/ui";
import { section } from "@/lib/content/pages";
import { getLive } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Ask Navaras about dance classes, wedding choreography, dress and jewellery rental or custom stitching.",
};

export default async function ContactPage() {
  const footer = section((await getLive()).pages.landing, "footer");
  const number = footer.text("wa");
  const wa = whatsappHref(number, "Hi Navaras! I have a question.");
  const email = footer.text("email");

  return (
    <section className="hero-section" style={{ paddingBottom: "clamp(56px, 10vw, 112px)" }}>
      <Toran />
      <div className="container split" style={{ alignItems: "flex-start", gap: "clamp(32px, 6vw, 72px)" }}>
        <div className="stack" style={{ flex: "1 1 360px", gap: 18 }}>
          <p className="eyebrow">Contact us</p>
          <h1 className="display" style={{ fontSize: "clamp(36px, 4.37vw, 58px)", lineHeight: 1.05 }}>
            We’d love to hear from you.
          </h1>
          <Divider />
          <p className="lead">Classes, a sangeet, a costume or a question about the Natyashastra: send us a message and we’ll reply on WhatsApp.</p>
          {(wa || email.includes("@")) && (
            <div className="stack" style={{ gap: 12, marginTop: 6 }}>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn--saffron" style={{ alignSelf: "flex-start" }}>
                  <WhatsAppIcon />
                  WhatsApp {number}
                </a>
              )}
              {email.includes("@") && (
                <a href={`mailto:${email}`} style={{ fontWeight: 600 }}>
                  {email}
                </a>
              )}
            </div>
          )}
        </div>
        <div style={{ flex: "1.3 1 480px", minWidth: 0 }}>
          <ContactForm sendTo={number} />
        </div>
      </div>
    </section>
  );
}
