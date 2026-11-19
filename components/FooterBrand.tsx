import Link from "next/link";

/** The footer logo: always the home page, like the header's. */
export default function FooterBrand() {
  return (
    <Link href="/" className="footer-brand">
      <img src="/images/logo.png" alt="" />
      Navaras
    </Link>
  );
}
