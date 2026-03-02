"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(
      "Wenn ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zuruecksetzen gesendet."
    );
    setEmail("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "32px 24px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.06)",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "8px",
            color: "#2E2E2E",
          }}
        >
          Passwort vergessen
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#6B6562",
            marginBottom: "20px",
          }}
        >
          Gib deine E-Mail-Adresse ein, um einen Link zum Zuruecksetzen zu
          erhalten.
        </p>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              fontSize: "0.9rem",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 500,
                marginBottom: "6px",
                color: "#2E2E2E",
              }}
            >
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #D4CFC7",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#8B3A3A",
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "0.95rem",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.8 : 1,
              marginBottom: "14px",
            }}
          >
            {loading
              ? "Wird gesendet..."
              : "Link zum Zuruecksetzen senden"}
          </button>
        </form>

        <div
          style={{
            fontSize: "0.9rem",
            color: "#6B6562",
          }}
        >
          <Link
            href="/login"
            style={{
              color: "#8B3A3A",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Zurueck zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}

