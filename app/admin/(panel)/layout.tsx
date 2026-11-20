import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import AdminSignOut from "@/components/admin/AdminSignOut";
import { getAdmin } from "@/lib/admin-auth";
import { ADMIN_HOME } from "@/lib/admin-email";

export const dynamic = "force-dynamic";

/** Everything in the admin panel is for the admin only: anyone else is sent to sign in. */
export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await getAdmin())) redirect("/admin/login");
  return (
    <>
      <header className="adm-top">
        <img src="/images/mandala-gold.svg" alt="" aria-hidden="true" className="adm-top__mandala" />
        <div className="adm-wrap adm-top__bar">
          <Link href={ADMIN_HOME} className="adm-brand">
            <img src="/images/logo.png" alt="" />
            <span className="adm-brand__name">Navaras</span>
            <span className="adm-brand__tag">Admin</span>
          </Link>
          <AdminNav />
          <div className="adm-top__tools">
            <Link href="/" target="_blank" className="adm-top__link">
              View site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Link>
            <AdminSignOut />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
