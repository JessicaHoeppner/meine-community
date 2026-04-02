"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type Gruppe = { id: string; name: string };

export default function CommunityNeuPage() {
  return (
    <AuthGuard>
      <CommunityNeuInner />
    </AuthGuard>
  );
}

function CommunityNeuInner() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titel, setTitel] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [gruppenId, setGruppenId] = useState<string>("");
  const [meineGruppen, setMeineGruppen] = useState<Gruppe[]>([]);

  useEffect(() => {
    const loadGruppen = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      const { data } = await supabase
        .from("gruppen_mitglieder")
        .select("gruppen_id, gruppen(id, name)")
        .eq("nutzer_id", user.id);
      if (data) {
        const gruppen = data
          .map((m: { gruppen_id: string; gruppen: { id: string; name: string } | null }) => m.gruppen)
          .filter(Boolean) as Gruppe[];
        setMeineGruppen(gruppen);
      }
    };
    loadGruppen();
  }, []);

  const cardStyle = useMemo(
    () => ({
      backgroundColor: "#fbf8f4",
      border: "1px solid rgba(60,44,36,0.07)",
      borderRadius: "28px",
      padding: "44px 40px 36px",
      boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
    }),
    []
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titel.trim()) {
      setError("Bitte gib einen Titel ein.");
      return;
    }
    if (!inhalt.trim()) {
      setError("Bitte gib einen Inhalt ein.");
      return;
    }

    setSaving(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setSaving(false);
      setError(userError.message);
      return;
    }
    const user = userData.user;
    if (!user) {
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      autor_id: user.id,
      titel: titel.trim(),
      inhalt: inhalt.trim(),
      gruppen_id: gruppenId || null,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard/community");
  };

  return (
<main style={{ position: "relative", zIndex: 1, maxWidth: "680px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Zurück */}
          <div style={{ marginBottom: "32px" }}>
            <Link href="/dashboard/community" className="back-link" style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-primary)",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "14px",
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}>
              ← Zurück zum Feed
            </Link>
          </div>

          {/* Intro */}
          <div style={{ marginBottom: "40px" }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              margin: "0 0 20px",
              opacity: 0.85,
            }}>
              Community
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "46px",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              color: "var(--color-text)",
              margin: 0,
            }}>
              <em style={{ fontStyle: "italic" }}>Neuer Beitrag</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "20px 0 18px", opacity: 0.4 }} />
            <p style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "#7a6d65",
              lineHeight: 1.75,
            }}>
              Teile deine Gedanken mit der Community.
            </p>
          </div>

          {error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px", marginBottom: "24px" }}>
              {error}
            </div>
          ) : null}

          <div style={cardStyle}>
            <form onSubmit={handleSubmit}>
              {/* Titel */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="titel" style={{
                  display: "block",
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  color: "var(--color-text-muted)",
                }}>
                  Titel
                </label>
                <input
                  id="titel"
                  type="text"
                  value={titel}
                  onChange={(ev) => setTitel(ev.target.value)}
                  className="auth-input"
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    borderRadius: "14px",
                    border: "1px solid var(--color-border-strong)",
                    fontSize: "15px",
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--color-text)",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  placeholder="Worum geht es?"
                />
              </div>

              {/* Gruppe */}
              {meineGruppen.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="gruppe" style={{
                    display: "block",
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                    color: "var(--color-text-muted)",
                  }}>
                    In welcher Gruppe posten?
                  </label>
                  <select
                    id="gruppe"
                    value={gruppenId}
                    onChange={(e) => setGruppenId(e.target.value)}
                    className="auth-input"
                    style={{
                      width: "100%",
                      padding: "15px 18px",
                      borderRadius: "14px",
                      border: "1px solid var(--color-border-strong)",
                      fontSize: "15px",
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--color-text)",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      appearance: "auto",
                    }}
                  >
                    <option value="">Keine Gruppe</option>
                    {meineGruppen.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Inhalt */}
              <div style={{ marginBottom: "32px" }}>
                <label htmlFor="inhalt" style={{
                  display: "block",
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  color: "var(--color-text-muted)",
                }}>
                  Inhalt
                </label>
                <textarea
                  id="inhalt"
                  value={inhalt}
                  onChange={(ev) => setInhalt(ev.target.value)}
                  rows={8}
                  className="auth-textarea"
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    borderRadius: "14px",
                    border: "1px solid var(--color-border-strong)",
                    fontSize: "15px",
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--color-text)",
                    resize: "vertical",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    lineHeight: 1.7,
                  }}
                  placeholder="Schreibe deinen Beitrag…"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="submit-btn"
                style={{
                  padding: "17px 36px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "15px",
                  letterSpacing: "0.04em",
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.72 : 1,
                  transition: "background-color 0.2s ease",
                }}
              >
                {saving ? "Speichere…" : "Veröffentlichen"}
              </button>
            </form>
          </div>
        </main>
  );
}