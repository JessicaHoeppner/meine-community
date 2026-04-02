import type { ReactNode, CSSProperties } from "react";

interface EmptyStateProps {
  /** Icon (optional, z.B. SVG) */
  icon?: ReactNode;
  /** Headline */
  title: string;
  /** Beschreibung */
  description?: string;
  /** CTA-Element (z.B. Button oder Link) */
  action?: ReactNode;
  style?: CSSProperties;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "var(--space-2xl) var(--space-lg)",
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: "var(--space-md)",
            color: "var(--color-text-muted)",
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--color-text)",
          marginBottom: description ? "var(--space-sm)" : action ? "var(--space-lg)" : "0",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            maxWidth: "360px",
            marginBottom: action ? "var(--space-lg)" : "0",
          }}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
