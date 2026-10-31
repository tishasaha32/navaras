"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminTopNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="adm-topnav">
      {links.map((l) => (
        <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
