/** Renders admin-authored HTML. It is sanitised when saved (lib/content/sanitize.ts). */
export default function RichText({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return <div className={`rich ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />;
}
