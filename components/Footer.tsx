import Link from "next/link";
import type { Category } from "@/lib/content/hub";
import { HUB_PATH } from "@/lib/content/hub";
import FooterBrand from "./FooterBrand";
import FooterDetails from "./FooterDetails";
import { Mandala, Toran, WhatsAppIcon } from "./ui";

export type Contact = {
  tagline: string;
  newsletter: string;
  whatsapp: string;
  email: string;
  city: string;
  instagram: string;
  youtube: string;
  facebook: string;
};

export function whatsappHref(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

const columns = [
  {
    title: "Services",
    links: [
      { href: "/navaras-dance-company", label: "Navaras Dance Company" },
      { href: "/navaras-weddings", label: "Navaras Weddings" },
      { href: "/navaras-dresses", label: "Navaras Dresses" },
      { href: "/navaras-dance-company#trial", label: "Free trial class" },
    ],
  },
  {
    title: "Navaras",
    links: [
      { href: `${HUB_PATH}/my-learning`, label: "My learning" },
      { href: "/navaras-dance-company#portal", label: "Student portal" },
      { href: "#contact", label: "Contact us" },
    ],
  },
];

/** An accordion on phones, opening one at a time; plain content everywhere else (app/globals.css). */
function FooterColumn({ title, open, className = "", children }: { title: string; open?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <details className={`footer-col ${className}`.trim()} name="footer-links" open={open}>
      <summary className="footer-col__title">{title}</summary>
      <div className="footer-col__links">{children}</div>
    </details>
  );
}

export default function Footer({ contact, categories }: { contact: Contact; categories: Category[] }) {
  const wa = whatsappHref(contact.whatsapp);
  const emailHref = contact.email.includes("@") ? `mailto:${contact.email}` : null;
  const socials = [
    { label: "Instagram", href: contact.instagram },
    { label: "YouTube", href: contact.youtube },
    { label: "Facebook", href: contact.facebook },
  ].filter((s) => s.href);
  const hasContact = wa || emailHref || contact.city || socials.length > 0;
  const hubLinks = [
    { href: HUB_PATH, label: "Library" },
    ...categories.map((c) => ({ href: `${HUB_PATH}?category=${encodeURIComponent(c.id)}#library`, label: c.name })),
  ];

  return (
    <footer id="contact" className="site-footer">
      <Toran />
      <Mandala reverse style={{ right: -260, bottom: -380, width: 720, height: 720 }} />
      <FooterDetails>
        <div className="container footer-inner">
          <div className="footer-top">
            <FooterColumn title="About Navaras" className="footer-about">
              <FooterBrand />
              {contact.tagline && <span style={{ maxWidth: 400 }}>{contact.tagline}</span>}
            </FooterColumn>
            {contact.newsletter && (
              <FooterColumn title="Newsletter" className="footer-news">
                <form style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--ivory)" }}>{contact.newsletter}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <label style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
                      Email address
                      <input type="email" placeholder="you@example.com" className="footer-input" />
                    </label>
                    <button type="button" className="btn btn--saffron btn--sm" style={{ alignSelf: "flex-end", minHeight: 50 }}>
                      Subscribe
                    </button>
                  </div>
                </form>
              </FooterColumn>
            )}
          </div>

          <div className="footer-cols">
            <FooterColumn title="Natyashastra Hub">
              {hubLinks.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </FooterColumn>
            {columns.map((col) => (
              <FooterColumn key={col.title} title={col.title}>
                {col.links.map((l) => (
                  <Link key={l.label} href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </FooterColumn>
            ))}
            {hasContact && (
              <FooterColumn title="Get in touch" open>
                {wa && (
                  <a href={wa} className="btn btn--saffron btn--sm" style={{ alignSelf: "flex-start", minHeight: 44, padding: "0 18px" }}>
                    <WhatsAppIcon />
                    WhatsApp {contact.whatsapp}
                  </a>
                )}
                {emailHref && <a href={emailHref}>{contact.email}</a>}
                {contact.city && <span>{contact.city}</span>}
                {socials.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {socials.map((s) => (
                      <a key={s.label} href={s.href} className="social" target="_blank" rel="noopener noreferrer">
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </FooterColumn>
            )}
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Navaras. All rights reserved.</span>
            <span style={{ display: "flex", gap: 20 }}>
              <a href="#">Privacy policy</a>
              <a href="#">Terms</a>
            </span>
          </div>
        </div>
      </FooterDetails>
    </footer>
  );
}
