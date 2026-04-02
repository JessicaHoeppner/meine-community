"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import AuthLayout from "@/src/components/ui/AuthLayout";
import { Alert } from "@/src/components/ui";

export default function RegistrierenPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess("Registrierung erfolgreich! Bitte prüfe deine E-Mails.");
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "var(--text-body-sm)",
    fontWeight: 500,
    color: "var(--color-text)",
    marginBottom: "var(--space-sm)",
  };

  return (
    <AuthLayout
      overline="Jetzt Teil werden"
      headline="Registrieren"
      description="Erstelle dein Konto und werde Teil der Community."
      footer={
        <>
          Schon ein Konto?{" "}
          <Link href="/login" className="auth-link">
            Hier einloggen
          </Link>
        </>
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
        {/* Name */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label htmlFor="name" style={labelStyle}>
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="auth-input"
            placeholder="Dein Name"
          />
        </div>

        {/* E-Mail */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label htmlFor="email" style={labelStyle}>
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
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label htmlFor="password" style={labelStyle}>
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="auth-input"
            placeholder="Mindestens 8 Zeichen"
          />
          <p
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-xs)",
            }}
          >
            Mindestens 8 Zeichen
          </p>
        </div>

        {/* Passwort bestätigen */}
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <label htmlFor="passwordConfirm" style={labelStyle}>
            Passwort bestätigen
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={8}
            className="auth-input"
            placeholder="••••••••"
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Wird gesendet…" : "Registrieren"}
        </button>
      </form>
    </AuthLayout>
  );
}
