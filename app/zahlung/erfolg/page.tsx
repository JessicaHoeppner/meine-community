"use client";

import Link from "next/link";

export default function ZahlungErfolgPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#2E2E2E",
          }}
        >
          Willkommen! Deine Mitgliedschaft ist aktiv.
        </h1>
        <p style={{ color: "#6B6562", marginBottom: "20px", lineHeight: 1.6 }}>
          Du kannst jetzt alle Kurse und die Community nutzen.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "999px",
            backgroundColor: "#8B3A3A",
            color: "#FFFFFF",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          Zum Dashboard
        </Link>
      </div>
    </div>
  );
}
