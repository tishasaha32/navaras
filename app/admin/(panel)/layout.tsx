import Link from "next/link";

export const dynamic = "force-dynamic";

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
