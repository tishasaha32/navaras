import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using the Navaras website, booking classes and choreography, and renting or ordering costumes.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="20 November 2026">
      <p>
        These terms cover your use of this website and of the services Navaras offers through it: dance classes, wedding choreography, dress and jewellery
        rental, custom stitching and the Natyashastra Hub. By using the site you agree to them.
      </p>

      <h2>Bookings and orders</h2>
      <p>
        Booking a trial class, asking for a quote or sending a stitching or rental enquiry through the site starts a conversation with us on WhatsApp or by
        email. It isn’t a confirmed booking or order. A class, choreography package, rental or stitching order is confirmed only when we confirm it to you
        directly, together with its price, dates and any specific conditions.
      </p>

      <h2>Prices</h2>
      <p>
        Prices shown on the site are in Indian rupees and are a guide. The price that applies is the one we confirm when you book. We may change prices on the
        site at any time; a change doesn’t affect a booking we’ve already confirmed.
      </p>

      <h2>Dress and jewellery rental</h2>
      <p>
        Rental prices are per day unless we say otherwise. When you rent, we’ll agree with you the rental dates, any deposit, how the piece is returned, and what
        happens if it’s returned late, damaged or not at all. Please take care of rented pieces and return them as they were given to you, apart from normal
        wear.
      </p>

      <h2>Custom stitching</h2>
      <p>
        Measurements, fabric, design, price and delivery date are agreed with you before we start. Because each piece is made to your measurements, please check
        them carefully; we’ll tell you what alterations are included and how long they take.
      </p>

      <h2>Classes and choreography</h2>
      <p>
        Class schedules, fees and choreography packages are agreed when you join or book. Dance is physical activity: please tell us about any injury or health
        condition that affects how you take part, and follow your teacher’s guidance in class.
      </p>

      <h2>The Natyashastra Hub</h2>
      <p>
        The Hub is for your own learning. Keep your sign-in to yourself, and don’t copy, republish or sell its lessons, photos, videos or quizzes. We may update,
        add or remove content at any time.
      </p>

      <h2>Our content</h2>
      <p>
        The text, photos, videos, illustrations and logos on this site belong to Navaras or are used with permission. You may share links to our pages, but
        please don’t reuse our content without asking us first.
      </p>

      <h2>Using the site fairly</h2>
      <p>Please don’t misuse the site: for example, by trying to break into it, overloading it, or using its forms to send spam.</p>

      <h2>Responsibility</h2>
      <p>
        We work to keep the site accurate and available, but we can’t promise it will always be error-free or online. To the extent the law allows, we aren’t
        responsible for losses that come from using the site, apart from what we’ve agreed with you for a confirmed booking or order.
      </p>

      <h2>Your privacy</h2>
      <p>
        How we handle your information is explained in our <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Changes and the law</h2>
      <p>
        We may update these terms; the date at the top shows when they last changed. These terms are governed by the laws of India.
      </p>

      <h2>Questions</h2>
      <p>
        If you have any question about these terms, please <Link href="/contact">contact us</Link>.
      </p>
    </LegalPage>
  );
}
