import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  /** Klickbare Cards erhalten Hover-Effekt */
  clickable?: boolean;
  /** Volle Höhe (z.B. in Grid-Layouts) */
  fullHeight?: boolean;
  /** Custom padding überschreiben */
  padding?: string;
  /** Zusätzliche Styles */
  style?: CSSProperties;
  /** Zusätzliche className */
  className?: string;
}

export default function Card({
  children,
  clickable = false,
  fullHeight = false,
  padding,
  style,
  className = "",
}: CardProps) {
  const baseStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    padding: padding ?? "var(--space-xl)",
    boxShadow: "var(--shadow-card)",
    border: "1px solid var(--color-border)",
    display: "flex",
    flexDirection: "column",
    ...(fullHeight ? { flex: 1 } : {}),
    ...(clickable
      ? {
          cursor: "pointer",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        }
      : {}),
    ...style,
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={
        clickable
          ? (e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
              e.currentTarget.style.borderColor = "var(--color-border-strong)";
            }
          : undefined
      }
      onMouseLeave={
        clickable
          ? (e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-card)";
              e.currentTarget.style.borderColor = "var(--color-border)";
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
