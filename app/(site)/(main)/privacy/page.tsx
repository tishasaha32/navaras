import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What information Navaras collects, why, and how you can see or delete it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="20 November 2026">
      <p>
        Navaras runs the Navaras Dance Company, Navaras Weddings, Navaras Dresses and the Natyashastra Hub. This page explains what information we collect
        through this website, why we collect it, and what you can ask us to do with it.
      </p>

      <h2>What we collect</h2>
      <h3>When you sign in to the Natyashastra Hub</h3>
      <p>
        You sign in with your Google account, and we receive your name and email address. If you signed in with your phone number before, we keep that
        number with your account. While you learn, we save your progress: the chapters you mark as read, your quiz scores and the chapter you opened last,
        so you can pick up where you left off.
      </p>
      <h3>When you subscribe to our newsletter</h3>
      <p>We save your email address and the date you subscribed, so we can send you new Hub concepts.</p>
      <h3>When you book, ask for a quote or send an enquiry</h3>
      <p>
        The trial class, wedding quote, custom stitching and contact forms don’t save anything on this website. They open WhatsApp (or your email app) with
        your details filled in, and nothing is sent until you press send there. What you send reaches us through WhatsApp or email, and WhatsApp’s or your email
        provider’s own privacy policy applies to that message.
      </p>
      <h3>When you browse</h3>
      <p>
        We use Google Analytics to understand how the site is used, such as which pages are visited and roughly where visitors are. It uses cookies and similar
        technology to do this. You can block these cookies in your browser settings; the site still works without them.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To run your Hub account and keep your progress.</li>
        <li>To send the newsletter you signed up for.</li>
        <li>To reply to your bookings, quotes and enquiries.</li>
        <li>To understand how the site is used and improve it.</li>
      </ul>
      <p>We don’t sell your information, and we don’t share it with anyone except the services below that run the site for us.</p>

      <h2>Who stores it</h2>
      <p>
        Accounts, progress and newsletter addresses are stored with Google Firebase, and analytics are handled by Google Analytics. Google processes this
        information for us under its own privacy and security terms, and it may be stored on servers outside India.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your Hub account and progress while your account exists, and your newsletter address until you unsubscribe. When you ask us to delete either, we
        delete it.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us what information we hold about you, ask us to correct it, or ask us to delete your account, your progress or your newsletter
        subscription. Just <Link href="/contact">contact us</Link> and tell us what you’d like.
      </p>

      <h2>Children</h2>
      <p>
        Many of our students are children. If a child under 18 uses the Natyashastra Hub, a parent or guardian should set up and supervise the account, and can
        ask us to delete it at any time.
      </p>

      <h2>Changes</h2>
      <p>If we change how we handle your information, we’ll update this page and the date at the top.</p>

      <h2>Questions</h2>
      <p>
        If you have any question about your information, please <Link href="/contact">contact us</Link>.
      </p>
    </LegalPage>
  );
}
