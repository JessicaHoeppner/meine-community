"use client";

export default function Home() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');

            *, *::before, *::after { box-sizing: border-box; }

            /* ── Hover: CTA-Button ── */
            .cta-primary:hover {
              background-color: #9f3129 !important;
            }
            .cta-secondary:hover {
              border-color: #b43b32 !important;
              color: #b43b32 !important;
            }

            /* ── Hover: roter Rand + roter Titel ── */
            .feature-card:hover,
            .feature-card-center:hover {
              border-color: #b43b32 !important;
            }
            .feature-card:hover .card-title,
            .feature-card-center:hover .card-title {
              color: #b43b32 !important;
            }

            /* ── Logo: elegant italic serif ── */
            nav > div:first-child {
              font-style: italic !important;
              font-family: "Cormorant Garamond", Georgia, serif !important;
              font-weight: 400 !important;
              font-size: 1.25rem !important;
              letter-spacing: 0.03em !important;
              color: #3c2c24 !important;
            }

            /* ── Layout-Footer ausblenden (eigener Footer in page) ── */
            body > footer {
              display: none !important;
            }

            /* ── Paper-grain overlay ── */
            .grain-overlay::after {
              content: '';
              position: absolute;
              inset: 0;
              pointer-events: none;
              z-index: 2;
              opacity: 0.018;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
              background-size: 256px 256px;
            }

            /* ── Responsive ── */
            @media (max-width: 900px) {
              .hero-headline { font-size: 52px !important; }
            }
            @media (max-width: 640px) {
              .hero-headline { font-size: 38px !important; line-height: 1.25 !important; }
              .hero-section  { padding-top: 80px !important; padding-bottom: 72px !important; }
              .cards-row     { flex-direction: column !important; align-items: stretch !important; }
              .feature-card,
              .feature-card-center {
                width: 100% !important;
              }
              .cards-section { padding-top: 72px !important; padding-bottom: 72px !important; }
              .section-eyebrow { font-size: 11px !important; }
              .section-h2  { font-size: 30px !important; }
            }
          `,
        }}
      />

      {/* ════════════════════════════════════════
          PAGE WRAPPER
      ════════════════════════════════════════ */}
      <div
        style={{
          fontFamily: "'Manrope', system-ui, sans-serif",
          backgroundColor: "#f7f2ec",
          color: "#6f625b",
        }}
      >

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section
          className="hero-section grain-overlay"
          style={{
            backgroundColor: "#efe6dc",
            paddingTop: "140px",
            paddingBottom: "120px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Organische Hintergrund-Dekoration */}
          <div
            style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
            aria-hidden
          >
            {/* Große weiche Ellipse oben links */}
            <svg
              style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "70%", opacity: 0.45 }}
              viewBox="0 0 500 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="250" cy="200" rx="250" ry="180" fill="#e8ddd0"/>
            </svg>

            {/* Welle unten */}
            <svg
              style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%", opacity: 0.5 }}
              viewBox="0 0 1440 160"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#e8ddd0"
                d="M0,60 C360,140 720,20 1080,80 C1260,110 1380,60 1440,70 L1440,160 L0,160 Z"
              />
            </svg>

            {/* Kleine weiche Ellipse oben rechts */}
            <svg
              style={{ position: "absolute", top: "5%", right: "-8%", width: "38%", height: "55%", opacity: 0.3 }}
              viewBox="0 0 400 350"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="200" cy="175" rx="200" ry="155" fill="#ddd4c8"/>
            </svg>
          </div>

          {/* Hero Content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "720px",
              margin: "0 auto",
              padding: "0 32px",
            }}
          >
            {/* Eyebrow */}
            <p
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#b43b32",
                margin: "0 0 28px",
              }}
            >
              Für Menschen, die wirklich wachsen wollen
            </p>

            {/* H1 */}
            <h1
              className="hero-headline"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "72px",
                fontWeight: 300,
                lineHeight: 1.15,
                letterSpacing: "0.01em",
                color: "#3c2c24",
                margin: 0,
              }}
            >
              Wachse mit Menschen,<br />
              <em style={{ fontStyle: "italic" }}>die wirklich etwas aufbauen wollen!</em>
            </h1>

            {/* Divider */}
            <div
              style={{
                width: "48px",
                height: "1px",
                backgroundColor: "#b43b32",
                margin: "36px auto",
                opacity: 0.6,
              }}
            />

            {/* Subheadline */}
            <p
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                lineHeight: 1.75,
                color: "#6f625b",
                margin: 0,
                maxWidth: "480px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Kurse, ehrlicher Austausch und echte Unterstützung - gebündelt in einer wertvollen Community.
            </p>

            {/* CTA */}
            <div style={{ marginTop: "48px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="/registrieren"
                className="cta-primary"
                style={{
                  display: "inline-block",
                  backgroundColor: "#b43b32",
                  color: "#fff",
                  borderRadius: "50px",
                  padding: "17px 42px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  transition: "background-color 0.2s ease",
                }}
              >
                Jetzt Mitglied werden ›
              </a>
              <a
                href="#was-dich-erwartet"
                className="cta-secondary"
                style={{
                  display: "inline-block",
                  backgroundColor: "transparent",
                  color: "#3c2c24",
                  borderRadius: "50px",
                  border: "1px solid rgba(60,44,36,0.25)",
                  padding: "17px 42px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "15px",
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  transition: "border-color 0.2s ease, color 0.2s ease",
                }}
              >
                Mehr erfahren
              </a>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FEATURE-KARTEN
        ════════════════════════════════════════ */}
        <section
          id="was-dich-erwartet"
          className="cards-section"
          style={{
            backgroundColor: "#f7f2ec",
            padding: "120px 32px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Subtile tonale Trennung oben */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "rgba(60,44,36,0.07)",
            }}
            aria-hidden
          />

          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

            {/* Section Label */}
            <p
              className="section-eyebrow"
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#9b8f87",
                margin: "0 0 20px",
              }}
            >
              Was dich erwartet
            </p>

            {/* Section H2 */}
            <h2
              className="section-h2"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "42px",
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: "0.02em",
                color: "#3c2c24",
                marginTop: 0,
                marginBottom: "72px",
              }}
            >
              Alles, was du brauchst,<br />
              <em style={{ fontStyle: "italic" }}>an einem Ort.</em>
            </h2>

            {/* Cards */}
            <div
              className="cards-row"
              style={{
                display: "flex",
                gap: "24px",
                maxWidth: "980px",
                margin: "0 auto",
                alignItems: "flex-start",
              }}
            >

              {/* ── Karte: Lerne mit Struktur ── */}
              <div
                className="feature-card"
                style={{
                  flex: 1,
                  backgroundColor: "#fbf8f5",
                  border: "1px solid rgba(60,44,36,0.08)",
                  borderRadius: "24px",
                  padding: "36px 32px",
                  textAlign: "left",
                  boxShadow: "0 2px 16px rgba(60,44,36,0.05)",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(160,120,92,0.10)", flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M14 7 C11.5 5.5 8 5.5 5.5 7 L5.5 22 C8 20.5 11.5 20.5 14 22 C16.5 20.5 20 20.5 22.5 22 L22.5 7 C20 5.5 16.5 5.5 14 7 Z" fill="#a0785c"/>
                      <line x1="14" y1="7" x2="14" y2="22" stroke="#efe6dc" strokeWidth="1.2"/>
                    </svg>
                  </div>
                  <h3 className="card-title" style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "17px", fontWeight: 600, letterSpacing: "0.01em", color: "#3c2c24", margin: 0, transition: "color 0.2s ease" }}>
                    Lerne mit Struktur
                  </h3>
                </div>
                <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "15px", fontWeight: 400, color: "#6f625b", lineHeight: 1.75, margin: 0 }}>
                  Entwickle dich in strukturierten Online-Kursen in deinem Tempo weiter.
                </p>
              </div>

              {/* ── Karte: Finde Gleichgesinnte ── */}
              <div
                className="feature-card-center"
                style={{
                  flex: 1,
                  backgroundColor: "#fbf8f5",
                  border: "1px solid rgba(60,44,36,0.08)",
                  borderRadius: "24px",
                  padding: "36px 32px",
                  textAlign: "left",
                  boxShadow: "0 4px 24px rgba(60,44,36,0.08)",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(160,120,92,0.10)", flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M6 18V9C6 7.9 6.9 7 8 7L20 7C21.1 7 22 7.9 22 9L22 15C22 16.1 21.1 17 20 17L9 17L6 21Z" fill="#a0785c"/>
                      <circle cx="11" cy="12" r="1.2" fill="#efe6dc"/>
                      <circle cx="14" cy="12" r="1.2" fill="#efe6dc"/>
                      <circle cx="17" cy="12" r="1.2" fill="#efe6dc"/>
                    </svg>
                  </div>
                  <h3 className="card-title" style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "17px", fontWeight: 600, letterSpacing: "0.01em", color: "#3c2c24", margin: 0, transition: "color 0.2s ease" }}>
                    Finde Gleichgesinnte
                  </h3>
                </div>
                <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "15px", fontWeight: 400, color: "#6f625b", lineHeight: 1.75, margin: 0 }}>
                  Tausche dich aus und vernetze dich mit Menschen, die ähnliche Ziele haben.
                </p>
              </div>

              {/* ── Karte: Erhalte Unterstützung ── */}
              <div
                className="feature-card"
                style={{
                  flex: 1,
                  backgroundColor: "#fbf8f5",
                  border: "1px solid rgba(60,44,36,0.08)",
                  borderRadius: "24px",
                  padding: "36px 32px",
                  textAlign: "left",
                  boxShadow: "0 2px 16px rgba(60,44,36,0.05)",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(160,120,92,0.10)", flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M14 4C9.6 4 6 7.6 6 12L6 18C6 18.9 6.7 19.6 7.5 19.6L9.8 19.6C10.6 19.6 11.3 18.9 11.3 18.1L11.3 15.2C11.3 14.4 10.6 13.7 9.8 13.7L7.5 13.7L7.5 12C7.5 8.4 10.4 5.5 14 5.5C17.6 5.5 20.5 8.4 20.5 12L20.5 13.7L18.2 13.7C17.4 13.7 16.7 14.4 16.7 15.2L16.7 18.1C16.7 18.9 17.4 19.6 18.2 19.6L20.5 19.6C21.3 19.6 22 18.9 22 18L22 12C22 7.6 18.4 4 14 4Z" fill="#a0785c"/>
                    </svg>
                  </div>
                  <h3 className="card-title" style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "17px", fontWeight: 600, letterSpacing: "0.01em", color: "#3c2c24", margin: 0, transition: "color 0.2s ease" }}>
                    Erhalte Unterstützung
                  </h3>
                </div>
                <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "15px", fontWeight: 400, color: "#6f625b", lineHeight: 1.75, margin: 0 }}>
                  Hol dir ehrliches Feedback und Support - von Mentor:innen und der Community.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════ */}
        <footer
          style={{
            backgroundColor: "#efe6dc",
            padding: "44px 32px",
            textAlign: "center",
            borderTop: "1px solid rgba(60,44,36,0.07)",
          }}
        >
          <p
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: "#9b8f87",
              margin: 0,
            }}
          >
            © 2026 Meine Community. Alle Rechte vorbehalten.
          </p>
        </footer>

      </div>
    </>
  );
}
