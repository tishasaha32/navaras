/**
 * Link that hands a form's details to the business: an email draft when `to` is an email
 * address, a WhatsApp chat when it is a phone number. Returns null if neither.
 */
export function contactLink(to: string, subject: string, body: string): string | null {
  const t = to.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
    return `mailto:${t}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  const digits = t.replace(/\D/g, "");
  if (digits.length >= 7) return `https://wa.me/${digits}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`;
  return null;
}
