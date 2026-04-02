"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type Gruppe = {
  id: string;
  name: string;
  beschreibung: string | null;
  memberCount: number;
};

type FormState = { name: string; beschreibung: string };
const emptyForm: FormState = { name: "", beschreibung: "" };

export default function AdminGruppenPage() {
  return (
    <AuthGuard>
      <AdminGruppenInner />
    </AuthGuard>
  );
}

function AdminGruppenInner() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gruppen, setGruppen] = useState<Gruppe[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("rolle")
        .eq("id", user.id)
        .maybeSingle();
      const admin = ((profile as { rolle?: string } | null)?.rolle ?? "").toLowerCase() === "admin";
      setIsAdmin(admin);
      if (admin) await loadGruppen();
      setLoading(false);
    };
    init();
  }, []);

  const loadGruppen = async () => {
    const { data: gruppenData } = await supabase
      .from("gruppen")
      .select("id, name, beschreibung")
      .order("name", { ascending: true });

    if (!gruppenData) return;

    const ids = (gruppenData as { id: string }[]).map((g) => g.id);
    const { data: mitgliederData } = await supabase
      .from("gruppen_mitglieder")
      .select("gruppen_id")
      .in("gruppen_id", ids);

    const countMap: Record<string, number> = {};
    for (const row of (mitgliederData ?? []) as { gruppen_id: string }[]) {
      countMap[String(row.gruppen_id)] = (countMap[String(row.gruppen_id)] ?? 0) + 1;
    }

    setGruppen(
      (gruppenData as { id: string; name: string; beschreibung: string | null }[]).map((g) => ({
        id: g.id,
        name: g.name,
        beschreibung: g.beschreibung,
        memberCount: countMap[String(g.id)] ?? 0,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.name.trim()) { setError("Name ist erforderlich."); return; }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      beschreibung: form.beschreibung.trim() || null,
    };

    if (editingId) {
      const { error: err } = await supabase.from("gruppen").update(payload).eq("id", editingId);
      if (err) { setError(err.message); setSaving(false); return; }
      setSuccess("Gruppe aktualisiert.");
    } else {
      const { error: err } = await supabase
        .from("gruppen")
        .insert({ ...payload, erstellt_von: currentUserId });
      if (err) { setError(err.message); setSaving(false); return; }
      setSuccess("Gruppe erstellt.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
    await loadGruppen();
  };

  const handleEdit = (g: Gruppe) => {
    setEditingId(g.id);
    setForm({ name: g.name, beschreibung: g.beschreibung ?? "" });
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

  const handleDelete = async (id: string) => {
    if (!confirm("Gruppe wirklich löschen? Alle Mitgliedschaften werden ebenfalls entfernt.")) return;
    await supabase.from("gruppen").delete().eq("id", id);
    setGruppen((prev) => prev.filter((g) => g.id !== id));
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
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 20px", opacity: 0.85 }}>
              Admin
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "46px", fontWeight: 300, color: "var(--color-text)", margin: 0, lineHeight: 1.1 }}>
              <em>Gruppen</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "22px 0 0", opacity: 0.4 }} />
          </div>

          {loading ? (
            <div style={{ color: "#9b8f87", fontSize: "15px" }}>Laden…</div>
          ) : !isAdmin ? (
            <div style={{ color: "var(--color-primary)", fontSize: "15px" }}>Kein Zugriff.</div>
          ) : (
            <>
              {/* Formular */}
              <section style={{ backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.08)", borderRadius: "20px", padding: "32px", marginBottom: "48px" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-text)", margin: "0 0 28px" }}>
                  {editingId ? "Gruppe bearbeiten" : "Neue Gruppe erstellen"}
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
                    <label style={labelStyle}>Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="z. B. Fotografie"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Beschreibung</label>
                    <textarea
                      className="form-input"
                      value={form.beschreibung}
                      onChange={(e) => setForm((f) => ({ ...f, beschreibung: e.target.value }))}
                      placeholder="Worum geht es in dieser Gruppe?"
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={saving}
                      style={{ padding: "12px 28px", borderRadius: "50px", border: "none", backgroundColor: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, transition: "background-color 0.2s ease", letterSpacing: "0.02em" }}
                    >
                      {saving ? "Speichern…" : editingId ? "Änderungen speichern" : "Gruppe erstellen"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={handleCancelEdit}
                        style={{ padding: "12px 24px", borderRadius: "50px", border: "1px solid rgba(60,44,36,0.15)", backgroundColor: "transparent", color: "#7a6d65", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", cursor: "pointer", transition: "color 0.2s ease, border-color 0.2s ease" }}
                      >
                        Abbrechen
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* Liste */}
              <section>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 400, color: "var(--color-text)", margin: "0 0 20px" }}>
                  Alle Gruppen ({gruppen.length})
                </h2>

                {gruppen.length === 0 ? (
                  <p style={{ color: "#9b8f87", fontSize: "15px" }}>Noch keine Gruppen erstellt.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {gruppen.map((g) => (
                      <div
                        key={g.id}
                        className="gruppen-row"
                        style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.08)", borderRadius: "14px", padding: "16px 20px", transition: "background-color 0.15s ease" }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 400, color: "var(--color-text)", marginBottom: "2px" }}>
                            {g.name}
                          </div>
                          <div style={{ fontSize: "13px", color: "#9b8f87" }}>
                            {g.memberCount} {g.memberCount === 1 ? "Mitglied" : "Mitglieder"}
                            {g.beschreibung ? ` · ${g.beschreibung.slice(0, 70)}${g.beschreibung.length > 70 ? "…" : ""}` : ""}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEdit(g)}
                          style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid rgba(60,44,36,0.15)", backgroundColor: "transparent", color: "#7a6d65", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                        >
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDelete(g.id)}
                          style={{ padding: "7px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "background-color 0.2s ease" }}
                        >
                          Löschen
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
  );
}