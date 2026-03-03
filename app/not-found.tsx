import Link from "next/link";

export default function NotFound() {
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
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#2E2E2E",
          }}
        >
          Diese Seite wurde nicht gefunden
        </h1>
        <p style={{ color: "#6B6562", marginBottom: "24px", lineHeight: 1.6 }}>
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
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
          Zurueck zur Startseite
        </Link>
      </div>
    </div>
  );
}
