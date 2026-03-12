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
      if (userError) { setError(userError.message); setLoading(false); return; }
      const user = userData.user;
      if (!user) { setLoading(false); return; }
      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("id, rolle").eq("id", user.id).maybeSingle();
      if (profileError) { setError(profileError.message); setLoading(false); return; }
      const role = (profile as ProfileRow | null)?.rolle ?? null;
      setIsAdmin(role?.toLowerCase() === "admin");
      setLoading(false);
    };
    checkAdmin();
  }, []);

  const cardStyle = useMemo(() => ({
    backgroundColor: "#fbf8f4",
    border: "1px solid rgba(60,44,36,0.07)",
    borderRadius: "28px",
    padding: "44px 40px 36px",
    boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
  }), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!titel.trim()) { setError("Bitte gib einen Titel ein."); return; }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) { setSaving(false); return; }
    const { data, error: insertError } = await supabase
      .from("courses")
      .insert({ titel: titel.trim(), beschreibung: beschreibung.trim() || null, bild_url: bildUrl.trim() || null, ersteller_id: user.id, veroeffentlicht })
      .select("id").maybeSingle();
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    const id = (data as { id?: string } | null)?.id;
    if (id) { router.push(`/dashboard/admin/kurse/${id}`); } else { router.push("/dashboard/admin/kurse"); }
  };

  const labelStyle = { display: "block", fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "11px", fontWeight: 600 as const, letterSpacing: "0.10em", textTransform: "uppercase" as const, marginBottom: "10px", color: "#a89c94" };
  const inputStyle = { width: "100%", padding: "15px 18px", borderRadius: "14px", border: "1px solid #ddd5c6", fontSize: "15px", fontFamily: "'Manrope', system-ui, sans-serif", backgroundColor: "#f7f1e8", color: "#3c2c24", boxSizing: "border-box" as const, transition: "border-color 0.2s ease, box-shadow 0.2s ease" };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        input:-webkit-autofill, textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #f7f1e8 inset !important;
          -webkit-text-fill-color: #3c2c24 !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        .admin-input:focus, .admin-textarea:focus { outline: none; border-color: #c9896e !important; box-shadow: 0 0 0 3px rgba(180,59,50,0.05) !important; }
        .btn-primary:hover:not(:disabled) { background-color: #9f3129 !important; }
        .back-link:hover { color: #9f3129 !important; }
        .auth-grain::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.016;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }
      `}} />

      <div className="auth-grain" style={{ minHeight: "100vh", backgroundColor: "#efe6dc", position: "relative", overflow: "hidden", fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
          <svg style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "70%", opacity: 0.38 }} viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="250" cy="200" rx="250" ry="180" fill="#e8ddd0"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", opacity: 0.40 }} viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e8ddd0" d="M0,60 C360,140 720,20 1080,80 C1260,110 1380,60 1440,70 L1440,160 L0,160 Z"/>
          </svg>
          <svg style={{ position: "absolute", top: "5%", right: "-8%", width: "38%", height: "55%", opacity: 0.22 }} viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="175" rx="200" ry="155" fill="#ddd4c8"/>
          </svg>
        </div>

        <main style={{ position: "relative", zIndex: 1, maxWidth: "680px", margin: "0 auto", padding: "80px 24px 100px" }}>
          <div style={{ marginBottom: "32px" }}>
            <Link href="/dashboard/admin/kurse" className="back-link" style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b43b32", textDecoration: "none", fontWeight: 500, fontSize: "14px", letterSpacing: "0.02em", transition: "color 0.2s ease" }}>
              ← Zurück zu Admin-Kursen
            </Link>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b43b32", margin: "0 0 20px", opacity: 0.85 }}>Admin</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "46px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "#3c2c24", margin: 0 }}>
              <em style={{ fontStyle: "italic" }}>Neuen Kurs erstellen</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "20px 0 18px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "15px", color: "#7a6d65", lineHeight: 1.75 }}>
              Füll das Formular aus und veröffentliche deinen Kurs.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : !isAdmin ? (
            <div style={cardStyle}>
              <div style={{ fontWeight: 500, color: "#3c2c24", fontSize: "17px", marginBottom: "10px" }}>Kein Zugriff</div>
              <Link href="/dashboard" style={{ color: "#b43b32", textDecoration: "none", fontWeight: 500 }}>Zum Dashboard</Link>
            </div>
          ) : (
            <div style={cardStyle}>
              {error && <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px", marginBottom: "24px" }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="titel" style={labelStyle}>Titel</label>
                  <input id="titel" type="text" value={titel} onChange={(ev) => setTitel(ev.target.value)} className="admin-input" style={inputStyle}/>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="beschreibung" style={labelStyle}>Beschreibung</label>
                  <textarea id="beschreibung" value={beschreibung} onChange={(ev) => setBeschreibung(ev.target.value)} rows={4} className="admin-textarea" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}/>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="bildUrl" style={labelStyle}>Bild URL (optional)</label>
                  <input id="bildUrl" type="url" value={bildUrl} onChange={(ev) => setBildUrl(ev.target.value)} className="admin-input" style={inputStyle}/>
                </div>
                <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <input id="veroeffentlicht" type="checkbox" checked={veroeffentlicht} onChange={(ev) => setVeroeffentlicht(ev.target.checked)}/>
                  <label htmlFor="veroeffentlicht" style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#3c2c24", fontSize: "15px" }}>Veröffentlicht</label>
                </div>
                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "17px 36px", borderRadius: "50px", border: "none", backgroundColor: "#b43b32", color: "#ffffff", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "15px", letterSpacing: "0.04em", cursor: saving ? "default" : "pointer", opacity: saving ? 0.72 : 1, transition: "background-color 0.2s ease" }}>
                  {saving ? "Erstelle…" : "Kurs erstellen"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
