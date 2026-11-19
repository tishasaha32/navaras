/**
 * Line icons for the wedding "How it works" steps, drawn in the text colour so they sit
 * on the maroon tiles and on the saffron last tile alike. Steps past the fifth reuse the last.
 */
const ICONS = [
  // Consultation: two speech bubbles
  <>
    <path d="M8 14h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H20l-8 7v-7H8a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z" />
    <path d="M44 24h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-2v6l-7-6h-9a4 4 0 0 1-4-4v-2" />
    <circle cx="14" cy="25" r="1.6" fill="currentColor" />
    <circle cx="22" cy="25" r="1.6" fill="currentColor" />
    <circle cx="30" cy="25" r="1.6" fill="currentColor" />
  </>,
  // Song selection: notes beside a playlist
  <>
    <path d="M24 44V14l22-5v30" />
    <path d="M24 22l22-5" />
    <ellipse cx="18" cy="45" rx="6" ry="4.5" />
    <ellipse cx="40" cy="40" rx="6" ry="4.5" />
    <path d="M6 54h20M34 54h24M50 47h8" />
  </>,
  // Rehearsals, in person or online: a dancer on a laptop screen
  <>
    <rect x="10" y="12" width="44" height="30" rx="3" />
    <path d="M4 48h56l-4 5H8Z" />
    <circle cx="32" cy="20" r="3" />
    <path d="M32 23v8M24 22l8 4 8-4M27 38l5-7 5 7" />
  </>,
  // Final run-through: a checklist
  <>
    <rect x="12" y="10" width="40" height="46" rx="4" />
    <path d="M24 6h16v8H24Z" />
    <path d="M19 26l3 3 6-6M19 38l3 3 6-6M19 50h0" />
    <path d="M33 26h12M33 38h12" />
  </>,
  // Performance day: a lit diya
  <>
    <path d="M8 40h48c-2 8-12 14-24 14S10 48 8 40Z" />
    <path d="M24 54l-4 6h24l-4-6" />
    <path d="M32 8c5 7 7 12 7 17a7 7 0 0 1-14 0c0-5 2-10 7-17Z" />
    <path d="M32 22c2 3 2.5 5 2.5 6.5a2.5 2.5 0 0 1-5 0c0-1.5.5-3.5 2.5-6.5Z" fill="currentColor" />
    <path d="M14 34l-4-3M50 34l4-3" />
  </>,
];

export default function StepIcon({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width="76"
      height="76"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {ICONS[Math.min(index, ICONS.length - 1)]}
    </svg>
  );
}
