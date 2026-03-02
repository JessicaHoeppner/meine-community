"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

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

  const cardStyle = useMemo(
    () => ({
      backgroundColor: "#FFFFFF",
      border: "1px solid #E8E4E0",
      borderRadius: "16px",
      padding: "20px",
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
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard/community");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ marginBottom: "14px" }}>
          <Link
            href="/dashboard/community"
            style={{
              color: "#8B3A3A",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            ← Zurueck zum Feed
          </Link>
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#2E2E2E",
          }}
        >
          Neuer Beitrag
        </h1>

        {error ? (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              fontSize: "0.9rem",
              marginBottom: "12px",
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="titel"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "#2E2E2E",
                }}
              >
                Titel
              </label>
              <input
                id="titel"
                type="text"
                value={titel}
                onChange={(ev) => setTitel(ev.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #E8E4E0",
                  fontSize: "0.95rem",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="inhalt"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "#2E2E2E",
                }}
              >
                Inhalt
              </label>
              <textarea
                id="inhalt"
                value={inhalt}
                onChange={(ev) => setInhalt(ev.target.value)}
                rows={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #E8E4E0",
                  fontSize: "0.95rem",
                  backgroundColor: "#FFFFFF",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 16px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#8B3A3A",
                color: "#FFFFFF",
                fontWeight: 500,
                fontSize: "0.95rem",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.85 : 1,
              }}
            >
              {saving ? "Speichere..." : "Veroeffentlichen"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

