"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type LiveSession = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  datum: string | null;
  status: "geplant" | "live" | "beendet";
  thumbnail_url: string | null;
  meeting_url: string | null;
};

type FormState = {
  titel: string;
  beschreibung: string;
  datum: string;
  status: "geplant" | "live" | "beendet";
  thumbnail_url: string;
  meeting_url: string;
};

const emptyForm: FormState = {
  titel: "",
  beschreibung: "",
  datum: "",
  status: "geplant",
  thumbnail_url: "",
  meeting_url: "",
};

export default function AdminLivePage() {
  return (
    <AuthGuard>
      <AdminLiveInner />
    </AuthGuard>
  );
}

function AdminLiveInner() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase.from("profiles").select("rolle").eq("id", user.id).maybeSingle();
      const admin = ((profile as { rolle?: string } | null)?.rolle ?? "").toLowerCase() === "admin";
      setIsAdmin(admin);
      if (admin) await loadSessions();
      setLoading(false);
    };
    init();
  }, []);

  const loadSessions = async () => {
    const { data } = await supabase
      .from("live_sessions")
      .select("id, titel, beschreibung, datum, status, thumbnail_url, meeting_url")
      .order("datum", { ascending: false });
    setSessions((data as LiveSession[]) ?? []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.titel.trim()) { setError("Titel ist erforderlich."); return; }
    setSaving(true);

    const payload = {
      titel: form.titel.trim(),
      beschreibung: form.beschreibung.trim() || null,
      datum: form.datum || null,
      status: form.status,
      thumbnail_url: form.thumbnail_url.trim() || null,
      meeting_url: form.meeting_url.trim() || null,
    };

    if (editingId) {
      const { error: err } = await supabase.from("live_sessions").update(payload).eq("id", editingId);
      if (err) { setError(err.message); setSaving(false); return; }
      setSuccess("Session aktualisiert.");
    } else {
      const { error: err } = await supabase.from("live_sessions").insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
      setSuccess("Session erstellt.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
    await loadSessions();
  };

  const handleEdit = (s: LiveSession) => {
    setEditingId(s.id);
    setForm({
      titel: s.titel ?? "",
      beschreibung: s.beschreibung ?? "",
      datum: s.datum ? new Date(s.datum).toISOString().slice(0, 16) : "",
      status: s.status,
      thumbnail_url: s.thumbnail_url ?? "",
      meeting_url: s.meeting_url ?? "",
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
  };

  const handleStatusChange = async (id: string, status: LiveSession["status"]) => {
    await supabase.from("live_sessions").update({ status }).eq("id", id);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Session wirklich löschen?")) return;
    await supabase.from("live_sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(60,44,36,0.14)",
    backgroundColor: "#fbf8f4",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    color: "var(--color-text)",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#9b8f87",
    marginBottom: "8px",
  };

  return (
        <main style={{ maxWidth: "880px", margin: "0 auto", padding: "64px 24px 100px" }}>

          <Link href="/dashboard/admin" className="back-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#9b8f87", fontSize: "13px", fontWeight: 500, textDecoration: "none", marginBottom: "36px", letterSpacing: "0.02em", transition: "color 0.2s ease" }}>
            ← Admin
          </Link>

          <div style={{ marginBottom: "48px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 20px", opacity: 0.85 }}>Admin</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "46px", fontWeight: 300, color: "var(--color-text)", margin: 0, lineHeight: 1.1 }}>
              <em>Live Sessions</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "22px 0 0", opacity: 0.4 }} />
          </div>

          {loading ? (
            <div style={{ color: "#9b8f87", fontSize: "15px" }}>Laden…</div>
          ) : !isAdmin ? (
            <div style={{ color: "var(--color-primary)", fontSize: "15px" }}>Kein Zugriff.</div>
          ) : (
              {/* Form */}
              <section style={{ backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.08)", borderRadius: "20px", padding: "32px", marginBottom: "48px" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-text)", margin: "0 0 28px" }}>
                  {editingId ? "Session bearbeiten" : "Neue Session erstellen"}
                </h2>

                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.15)", color: "var(--color-primary)", fontSize: "14px", marginBottom: "20px" }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "#e9f5ec", border: "1px solid rgba(40,120,60,0.15)", color: "#2a6e3a", fontSize: "14px", marginBottom: "20px" }}>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={labelStyle}>Titel *</label>
                    <input className="form-input" value={form.titel} onChange={(e) => setForm((f) => ({ ...f, titel: e.target.value }))} placeholder="z. B. Q&A mit der Community" style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Beschreibung</label>
                    <textarea className="form-input" value={form.beschreibung} onChange={(e) => setForm((f) => ({ ...f, beschreibung: e.target.value }))} placeholder="Worum geht es in dieser Session?" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Datum & Uhrzeit</label>
                      <input className="form-input" type="datetime-local" value={form.datum} onChange={(e) => setForm((f) => ({ ...f, datum: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Status</label>
                      <select className="status-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormState["status"] }))} style={inputStyle}>
                        <option value="geplant">Geplant</option>
                        <option value="live">Live</option>
                        <option value="beendet">Beendet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Meeting-URL</label>
                    <input className="form-input" value={form.meeting_url} onChange={(e) => setForm((f) => ({ ...f, meeting_url: e.target.value }))} placeholder="https://zoom.us/j/…" style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Thumbnail-URL</label>
                    <input className="form-input" value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://…/bild.jpg" style={inputStyle} />
                  </div>

                  <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                    <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "12px 28px", borderRadius: "50px", border: "none", backgroundColor: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, transition: "background-color 0.2s ease", letterSpacing: "0.02em" }}>
                      {saving ? "Speichern…" : editingId ? "Änderungen speichern" : "Session erstellen"}
                    </button>
                    {editingId && (
                      <button type="button" className="btn-ghost" onClick={handleCancelEdit} style={{ padding: "12px 24px", borderRadius: "50px", border: "1px solid rgba(60,44,36,0.15)", backgroundColor: "transparent", color: "#7a6d65", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", cursor: "pointer", transition: "color 0.2s ease, border-color 0.2s ease" }}>
                        Abbrechen
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* Session list */}
              <section>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-text)", margin: "0 0 20px" }}>
                  Alle Sessions ({sessions.length})
                </h2>

                {sessions.length === 0 ? (
                  <p style={{ color: "#9b8f87", fontSize: "15px" }}>Noch keine Sessions angelegt.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {sessions.map((s) => {
                      const formattedDate = s.datum
                        ? new Date(s.datum).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
                          " · " +
                          new Date(s.datum).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr"
                        : "Kein Datum";

                      return (
                        <div key={s.id} className="session-row" style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.08)", borderRadius: "14px", padding: "16px 20px", transition: "background-color 0.15s ease" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-text)", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {s.titel || "Unbenannt"}
                            </div>
                            <div style={{ fontSize: "13px", color: "#9b8f87" }}>{formattedDate}</div>
                          </div>

                          {/* Status select */}
                          <select
                            className="status-select"
                            value={s.status}
                            onChange={(e) => handleStatusChange(s.id, e.target.value as LiveSession["status"])}
                            style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(60,44,36,0.14)", backgroundColor: "#f7f2ec", fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", cursor: "pointer" }}
                          >
                            <option value="geplant">Geplant</option>
                            <option value="live">Live</option>
                            <option value="beendet">Beendet</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleEdit(s)}
                            style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid rgba(60,44,36,0.15)", backgroundColor: "transparent", color: "#7a6d65", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                          >
                            Bearbeiten
                          </button>

                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => handleDelete(s.id)}
                            style={{ padding: "7px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "background-color 0.2s ease" }}
                          >
                            Löschen
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
          )}
        </main>
    </div>
  );
}