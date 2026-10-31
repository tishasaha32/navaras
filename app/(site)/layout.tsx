import { draftMode } from "next/headers";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import Footer from "@/components/Footer";
import { section } from "@/lib/content/pages";
import { getLive } from "@/lib/content/store";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { pages, hub } = await getLive();
  const footer = section(pages.landing, "footer");
  const preview = (await draftMode()).isEnabled;
  return (
    <>
      <FirebaseAnalytics />
      {preview && (
        <div className="preview-bar" role="status">
          Previewing saved drafts — visitors don’t see these changes yet.
          {/* A plain link: <Link> could prefetch this route handler and end the preview. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin/preview/exit">Exit preview</a>
        </div>
      )}
      {children}
      <Footer
        contact={{
          tagline: footer.text("tagline"),
          newsletter: footer.text("news"),
          whatsapp: footer.text("wa"),
          email: footer.text("email"),
          city: footer.text("city"),
          instagram: footer.text("ig"),
          youtube: footer.text("yt"),
          facebook: footer.text("fb"),
        }}
        categories={hub.categories}
      />
    </>
  );
}
