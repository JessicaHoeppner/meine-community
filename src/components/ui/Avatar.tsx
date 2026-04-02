import type { CSSProperties } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  /** Bild-URL (optional – Fallback: Initialen) */
  src?: string | null;
  /** Name für Initialen-Fallback und alt-Text */
  name: string;
  /** Größe */
  size?: AvatarSize;
  /** Zusätzliche Styles */
  style?: CSSProperties;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

const fontSizeMap: Record<AvatarSize, string> = {
  xs: "10px",
  sm: "12px",
  md: "13px",
  lg: "18px",
  xl: "24px",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({ src, name, size = "md", style }: AvatarProps) {
  const px = sizeMap[size];

  const baseStyle: CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    ...style,
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          ...baseStyle,
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        background: "var(--bg-elevated)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-body)",
        fontSize: fontSizeMap[size],
        fontWeight: 600,
        color: "var(--color-text-secondary)",
      }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
