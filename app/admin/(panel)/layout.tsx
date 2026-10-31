import Link from "next/link";
import AdminTopNav from "@/components/admin/AdminTopNav";
import { PAGE_SCHEMAS } from "@/lib/content/pages";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin/natyashastra-hub", label: "Natyashastra Hub" },
  { href: `/admin/${PAGE_SCHEMAS.landing.slug}`, label: PAGE_SCHEMAS.landing.label },
  { href: `/admin/${PAGE_SCHEMAS.dance.slug}`, label: PAGE_SCHEMAS.dance.label },
  { href: `/admin/${PAGE_SCHEMAS.weddings.slug}`, label: PAGE_SCHEMAS.weddings.label },
  { href: `/admin/${PAGE_SCHEMAS.dresses.slug}`, label: PAGE_SCHEMAS.dresses.label },
];

export default function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="adm-top">
        <img src="/images/mandala-gold.svg" alt="" aria-hidden="true" className="adm-top__mandala" />
        <div className="adm-wrap adm-top__bar">
          <Link href="/admin" className="adm-brand">
            <img src="/images/logo.png" alt="" />
            <span className="adm-brand__name">Navaras</span>
            <span className="adm-brand__tag">Admin</span>
          </Link>
          <AdminTopNav links={links} />
          <div className="adm-top__tools">
            <Link href="/" target="_blank" className="adm-top__link">
              View site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
