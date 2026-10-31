import type { CSSProperties, ReactNode } from "react";

export function Divider({ style }: { style?: CSSProperties }) {
  return <img src="/images/divider.svg" alt="" aria-hidden="true" className="divider" style={style} />;
}

export { default as Toran } from "./Toran";

export function Mandala({
  variant = "gold",
  reverse = false,
  style,
}: {
  variant?: "gold" | "light";
  /** Turn the other way, a little slower. */
  reverse?: boolean;
  style: CSSProperties;
}) {
  return (
    <img
      src={`/images/mandala-${variant}.svg`}
      alt=""
      aria-hidden="true"
      className={`mandala${reverse ? " mandala--reverse" : ""}`}
      style={style}
    />
  );
}

export function ArchImage({
  src,
  alt,
  dark = false,
  children,
}: {
  src: string;
  alt: string;
  dark?: boolean;
  /** Overlay, e.g. a play button. */
  children?: ReactNode;
}) {
  return (
    <div className="arch-wrap">
      <div className={`arch${dark ? " arch--dark" : ""}`}>
        <div className="arch__ring" aria-hidden="true" />
        <img src={src} alt={alt} className="arch__img" />
        {children}
      </div>
    </div>
  );
}

export function PlayBadge() {
  return (
    <span className="play-badge" aria-hidden="true">
      <PlayIcon />
    </span>
  );
}

export function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5l12 7-12 7z" fill="#B8325A" />
    </svg>
  );
}

export function SectionHead({
  eyebrow,
  dev,
  title,
  children,
  light = false,
}: {
  eyebrow?: string;
  dev?: string;
  title: ReactNode;
  children?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="section-head">
      {dev && (
        <p lang="hi" className="dev" style={light ? { color: "var(--gold-soft)" } : undefined}>
          {dev}
        </p>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h2">{title}</h2>
      <Divider />
      {children}
    </div>
  );
}

export function Sparkle({
  fill = "#E89A2C",
  stroke = "#B8325A",
}: {
  fill?: string;
  stroke?: string;
}) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />
    </svg>
  );
}

export function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}

/** Renders admin-edited text, showing words wrapped in *asterisks* in the rose accent colour. */
export function Highlight({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/).map((part, i) =>
    i % 2 ? (
      <span key={i} style={{ color: "var(--rose)" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Sets the minimum column width used by `.grid-auto` / `.grid-fill`. */
export function minCol(px: number, extra?: CSSProperties): CSSProperties {
  return { "--min": `${px}px`, ...extra } as CSSProperties;
}
