export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "#F5F2EE",
        padding: "64px 16px",
      }}
    >
      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "40px 16px",
        }}
      >
        <h1
          style={{
            fontSize: "2.75rem",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#2E2E2E",
          }}
        >
          Deine Community fuer Wachstum
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            marginBottom: "40px",
            color: "#6B6562",
          }}
        >
          Kurse, Austausch und Support - alles an einem Ort.
        </p>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {[
            {
              title: "Kurse",
              description:
                "Lerne in deinem Tempo mit strukturierten Online-Kursen.",
            },
            {
              title: "Community",
              description:
                "Tausche dich mit Gleichgesinnten aus und wachse gemeinsam.",
            },
            {
              title: "Support",
              description:
                "Erhalte Unterstuetzung von Mentor:innen und der Community.",
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: "#FAF7F3",
                border: "1px solid #E8E4E0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#2E2E2E",
                }}
              >
                {card.title}
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#6B6562",
                  lineHeight: 1.6,
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <a
          href="#"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            borderRadius: "999px",
            backgroundColor: "#8B3A3A",
            color: "#FFFFFF",
            textDecoration: "none",
            fontWeight: 500,
            fontSize: "1rem",
          }}
        >
          Jetzt Mitglied werden
        </a>
      </main>
    </div>
  );
}