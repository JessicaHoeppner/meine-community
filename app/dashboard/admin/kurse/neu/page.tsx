"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ProfileRow = {
  id: string;
  rolle: string | null;
};

export default function AdminKursNeuPage() {
  return (
    <AuthGuard>
      <AdminKursNeuInner />
    </AuthGuard>
  );
}

function AdminKursNeuInner() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [bildUrl, setBildUrl] = useState("");
  const [veroeffentlicht, setVeroeffentlicht] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }
      const user = userData.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, rolle")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const role = (profile as ProfileRow | null)?.rolle ?? null;
      const admin = role?.toLowerCase() === "admin";
      setIsAdmin(admin);
      setLoading(false);
    };

    checkAdmin();
  }, []);

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

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("courses")
      .insert({
        titel: titel.trim(),
        beschreibung: beschreibung.trim() || null,
        bild_url: bildUrl.trim() || null,
        ersteller_id: user.id,
        veroeffentlicht,
      })
      .select("id")
      .maybeSingle();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    const id = (data as { id?: string } | null)?.id;
    if (id) {
      router.push(`/dashboard/admin/kurse/${id}`);
    } else {
      router.push("/dashboard/admin/kurse");
    }
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
            href="/dashboard/admin/kurse"
            style={{
              color: "#8B3A3A",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            ← Zurueck zu Admin-Kursen
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
          Neuen Kurs erstellen
        </h1>

        {loading ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>Laden...</div>
        ) : error ? (
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
        ) : !isAdmin ? (
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, color: "#2E2E2E", marginBottom: "8px" }}>
              Kein Zugriff
            </div>
            <Link
              href="/dashboard"
              style={{
                color: "#8B3A3A",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Zum Dashboard
            </Link>
          </div>
        ) : (
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

              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="beschreibung"
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#2E2E2E",
                  }}
                >
                  Beschreibung
                </label>
                <textarea
                  id="beschreibung"
                  value={beschreibung}
                  onChange={(ev) => setBeschreibung(ev.target.value)}
                  rows={4}
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

              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="bildUrl"
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#2E2E2E",
                  }}
                >
                  Bild URL (optional)
                </label>
                <input
                  id="bildUrl"
                  type="url"
                  value={bildUrl}
                  onChange={(ev) => setBildUrl(ev.target.value)}
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

              <div style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  id="veroeffentlicht"
                  type="checkbox"
                  checked={veroeffentlicht}
                  onChange={(ev) => setVeroeffentlicht(ev.target.checked)}
                />
                <label htmlFor="veroeffentlicht" style={{ color: "#2E2E2E", fontSize: "0.95rem" }}>
                  Veroeffentlicht
                </label>
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
                {saving ? "Erstelle..." : "Kurs erstellen"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

