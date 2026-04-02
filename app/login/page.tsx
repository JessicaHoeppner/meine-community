"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import AuthLayout from "@/src/components/ui/AuthLayout";
import { Alert } from "@/src/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("E-Mail oder Passwort ist falsch.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthLayout
      overline="Willkommen zurück"
      headline="Einloggen"
      description="Melde dich mit deinen Zugangsdaten an."
      footer={
        <>
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="auth-link">
            Registrieren
          </Link>
        </>
      }
    >
      {error && (
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* E-Mail */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
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

        {/* Passwort */}
        <div style={{ marginBottom: "var(--space-sm)" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: "var(--color-text)",
              marginBottom: "var(--space-sm)",
            }}
          >
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            placeholder="••••••••"
          />
        </div>

        {/* Passwort vergessen */}
        <div
          style={{
            textAlign: "right",
            marginBottom: "var(--space-xl)",
          }}
        >
          <Link
            href="/passwort-vergessen"
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-muted)")
            }
          >
            Passwort vergessen?
          </Link>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Wird eingeloggt…" : "Einloggen"}
        </button>
      </form>
    </AuthLayout>
  );
}
