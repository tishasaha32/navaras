"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HUB_PATH } from "@/lib/content/hub";

/** The footer logo: home for whichever part of the site this is, like the header's. */
export default function FooterBrand() {
  const home = usePathname().startsWith(HUB_PATH) ? HUB_PATH : "/";
  return (
    <Link href={home} className="footer-brand">
      <img src="/images/logo.png" alt="" />
      Navaras
    </Link>
  );
}
