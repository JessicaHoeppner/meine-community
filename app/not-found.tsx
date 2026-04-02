import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ textAlign: "center", maxWidth: "480px", width: "100%", backgroundColor: "var(--bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "52px 44px 44px", boxShadow: "var(--shadow-dropdown)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "72px", fontWeight: 300, lineHeight: 1, color: "var(--color-primary)", margin: "0 0 4px" }}>
          404
        </div>
        <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "20px auto 22px", opacity: 0.4 }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 300, lineHeight: 1.25, color: "var(--color-text)", margin: "0 0 16px" }}>
          <em style={{ fontStyle: "italic" }}>Diese Seite wurde nicht gefunden</em>
        </h1>
        <p style={{ fontSize: "var(--text-button)", color: "var(--color-text-secondary)", lineHeight: 1.75, margin: "0 0 36px" }}>
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link href="/" className="btn-primary" style={{ display: "inline-block" }}>
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
