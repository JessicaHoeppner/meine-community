"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ProfileRow = { id: string; rolle: string | null };
type CourseRow = { id: string; titel: string | null; beschreibung: string | null; bild_url: string | null; ersteller_id: string | null; veroeffentlicht: boolean | null; erstellt_am: string | null };
type ModuleRow = { id: string; kurs_id: string; titel: string | null; beschreibung: string | null; video_url: string | null; reihenfolge: number | null; erstellt_am: string | null };

export default function AdminKursBearbeitenPage() {
  return <AuthGuard><AdminKursBearbeitenInner /></AuthGuard>;
}

function AdminKursBearbeitenInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const courseId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [bildUrl, setBildUrl] = useState("");
  const [veroeffentlicht, setVeroeffentlicht] = useState(false);

  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [addingModule, setAddingModule] = useState(false);

  const [newModulTitel, setNewModulTitel] = useState("");
  const [newModulBeschreibung, setNewModulBeschreibung] = useState("");
  const [newModulVideoUrl, setNewModulVideoUrl] = useState("");

  const loadModules = async (id: string) => {
    setModuleLoading(true);
    setModuleError(null);
    const { data: moduleData, error: modulesError } = await supabase
      .from("modules").select("id, kurs_id, titel, beschreibung, video_url, reihenfolge, erstellt_am")
      .eq("kurs_id", id).order("reihenfolge", { ascending: true });
    setModuleLoading(false);
    if (modulesError) { setModuleError(modulesError.message); return; }
    setModules((moduleData as ModuleRow[]) ?? []);
  };

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true); setError(null); setSuccess(null);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) { setError(userError.message); setLoading(false); return; }
      const user = userData.user;
      if (!user) { setLoading(false); return; }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("id, rolle").eq("id", user.id).maybeSingle();
      if (profileError) { setError(profileError.message); setLoading(false); return; }
      const role = (profile as ProfileRow | null)?.rolle ?? null;
      const admin = role?.toLowerCase() === "admin";
      setIsAdmin(admin);
      if (!admin) { setLoading(false); return; }
      const { data: courseData, error: courseError } = await supabase.from("courses")
        .select("id, titel, beschreibung, bild_url, ersteller_id, veroeffentlicht, erstellt_am").eq("id", courseId).maybeSingle();
      if (courseError) { setError(courseError.message); setLoading(false); return; }
      const course = (courseData as CourseRow | null) ?? null;
      if (!course) { setError("Kurs nicht gefunden."); setLoading(false); return; }
      setTitel(course.titel ?? "");
      setBeschreibung(course.beschreibung ?? "");
      setBildUrl(course.bild_url ?? "");
      setVeroeffentlicht(!!course.veroeffentlicht);
      await loadModules(courseId);
      setLoading(false);
    };
    load();
  }, [courseId]);

  const cardStyle = useMemo(() => ({
    backgroundColor: "#fbf8f4",
    border: "1px solid rgba(60,44,36,0.07)",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
  }), []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setSaving(true); setError(null); setSuccess(null);
    const { error: updateError } = await supabase.from("courses")
      .update({ titel: titel.trim(), beschreibung: beschreibung.trim() || null, bild_url: bildUrl.trim() || null, veroeffentlicht })
      .eq("id", courseId);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setSuccess("Kurs gespeichert.");
  };

  const handleAddModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setModuleError(null);
    if (!newModulTitel.trim()) { setModuleError("Bitte gib einen Titel fuer das Modul ein."); return; }
    setAddingModule(true);
    const nextOrder = modules.reduce((max, m) => Math.max(max, m.reihenfolge ?? 0), 0) + 1;
    const { error: insertError } = await supabase.from("modules").insert({
      kurs_id: courseId, titel: newModulTitel.trim(), beschreibung: newModulBeschreibung.trim() || null,
      video_url: newModulVideoUrl.trim() || null, reihenfolge: nextOrder,
    });
    setAddingModule(false);
    if (insertError) { setModuleError(insertError.message); return; }
    setNewModulTitel(""); setNewModulBeschreibung(""); setNewModulVideoUrl("");
    await loadModules(courseId);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!courseId) return;
    setModuleError(null);
    const ok = window.confirm("Willst du dieses Modul wirklich loeschen?");
    if (!ok) return;
    const { error: deleteError } = await supabase.from("modules").delete().eq("id", moduleId);
    if (deleteError) { setModuleError(deleteError.message); return; }
    await loadModules(courseId);
  };

  const handleDelete = async () => {
    if (!courseId) return;
    setError(null); setSuccess(null);
    const ok = window.confirm("Willst du diesen Kurs wirklich loeschen?");
    if (!ok) return;
    const { error: deleteError } = await supabase.from("courses").delete().eq("id", courseId);
    if (deleteError) { setError(deleteError.message); return; }
    router.push("/dashboard/admin/kurse");
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
        .btn-delete:hover { color: #b43b32 !important; }
        .btn-delete-outlined:hover { border-color: #b43b32 !important; color: #b43b32 !important; }
        .back-link:hover { color: #9f3129 !important; }
        .preview-link:hover { color: #3c2c24 !important; }
        .module-card:hover { border-color: rgba(180,59,50,0.30) !important; }
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

        <main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>
          <div style={{ marginBottom: "32px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Link href="/dashboard/admin/kurse" className="back-link" style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b43b32", textDecoration: "none", fontWeight: 500, fontSize: "14px", letterSpacing: "0.02em", transition: "color 0.2s ease" }}>
              ← Zurück zu Admin-Kursen
            </Link>
            <Link href={`/dashboard/kurse/${courseId ?? ""}`} className="preview-link" style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#9b8f87", textDecoration: "none", fontWeight: 500, fontSize: "14px", transition: "color 0.2s ease" }}>
              Kurs ansehen →
            </Link>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b43b32", margin: "0 0 20px", opacity: 0.85 }}>Admin</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "46px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "#3c2c24", margin: 0 }}>
              <em style={{ fontStyle: "italic" }}>Kurs bearbeiten</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "18px 0 0", opacity: 0.4 }} />
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : !isAdmin ? (
            <div style={cardStyle}>
              <div style={{ fontWeight: 500, color: "#3c2c24", fontSize: "17px", marginBottom: "10px" }}>Kein Zugriff</div>
              <Link href="/dashboard" style={{ color: "#b43b32", textDecoration: "none", fontWeight: 500 }}>Zum Dashboard</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Kurs bearbeiten */}
              <div style={cardStyle}>
                {error && <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px", marginBottom: "24px" }}>{error}</div>}
                {success && <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#edf7f0", border: "1px solid rgba(22,101,52,0.12)", color: "#166534", fontSize: "14px", marginBottom: "24px" }}>{success}</div>}
                <form onSubmit={handleSave}>
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="titel" style={labelStyle}>Titel</label>
                    <input id="titel" type="text" value={titel} onChange={(ev) => setTitel(ev.target.value)} className="admin-input" style={inputStyle}/>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="beschreibung" style={labelStyle}>Beschreibung</label>
                    <textarea id="beschreibung" value={beschreibung} onChange={(ev) => setBeschreibung(ev.target.value)} rows={5} className="admin-textarea" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}/>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="bildUrl" style={labelStyle}>Bild URL (optional)</label>
                    <input id="bildUrl" type="url" value={bildUrl} onChange={(ev) => setBildUrl(ev.target.value)} className="admin-input" style={inputStyle}/>
                  </div>
                  <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input id="veroeffentlicht" type="checkbox" checked={veroeffentlicht} onChange={(ev) => setVeroeffentlicht(ev.target.checked)}/>
                    <label htmlFor="veroeffentlicht" style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#3c2c24", fontSize: "15px" }}>Veröffentlicht</label>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "15px 32px", borderRadius: "50px", border: "none", backgroundColor: "#b43b32", color: "#ffffff", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "14px", letterSpacing: "0.04em", cursor: saving ? "default" : "pointer", opacity: saving ? 0.72 : 1, transition: "background-color 0.2s ease" }}>
                      {saving ? "Speichere…" : "Speichern"}
                    </button>
                    <button type="button" onClick={handleDelete} className="btn-delete-outlined" style={{ padding: "15px 32px", borderRadius: "50px", border: "1px solid rgba(60,44,36,0.18)", backgroundColor: "transparent", color: "#9b8f87", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "14px", cursor: "pointer", transition: "border-color 0.2s ease, color 0.2s ease" }}>
                      Kurs löschen
                    </button>
                  </div>
                </form>
              </div>

              {/* Module */}
              <div style={cardStyle}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 300, letterSpacing: "0.01em", color: "#3c2c24", margin: "0 0 20px" }}>
                  <em style={{ fontStyle: "italic" }}>Module</em>
                </h2>
                {moduleLoading ? (
                  <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
                ) : moduleError ? (
                  <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px", marginBottom: "16px" }}>{moduleError}</div>
                ) : modules.length === 0 ? (
                  <div style={{ color: "#9b8f87", fontSize: "14px" }}>Keine Module vorhanden.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {modules.map((m) => (
                      <div key={m.id} className="module-card" style={{ backgroundColor: "#f7f2eb", border: "1px solid rgba(60,44,36,0.06)", borderRadius: "16px", padding: "18px 22px", display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "flex-start", transition: "border-color 0.2s ease" }}>
                        <div style={{ minWidth: "180px", flex: "1 1 auto" }}>
                          <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "5px" }}>Reihenfolge: {m.reihenfolge ?? "—"}</div>
                          <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 600, color: "#3c2c24", fontSize: "15px", marginBottom: "5px" }}>{m.titel ?? "Unbenannt"}</div>
                          <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#9b8f87", fontSize: "13px", lineHeight: 1.6 }}>{m.beschreibung ?? "Keine Beschreibung vorhanden."}</div>
                          {m.video_url ? <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "12px", marginTop: "6px", wordBreak: "break-all" }}>Video: {m.video_url}</div> : null}
                        </div>
                        <button type="button" onClick={() => handleDeleteModule(m.id)} className="btn-delete" style={{ padding: "8px 18px", borderRadius: "50px", border: "none", backgroundColor: "transparent", color: "#9b8f87", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "13px", cursor: "pointer", flexShrink: 0, transition: "color 0.2s ease" }}>
                          Löschen
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Neues Modul */}
              <div style={cardStyle}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 300, letterSpacing: "0.01em", color: "#3c2c24", margin: "0 0 24px" }}>
                  <em style={{ fontStyle: "italic" }}>Neues Modul hinzufügen</em>
                </h2>
                {moduleError && !moduleLoading && <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px", marginBottom: "20px" }}>{moduleError}</div>}
                <form onSubmit={handleAddModule}>
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="modulTitel" style={labelStyle}>Titel</label>
                    <input id="modulTitel" type="text" value={newModulTitel} onChange={(ev) => setNewModulTitel(ev.target.value)} className="admin-input" style={inputStyle}/>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="modulBeschreibung" style={labelStyle}>Beschreibung</label>
                    <textarea id="modulBeschreibung" value={newModulBeschreibung} onChange={(ev) => setNewModulBeschreibung(ev.target.value)} rows={4} className="admin-textarea" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}/>
                  </div>
                  <div style={{ marginBottom: "28px" }}>
                    <label htmlFor="modulVideoUrl" style={labelStyle}>Video-URL (YouTube embed URL)</label>
                    <input id="modulVideoUrl" type="url" value={newModulVideoUrl} onChange={(ev) => setNewModulVideoUrl(ev.target.value)} className="admin-input" style={inputStyle}/>
                  </div>
                  <button type="submit" disabled={addingModule} className="btn-primary" style={{ padding: "15px 32px", borderRadius: "50px", border: "none", backgroundColor: "#b43b32", color: "#ffffff", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "14px", letterSpacing: "0.04em", cursor: addingModule ? "default" : "pointer", opacity: addingModule ? 0.72 : 1, transition: "background-color 0.2s ease" }}>
                    {addingModule ? "Füge hinzu…" : "Modul hinzufügen"}
                  </button>
                </form>
              </div>

            </div>
          )}
        </main>
      </div>
    </>
  );
}
