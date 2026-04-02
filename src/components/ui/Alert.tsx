import type { ReactNode, CSSProperties } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  /** Schließbar? */
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: CSSProperties;
}

const variantConfig: Record<
  AlertVariant,
  { borderColor: string; background: string; icon: ReactNode }
> = {
  info: {
    borderColor: "var(--color-primary)",
    background: "rgba(180, 59, 50, 0.04)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  success: {
    borderColor: "var(--color-success)",
    background: "rgba(47, 133, 90, 0.04)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  warning: {
    borderColor: "var(--color-warning)",
    background: "rgba(200, 138, 46, 0.04)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  error: {
    borderColor: "var(--color-error)",
    background: "rgba(197, 48, 48, 0.04)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

export default function Alert({
  variant = "info",
  children,
  dismissible = false,
  onDismiss,
  style,
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-sm)",
        borderRadius: "var(--radius-md)",
        borderLeft: `3px solid ${config.borderColor}`,
        background: config.background,
        padding: "var(--space-md) var(--space-lg)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-body-sm)",
        lineHeight: 1.6,
        color: "var(--color-text)",
        ...style,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: "1px" }}>{config.icon}</div>
      <div style={{ flex: 1 }}>{children}</div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Schließen"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: "var(--color-text-muted)",
            flexShrink: 0,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
