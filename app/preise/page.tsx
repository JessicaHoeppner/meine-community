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
    period: "Euro / Monat",
    popular: false,
  },
  {
    id: "jaehrlich",
    name: "Jaehrlich",
    price: "249",
    period: "Euro / Jahr",
    popular: true,
  },
  {
    id: "einmalig",
    name: "Einmalig",
    price: "199",
    period: "Euro einmalig",
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "48px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "8px",
            color: "#2E2E2E",
            textAlign: "center",
          }}
        >
          Preise
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#6B6562",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Waehle deine Mitgliedschaft.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E4E0",
                borderRadius: "16px",
                padding: "24px",
                position: "relative",
                borderColor: plan.popular ? "#8B3A3A" : "#E8E4E0",
                borderWidth: plan.popular ? "2px" : "1px",
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#8B3A3A",
                    color: "#FFFFFF",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: "999px",
                  }}
                >
                  Beliebteste Wahl
                </div>
              )}
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#2E2E2E",
                  marginBottom: "8px",
                }}
              >
                {plan.name}
              </div>
              <div style={{ marginBottom: "4px" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#2E2E2E" }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: "0.95rem", color: "#6B6562", marginLeft: "4px" }}>
                  {plan.period}
                </span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 20px 0" }}>
                {FEATURES.map((f) => (
                  <li
                    key={f}
                    style={{
                      color: "#6B6562",
                      fontSize: "0.95rem",
                      marginBottom: "8px",
                      paddingLeft: "20px",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "#8B3A3A",
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleCheckout(plan.id)}
                disabled={!!loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#8B3A3A",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading === plan.id ? 0.8 : 1,
                }}
              >
                {loading === plan.id ? "Wird geladen..." : "Jetzt buchen"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
