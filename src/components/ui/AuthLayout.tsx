"use client";

import type { ReactNode } from "react";

interface AuthLayoutProps {
  /** Kleiner Übertitel über der Headline */
  overline: string;
  /** Headline (wird kursiv dargestellt) */
  headline: string;
  /** Beschreibungstext */
  description: string;
  /** Formular-Inhalt */
  children: ReactNode;
  /** Footer-Bereich (z.B. "Schon ein Konto? Login") */
  footer?: ReactNode;
}

export default function AuthLayout({
  overline,
  headline,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-elevated)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 16px 80px",
        fontFamily: "var(--font-body)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Heading */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "var(--space-2xl)",
            maxWidth: "500px",
            width: "100%",
            padding: "0 16px",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-overline)",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              margin: "0 0 var(--space-lg)",
            }}
          >
            {overline}
          </p>

          <h1
            className="auth-headline"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-hero)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            <em style={{ fontStyle: "italic" }}>{headline}</em>
          </h1>

          <div
            style={{
              width: "36px",
              height: "1px",
              backgroundColor: "var(--color-primary)",
              margin: "var(--space-lg) auto",
              opacity: 0.4,
            }}
          />

          <p
            style={{
              fontSize: "var(--text-button)",
              fontWeight: 400,
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.75,
            }}
          >
            {description}
          </p>
        </div>

        {/* Form Card */}
        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-2xl) var(--space-xl)",
            boxShadow:
              "0 8px 60px rgba(60,44,36,0.09), 0 1px 8px rgba(60,44,36,0.04)",
          }}
        >
          {children}

          {footer && (
            <div
              style={{
                marginTop: "var(--space-xl)",
                paddingTop: "var(--space-lg)",
                borderTop: "1px solid var(--color-border)",
                textAlign: "center",
                fontSize: "var(--text-caption)",
                color: "var(--color-text-muted)",
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
