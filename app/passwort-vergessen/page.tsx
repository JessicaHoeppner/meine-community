"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import AuthLayout from "@/src/components/ui/AuthLayout";
import { Alert } from "@/src/components/ui";

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
      "Wenn ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet."
    );
    setEmail("");
  };

  return (
    <AuthLayout
      overline="Kein Problem"
      headline="Passwort vergessen"
      description="Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten."
      footer={
        <Link href="/login" className="auth-link">
          Zurück zum Login
        </Link>
      }
    >
      {error && (
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {success && (
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* E-Mail */}
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: "var(--color-text)",
              marginBottom: "var(--space-sm)",
            }}
          >
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
            placeholder="deine@email.de"
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Wird gesendet…" : "Link zum Zurücksetzen senden"}
        </button>
      </form>
    </AuthLayout>
  );
}
