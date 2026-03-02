export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "#F5F2EE",
      }}
    >
      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "80px 24px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#2E2E2E",
          }}
        >
          Willkommen in deiner Community
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            marginBottom: "32px",
            color: "#6B6562",
          }}
        >
          Deine Plattform für Kurse, Austausch und Wachstum.
        </p>
        <a
          href="#"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: "#8B3A3A",
            color: "#FFFFFF",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Jetzt Mitglied werden
        </a>
      </main>
    </div>
  );
}