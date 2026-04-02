"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "default" | "small";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--color-primary)",
    color: "#fff",
    border: "none",
    boxShadow: "var(--shadow-button)",
  },
  secondary: {
    background: "transparent",
    color: "var(--color-text)",
    border: "1.5px solid var(--color-text)",
    boxShadow: "none",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-primary)",
    border: "none",
    boxShadow: "none",
  },
  destructive: {
    background: "var(--color-error)",
    color: "#fff",
    border: "none",
    boxShadow: "none",
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  default: {
    padding: "var(--space-md) var(--space-xl)",
    fontSize: "var(--text-button)",
  },
  small: {
    padding: "10px 24px",
    fontSize: "var(--text-nav)",
  },
};

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "default",
    loading = false,
    children,
    ...rest
  } = props;

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-sm)",
    borderRadius: "var(--radius-pill)",
    fontFamily: "var(--font-body)",
    fontWeight: variant === "ghost" ? 400 : 500,
    textDecoration: "none",
    cursor: loading ? "wait" : "pointer",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
    opacity: (rest as ButtonAsButton).disabled ? 0.5 : 1,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const spinner = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="8"
        opacity="0.7"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, loading: _l, ...linkRest } = props as ButtonAsLink;
    return (
      <a href={href} style={baseStyle} {...linkRest}>
        {loading ? spinner : children}
      </a>
    );
  }

  const { variant: _v, size: _s, loading: _l, ...btnRest } = rest as Omit<ButtonAsButton, "children">;
  return (
    <button
      type="button"
      style={baseStyle}
      disabled={loading || (rest as ButtonAsButton).disabled}
      {...btnRest}
    >
      {loading ? spinner : children}
    </button>
  );
}
