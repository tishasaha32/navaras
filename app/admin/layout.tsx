import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Navaras admin" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="adm">{children}</div>;
}
