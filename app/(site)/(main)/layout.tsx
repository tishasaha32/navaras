import Header from "@/components/Header";
import { section } from "@/lib/content/pages";
import { getLive } from "@/lib/content/store";

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { pages } = await getLive();
  const menu = section(pages.landing, "menu");
  return (
    <>
      <Header
        links={menu.list("links").filter((l) => l.label && l.href).map((l) => ({ label: l.label, href: l.href }))}
        cta={{ label: menu.text("cta"), href: menu.text("ctaHref") }}
      />
      <main>{children}</main>
    </>
  );
}
