"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/natyashastra-hub", label: "Natyashastra Hub" },
  { href: "/admin/dresses", label: "Dresses" },
];

/** Switches between the admin's editors. */
export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="adm-nav">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
