"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');

        /* ── Autofill-Override: kein kaltes Browser-Blau ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #f7f1e8 inset !important;
          -webkit-text-fill-color: #3c2c24 !important;
          caret-color: #3c2c24;
          transition: background-color 9999s ease-in-out 0s;
        }

        /* ── Focus ── */
        .auth-input:focus {
          outline: none;
          border-color: #c9896e !important;
          box-shadow: 0 0 0 3px rgba(180,59,50,0.05) !important;
        }

        /* ── Hover ── */
        .auth-btn:hover  { background-color: #9f3129 !important; }
        .auth-link:hover { color: #b43b32 !important; }

        /* ── Paper grain ── */
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

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .login-headline { font-size: 40px !important; }
          .login-card     { padding: 36px 28px !important; border-radius: 24px !important; }
        }
      `}} />

      <div
        className="auth-grain"
        style={{
          minHeight: "100vh",
          backgroundColor: "#efe6dc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 16px 80px",
          fontFamily: "'Manrope', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Organische Hintergrund-Dekoration ── */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
          <svg style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "70%", opacity: 0.40 }}
            viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="250" cy="200" rx="250" ry="180" fill="#e8ddd0"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", opacity: 0.45 }}
            viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e8ddd0" d="M0,60 C360,140 720,20 1080,80 C1260,110 1380,60 1440,70 L1440,160 L0,160 Z"/>
          </svg>
          <svg style={{ position: "absolute", top: "5%", right: "-8%", width: "38%", height: "55%", opacity: 0.25 }}
            viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="175" rx="200" ry="155" fill="#ddd4c8"/>
          </svg>
        </div>

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Heading block */}
          <div style={{ textAlign: "center", marginBottom: "52px", maxWidth: "500px", width: "100%", padding: "0 16px" }}>

            {/* Eyebrow */}
            <p style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#b43b32",
              margin: "0 0 28px",
              opacity: 0.9,
            }}>
              Willkommen zurück
            </p>

            {/* H1 */}
            <h1
              className="login-headline"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "56px",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "0.01em",
                color: "#3c2c24",
                margin: 0,
              }}
            >
              <em style={{ fontStyle: "italic" }}>Einloggen</em>
            </h1>

            {/* Divider */}
            <div style={{
              width: "36px",
              height: "1px",
              backgroundColor: "#b43b32",
              margin: "24px auto 24px",
              opacity: 0.4,
            }} />

            {/* Subtext */}
            <p style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#7a6d65",
              margin: 0,
              lineHeight: 1.75,
              letterSpacing: "0.01em",
            }}>
              Melde dich mit deinen Zugangsdaten an.
            </p>
          </div>

          {/* Form card */}
          <div
            className="login-card"
            style={{
              width: "100%",
              maxWidth: "440px",
              backgroundColor: "#fbf8f4",
              border: "1px solid rgba(60,44,36,0.06)",
              borderRadius: "32px",
              padding: "52px 44px 44px",
              boxShadow: "0 8px 60px rgba(60,44,36,0.09), 0 1px 8px rgba(60,44,36,0.04)",
            }}
          >
            {error && (
              <div style={{
                marginBottom: "24px",
                padding: "13px 16px",
                borderRadius: "12px",
                backgroundColor: "#fce9e9",
                border: "1px solid rgba(180,59,50,0.12)",
                color: "#b43b32",
                fontSize: "14px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                lineHeight: 1.55,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* E-Mail */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="email" style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  color: "#a89c94",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                }}>
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="auth-input"
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    borderRadius: "14px",
                    border: "1px solid #ddd5c6",
                    fontSize: "15px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    backgroundColor: "#f7f1e8",
                    color: "#3c2c24",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  placeholder="deine@email.de"
                />
              </div>

              {/* Passwort */}
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="password" style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  color: "#a89c94",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                }}>
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="auth-input"
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    borderRadius: "14px",
                    border: "1px solid #ddd5c6",
                    fontSize: "15px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    backgroundColor: "#f7f1e8",
                    color: "#3c2c24",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  placeholder="••••••••"
                />
              </div>

              {/* Passwort vergessen */}
              <div style={{ textAlign: "right", marginBottom: "32px", marginTop: "10px" }}>
                <a
                  href="/passwort-vergessen"
                  className="auth-link"
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    color: "#b3a89e",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    letterSpacing: "0.02em",
                  }}
                >
                  Passwort vergessen?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="auth-btn"
                style={{
                  width: "100%",
                  padding: "17px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: "#b43b32",
                  color: "#ffffff",
                  fontWeight: 500,
                  fontSize: "15px",
                  letterSpacing: "0.04em",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.72 : 1,
                  transition: "background-color 0.2s ease",
                }}
              >
                {loading ? "Wird eingeloggt…" : "Einloggen"}
              </button>
            </form>

            {/* Bottom link */}
            <div style={{
              marginTop: "36px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(60,44,36,0.05)",
              textAlign: "center",
              fontSize: "13px",
              fontFamily: "'Manrope', system-ui, sans-serif",
              color: "#a89c94",
              letterSpacing: "0.01em",
            }}>
              Noch kein Konto?{" "}
              <Link
                href="/registrieren"
                className="auth-link"
                style={{
                  color: "#b43b32",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s ease",
                }}
              >
                Registrieren
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
