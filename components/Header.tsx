"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavLink = { href: string; label: string; current?: boolean };

export default function Header({ links, cta, onSignOut }: { links: NavLink[]; cta?: NavLink; onSignOut?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <nav aria-label="Main" className="site-nav">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/images/logo.png" alt="" />
          Navaras
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="main-links"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <div id="main-links" className="nav-links" data-open={open}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={(l.current ?? (l.href.startsWith("/") && l.href !== "/" && pathname.startsWith(l.href.split("#")[0]))) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {/* Open for now; Firebase will put /admin behind a sign-in later. */}
          <Link href="/admin" aria-current={pathname.startsWith("/admin") ? "page" : undefined} onClick={() => setOpen(false)}>
            Admin
          </Link>
          {cta?.label && cta.href && (
            <Link href={cta.href} className="btn btn--saffron" onClick={() => setOpen(false)}>
              {cta.label}
            </Link>
          )}
          {onSignOut && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              Log out
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
