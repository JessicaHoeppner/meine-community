"use client";

import { useState } from "react";

const FEATURES = [
  "Zugang zu allen Kursen",
  "Community",
  "Support",
];

const PLANS = [
  {
    id: "monatlich",
    name: "Monatlich",
    price: "29",
    period: "/ Monat",
    popular: false,
  },
  {
    id: "jaehrlich",
    name: "Jährlich",
    price: "249",
    period: "/ Jahr",
    popular: true,
  },
  {
    id: "einmalig",
    name: "Einmalig",
    price: "199",
    period: "einmalig",
    popular: false,
  },
] as const;

export default function PreisePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preisTyp: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error) alert(data.error);
    } catch (e) {
      alert("Fehler beim Starten der Zahlung.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000&family=Manrope:wght@400;500;600&display=swap');

        .price-card:hover {
          border-color: rgba(180,59,50,0.35) !important;
          box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important;
        }
        .btn-outlined:hover:not(:disabled) {
          background-color: #b43b32 !important;
          color: #ffffff !important;
          border-color: #b43b32 !important;
        }
        .btn-filled:hover:not(:disabled) { background-color: #9f3129 !important; }

        .auth-grain::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.016;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }

        @media (max-width: 720px) {
          .plans-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      <div
        className="auth-grain"
        style={{
          minHeight: "100vh",
          backgroundColor: "#efe6dc",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        {/* Organische Hintergrund-Dekoration — identisch mit Dashboard */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
          <svg style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "70%", opacity: 0.38 }}
            viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="250" cy="200" rx="250" ry="180" fill="#e8ddd0"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", opacity: 0.40 }}
            viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e8ddd0" d="M0,60 C360,140 720,20 1080,80 C1260,110 1380,60 1440,70 L1440,160 L0,160 Z"/>
          </svg>
          <svg style={{ position: "absolute", top: "5%", right: "-8%", width: "38%", height: "55%", opacity: 0.22 }}
            viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="175" rx="200" ry="155" fill="#ddd4c8"/>
          </svg>
        </div>

        <main
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "960px",
            margin: "0 auto",
            padding: "80px 24px 100px",
          }}
        >
          {/* Intro — identisches Pattern wie Dashboard */}
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#b43b32",
              margin: "0 0 22px",
              opacity: 0.85,
            }}>
              Wähle deinen Weg
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "52px",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              color: "#3c2c24",
              margin: 0,
            }}>
              <em style={{ fontStyle: "italic" }}>Mitgliedschaft</em>
            </h1>
            <div style={{
              width: "36px",
              height: "1px",
              backgroundColor: "#b43b32",
              margin: "22px auto 20px",
              opacity: 0.4,
            }} />
            <p style={{
              margin: 0,
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#7a6d65",
              lineHeight: 1.75,
              letterSpacing: "0.01em",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
            }}>
              Wähle die Mitgliedschaft, die zu deinem Tempo passt.
            </p>
          </div>

          {/* Plans grid */}
          <div
            className="plans-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              alignItems: "stretch",
            }}
          >
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="price-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  backgroundColor: "#fbf8f4",
                  border: plan.popular
                    ? "3px solid #b43b32"
                    : "1px solid rgba(60,44,36,0.07)",
                  borderRadius: "28px",
                  padding: "40px 32px 32px",
                  boxSizing: "border-box",
                  boxShadow: plan.popular
                    ? "0 4px 32px rgba(60,44,36,0.10), 0 1px 4px rgba(60,44,36,0.05)"
                    : "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  transform: plan.popular ? "scale(1.05)" : undefined,
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#b43b32",
                    color: "#ffffff",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "4px 16px",
                    borderRadius: "50px",
                    whiteSpace: "nowrap",
                  }}>
                    Beliebteste Wahl
                  </div>
                )}

                {/* Plan name */}
                <div style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: "13px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "#9b8f87",
                  marginBottom: "4px",
                }}>
                  {plan.name}
                </div>

                {/* Preis: Zahl 48px + € 20px auf gleicher Baseline, darunter Periodentext */}
                <div style={{ marginBottom: "4px" }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "48px",
                    fontWeight: 300,
                    color: "#3c2c24",
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                  }}>
                    {plan.price}
                  </span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 300,
                    color: "#3c2c24",
                    verticalAlign: "baseline",
                  }}>
                    {" €"}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "14px",
                  color: "#6f625b",
                  marginBottom: "28px",
                  letterSpacing: "0.01em",
                }}>
                  {plan.period}
                </div>

                {/* Trennlinie */}
                <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "20px" }} />

                {/* Feature list */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", flexGrow: 1 }}>
                  {FEATURES.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        color: "#6f625b",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        marginBottom: "10px",
                        paddingLeft: "20px",
                        position: "relative",
                      }}
                    >
                      <span style={{ position: "absolute", left: 0, color: "#b43b32", fontWeight: 600 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  type="button"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={!!loading}
                  className={plan.popular ? "btn-filled" : "btn-outlined"}
                  style={{
                    width: "100%",
                    padding: "15px 16px",
                    borderRadius: "50px",
                    border: plan.popular ? "none" : "2px solid #b43b32",
                    backgroundColor: plan.popular ? "#b43b32" : "transparent",
                    color: plan.popular ? "#ffffff" : "#b43b32",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    letterSpacing: "0.04em",
                    cursor: loading ? "default" : "pointer",
                    opacity: loading === plan.id ? 0.72 : 1,
                    transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                    marginTop: "auto",
                  }}
                >
                  {loading === plan.id ? "Wird geladen…" : "Jetzt buchen"}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
