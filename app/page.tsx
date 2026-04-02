"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const ctaHref = isAuthenticated ? "/preise" : "/registrieren";

  return (
    <div style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--bg-primary)", color: "var(--color-text)" }}>

      {/* ════════════════════════════════════════
          § 1  HERO – Zentriert mit Glow-Orbs
      ════════════════════════════════════════ */}
      <section
        className="fade-up"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--bg-elevated)",
          padding: "80px var(--gutter)",
        }}
      >
        {/* Decorative glow orbs */}
        <div style={{ position: "absolute", top: "-80px", right: "-40px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255,206,206,0.19) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} aria-hidden />
        <div style={{ position: "absolute", bottom: "-40px", left: "-50px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(238,224,209,0.15) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} aria-hidden />
        <div style={{ position: "absolute", bottom: "20px", left: "40%", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(245,206,83,0.07) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} aria-hidden />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "700px",
            margin: "0 auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-overline)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
            }}
          >
            Von der Idee zur eigenen App
          </span>

          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "40px",
                fontWeight: 400,
                lineHeight: 1.15,
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Erschaffe digitale Meisterwerke.
            </h1>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "40px",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1.15,
                color: "var(--color-primary)",
                margin: 0,
              }}
            >
              Ohne eine Zeile Code.
            </h1>
          </div>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              maxWidth: "600px",
            }}
          >
            Du brauchst keine Programmierkenntnisse, um etwas Eigenes zu erschaffen.
            Mit KI an deiner Seite verwandelst du deine Ideen in Websites, Apps und digitale Produkte –
            klar, intuitiv und ohne technisches Vorwissen.
          </p>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
            }}
          >
            Ein Raum für dich und das, was du erschaffen möchtest.
            In deinem Tempo. Auf deine Weise.
          </p>

          <a
            href={ctaHref}
            className="cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--color-primary)",
              color: "#fff7f6",
              padding: "18px 36px",
              borderRadius: "16px",
              fontSize: "17px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.4s ease",
              marginTop: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(139,58,58,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Jetzt starten
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 2  DREI SÄULEN – Zentrierte Karten
      ════════════════════════════════════════ */}
      <section
        className="fade-up"
        style={{ padding: "var(--space-section) var(--gutter)" }}
      >
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
          className="pillars-grid"
        >
          {[
            {
              title: "Lernen",
              desc: "Klare, einfache Lektionen ohne Fachbegriffe. Du verstehst Schritt für Schritt, wie du KI für deine Ideen nutzt.",
              iconBg: "var(--color-primary-container)",
              iconColor: "var(--color-primary)",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ),
            },
            {
              title: "Vernetzen",
              desc: "Eine Community aus Machern wie dir. Stell Fragen, teile Erfolge und finde Menschen, die den gleichen Weg gehen.",
              iconBg: "var(--color-secondary-container)",
              iconColor: "var(--color-secondary)",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
            },
            {
              title: "Umsetzen",
              desc: "Bau deine eigene App oder dein digitales Produkt. Mit klarer Struktur, Vorlagen und persönlichem Support.",
              iconBg: "var(--color-tertiary-container)",
              iconColor: "var(--color-tertiary)",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
            },
          ].map(({ title, desc, iconBg, iconColor, icon }) => (
            <div
              key={title}
              className="fade-up pillar-card"
              tabIndex={0}
              style={{
                background: "var(--bg-card)",
                padding: "48px",
                borderRadius: "16px",
                textAlign: "center",
                transition: "box-shadow 0.4s ease, transform 0.4s ease",
                cursor: "pointer",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={(e) => {
                document.querySelectorAll(".pillar-card").forEach((el) => {
                  (el as HTMLElement).style.outline = "none";
                });
                e.currentTarget.style.outline = "2px solid var(--color-primary)";
                e.currentTarget.style.outlineOffset = "-2px";
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  color: iconColor,
                }}
              >
                {icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  fontStyle: "italic",
                  color: "var(--color-text)",
                  marginBottom: "16px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 3  PHILOSOPHIE – Zentriert
      ════════════════════════════════════════ */}
      <section
        id="philosophie"
        className="fade-up"
        style={{ padding: "0 var(--gutter) var(--space-section)" }}
      >
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            background: "var(--bg-elevated)",
            borderRadius: "16px",
            padding: "80px 48px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-overline)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              display: "block",
              marginBottom: "16px",
            }}
          >
            Warum Jessi&apos;s Vibe Coding
          </span>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "48px",
              fontWeight: 400,
              color: "var(--color-text)",
              marginBottom: "32px",
            }}
          >
            Dein Einstieg. Ohne Umwege.
          </h2>

          <p
            style={{
              fontSize: "18px",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: "800px",
              margin: "0 auto 48px",
            }}
          >
            Vergiss komplizierte Tutorials und endlose Tech-Kurse. Hier
            bekommst du einen klaren, ehrlichen Weg von der Idee zum fertigen
            Produkt. Kein leeres Versprechen – echte Ergebnisse, auch wenn du
            noch nie eine Zeile Code geschrieben hast.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              maxWidth: "800px",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            {[
              {
                icon: "✦",
                title: "Kein Vorwissen nötig",
                desc: "Du startest bei null. Wir erklären alles so, dass du es wirklich verstehst.",
              },
              {
                icon: "♡",
                title: "Echte Ergebnisse",
                desc: "Keine Theorie ohne Praxis. Du baust von Anfang an etwas Eigenes.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "18px",
                    color: "var(--color-primary)",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {icon}
                </span>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      marginBottom: "6px",
                    }}
                  >
                    {title}
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 4  KURS-TEASER – Icon-Karten
      ════════════════════════════════════════ */}
      <section className="fade-up" style={{ padding: "var(--space-section) var(--gutter)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "var(--space-md)",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "var(--text-overline)",
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Dein Lernpfad
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "40px",
                  fontWeight: 400,
                  color: "var(--color-text)",
                }}
              >
                Was dich erwartet
              </h2>
            </div>
            <a
              href={ctaHref}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                color: "var(--color-primary)",
                textDecoration: "none",
                transition: "opacity 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Alle Kurse entdecken
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
            className="learn-grid"
          >
            {[
              {
                title: "KI Grundlagen",
                desc: "Verstehe, was KI kann und wie du sie für deine Ideen einsetzt. Kein Vorwissen nötig.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                ),
              },
              {
                title: "Deine erste App",
                desc: "Bau Schritt für Schritt dein erstes digitales Produkt – mit KI als deinem Werkzeug.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
                  </svg>
                ),
              },
              {
                title: "Launch & Wachstum",
                desc: "Bring dein Projekt online und lerne, wie du damit Reichweite und Einkommen aufbaust.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                ),
              },
            ].map(({ title, desc, icon }) => (
              <div
                key={title}
                className="fade-up"
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "16px",
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  transition: "box-shadow 0.4s ease, transform 0.4s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(122,86,86,0.4)",
                  }}
                >
                  {icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "22px",
                      color: "var(--color-text)",
                      marginBottom: "8px",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {desc}
                  </p>
                </div>
                <div style={{ marginTop: "auto", paddingTop: "4px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "var(--bg-container)",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Members Only
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 5  ZITAT – Bild mit Overlay
      ════════════════════════════════════════ */}
      <section className="fade-up" style={{ padding: "0 var(--gutter) var(--space-section)" }}>
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            height: "500px",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1400&h=600&fit=crop"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 120px",
              gap: "24px",
            }}
          >
            <blockquote
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "36px",
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "#ffffff",
                textAlign: "center",
                maxWidth: "700px",
              }}
            >
              &ldquo;Du brauchst keine Erlaubnis, um etwas Gro&szlig;es zu
              bauen. Nur den ersten Schritt.&rdquo;
            </blockquote>
            <p
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              — Jessi&apos;s Vibe Coding
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 6  SOCIAL PROOF
      ════════════════════════════════════════ */}
      <section className="fade-up" style={{ padding: "var(--space-section) var(--gutter)" }}>
        <div style={{ maxWidth: "var(--max-width-narrow)", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "40px",
              fontWeight: 400,
              color: "var(--color-text)",
              marginBottom: "32px",
            }}
          >
            Schon 500+ Macher sind dabei
          </h2>

          {/* Avatar Stack */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-2xl)" }}>
            {["#eee0d1", "#ffcece", "#eae8e5", "#eee0d1"].map((bg, i) => (
              <div
                key={i}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: bg,
                  marginLeft: i === 0 ? "0" : "-12px",
                  border: "4px solid var(--bg-primary)",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              />
            ))}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "var(--color-primary-container)",
                marginLeft: "-12px",
                border: "4px solid var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--color-primary)",
              }}
            >
              +52
            </div>
          </div>

          {/* Testimonial Card */}
          <div
            style={{
              background: "var(--bg-card)",
              padding: "32px",
              borderRadius: "16px",
              maxWidth: "700px",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--color-secondary-container)",
                }}
              />
              <div>
                <p style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "15px" }}>
                  Marco K.
                </p>
                <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  Quereinsteiger, seit 3 Monaten dabei
                </p>
              </div>
            </div>
            <p
              style={{
                fontSize: "17px",
                fontStyle: "italic",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              &ldquo;Ich hatte null Ahnung von Technik. Heute habe ich meine
              eigene App gebaut und meine ersten Kunden gewonnen. H&auml;tte ich
              nie f&uuml;r m&ouml;glich gehalten.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 7  FINALER CTA
      ════════════════════════════════════════ */}
      <section className="fade-up" style={{ padding: "0 var(--gutter) var(--space-section)" }}>
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            background: "var(--color-primary)",
            borderRadius: "16px",
            padding: "80px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              left: "-80px",
              width: "320px",
              height: "320px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              filter: "blur(80px)",
              pointerEvents: "none",
            }}
            aria-hidden
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "48px",
                fontWeight: 400,
                color: "#fff7f6",
                lineHeight: 1.2,
                marginBottom: "32px",
              }}
            >
              Bereit, deine Idee Wirklichkeit werden zu lassen?
            </h2>

            <p
              style={{
                fontSize: "18px",
                color: "rgba(255,247,246,0.85)",
                lineHeight: 1.6,
                maxWidth: "600px",
                margin: "0 auto 32px",
              }}
            >
              Starte jetzt – ohne Vorkenntnisse, ohne Risiko. Dein erstes
              Projekt wartet auf dich.
            </p>

            <a
              href={ctaHref}
              style={{
                display: "inline-block",
                background: "#ffffff",
                color: "var(--color-primary)",
                padding: "20px 48px",
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Jetzt kostenlos starten
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "64px var(--gutter)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div
          className="footer-grid"
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "80px",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--color-primary)",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Jessi&apos;s Vibe Coding
            </span>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                maxWidth: "300px",
              }}
            >
              Deine Brücke zwischen Idee und Umsetzung.
              <br />
              Mit KI eigene Projekte bauen.
            </p>
          </div>
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--color-primary)",
                marginBottom: "16px",
                fontSize: "16px",
              }}
            >
              Entdecken
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[["Kurse", "/dashboard/kurse"], ["Community", "/dashboard/community"], ["Projekte", "/preise"]].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--color-primary)",
                marginBottom: "16px",
                fontSize: "16px",
              }}
            >
              Über uns
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[["Über Jessi", "#"], ["Anmelden", "/login"]].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--color-primary)",
                marginBottom: "16px",
                fontSize: "16px",
              }}
            >
              Rechtliches
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[["Privacy Policy", "#"], ["Terms of Service", "#"]].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "48px auto 0",
            paddingTop: "32px",
            borderTop: "1px solid var(--bg-container)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", opacity: 0.6 }}>
            © 2026 Jessi&apos;s Vibe Coding. Mit Herzblut gebaut.
          </p>
        </div>
      </footer>
    </div>
  );
}
