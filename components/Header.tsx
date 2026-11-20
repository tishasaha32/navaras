"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_HOME } from "@/lib/admin-email";

type NavLink = { href: string; label: string; current?: boolean };

export default function Header({ links, cta, onSignOut, showAdmin = false }: { links: NavLink[]; cta?: NavLink; onSignOut?: () => void; showAdmin?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const desktop = window.matchMedia("(min-width: 901px)");
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", close);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", close);
    };
  }, [open]);

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
        {open && <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
        <div className="nav-panel">
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
            {/* Only for the admin's account; the admin itself checks again on the server. */}
            {showAdmin && (
              <Link href={ADMIN_HOME} aria-current={pathname.startsWith("/admin") ? "page" : undefined} onClick={() => setOpen(false)}>
                Admin
              </Link>
            )}
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
        </div>
      </nav>
    </header>
  );
}
