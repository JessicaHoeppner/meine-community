"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ProfileRow = {
  id: string;
  rolle: string | null;
};

type CourseRow = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  bild_url: string | null;
  ersteller_id: string | null;
  veroeffentlicht: boolean | null;
  erstellt_am: string | null;
};

type ModuleRow = {
  id: string;
  kurs_id: string;
  titel: string | null;
  beschreibung: string | null;
  video_url: string | null;
  reihenfolge: number | null;
  erstellt_am: string | null;
};

export default function AdminKursBearbeitenPage() {
  return (
    <AuthGuard>
      <AdminKursBearbeitenInner />
    </AuthGuard>
  );
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
      .from("modules")
      .select("id, kurs_id, titel, beschreibung, video_url, reihenfolge, erstellt_am")
      .eq("kurs_id", id)
      .order("reihenfolge", { ascending: true });

    setModuleLoading(false);

    if (modulesError) {
      setModuleError(modulesError.message);
      return;
    }

    setModules((moduleData as ModuleRow[]) ?? []);
  };

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      setSuccess(null);

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
      if (!admin) {
        setLoading(false);
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, titel, beschreibung, bild_url, ersteller_id, veroeffentlicht, erstellt_am"
        )
        .eq("id", courseId)
        .maybeSingle();

      if (courseError) {
        setError(courseError.message);
        setLoading(false);
        return;
      }

      const course = (courseData as CourseRow | null) ?? null;
      if (!course) {
        setError("Kurs nicht gefunden.");
        setLoading(false);
        return;
      }

      setTitel(course.titel ?? "");
      setBeschreibung(course.beschreibung ?? "");
      setBildUrl(course.bild_url ?? "");
      setVeroeffentlicht(!!course.veroeffentlicht);

      await loadModules(courseId);
      setLoading(false);
    };

    load();
  }, [courseId]);

  const cardStyle = useMemo(
    () => ({
      backgroundColor: "#FFFFFF",
      border: "1px solid #E8E4E0",
      borderRadius: "16px",
      padding: "20px",
    }),
    []
  );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        titel: titel.trim(),
        beschreibung: beschreibung.trim() || null,
        bild_url: bildUrl.trim() || null,
        veroeffentlicht,
      })
      .eq("id", courseId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Kurs gespeichert.");
  };

  const handleAddModule = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setModuleError(null);

    if (!newModulTitel.trim()) {
      setModuleError("Bitte gib einen Titel fuer das Modul ein.");
      return;
    }

    setAddingModule(true);
    const nextOrder =
      modules.reduce((max, m) => Math.max(max, m.reihenfolge ?? 0), 0) + 1;

    const { error: insertError } = await supabase.from("modules").insert({
      kurs_id: courseId,
      titel: newModulTitel.trim(),
      beschreibung: newModulBeschreibung.trim() || null,
      video_url: newModulVideoUrl.trim() || null,
      reihenfolge: nextOrder,
    });

    setAddingModule(false);

    if (insertError) {
      setModuleError(insertError.message);
      return;
    }

    setNewModulTitel("");
    setNewModulBeschreibung("");
    setNewModulVideoUrl("");
    await loadModules(courseId);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!courseId) return;
    setModuleError(null);

    const ok = window.confirm("Willst du dieses Modul wirklich loeschen?");
    if (!ok) return;

    const { error: deleteError } = await supabase
      .from("modules")
      .delete()
      .eq("id", moduleId);

    if (deleteError) {
      setModuleError(deleteError.message);
      return;
    }

    await loadModules(courseId);
  };

  const handleDelete = async () => {
    if (!courseId) return;
    setError(null);
    setSuccess(null);

    const ok = window.confirm("Willst du diesen Kurs wirklich loeschen?");
    if (!ok) return;

    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.push("/dashboard/admin/kurse");
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
        <div style={{ marginBottom: "14px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
          <Link
            href={`/dashboard/kurse/${courseId ?? ""}`}
            style={{
              color: "#2E2E2E",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            Kurs ansehen →
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
          Kurs bearbeiten
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
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={cardStyle}>
              {success && (
                <div
                  style={{
                    marginBottom: "12px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#DCFCE7",
                    color: "#166534",
                    fontSize: "0.9rem",
                  }}
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSave}>
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
                    rows={5}
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

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                    {saving ? "Speichere..." : "Speichern"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "999px",
                      border: "1px solid #E8E4E0",
                      backgroundColor: "#FFFFFF",
                      color: "#2E2E2E",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                    }}
                  >
                    Loeschen
                  </button>
                </div>
              </form>
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight: 800, color: "#2E2E2E", fontSize: "1.05rem", marginBottom: "10px" }}>
                Module
              </div>

              {moduleLoading ? (
                <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>Laden...</div>
              ) : moduleError ? (
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
                  {moduleError}
                </div>
              ) : modules.length === 0 ? (
                <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>Keine Module vorhanden.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {modules.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        backgroundColor: "#FAF7F3",
                        border: "1px solid #E8E4E0",
                        borderRadius: "12px",
                        padding: "14px",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ minWidth: "220px", flex: "1 1 auto" }}>
                        <div style={{ color: "#6B6562", fontSize: "0.85rem", marginBottom: "4px" }}>
                          Reihenfolge: {m.reihenfolge ?? "—"}
                        </div>
                        <div style={{ fontWeight: 800, color: "#2E2E2E" }}>
                          {m.titel ?? "Unbenannt"}
                        </div>
                        <div style={{ color: "#6B6562", fontSize: "0.9rem", marginTop: "6px", lineHeight: 1.6 }}>
                          {m.beschreibung ?? "Keine Beschreibung vorhanden."}
                        </div>
                        {m.video_url ? (
                          <div style={{ color: "#6B6562", fontSize: "0.85rem", marginTop: "8px" }}>
                            Video URL: {m.video_url}
                          </div>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteModule(m.id)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "999px",
                          border: "none",
                          backgroundColor: "#8B3A3A",
                          color: "#FFFFFF",
                          fontWeight: 500,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          height: "40px",
                        }}
                      >
                        Loeschen
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight: 800, color: "#2E2E2E", fontSize: "1.05rem", marginBottom: "10px" }}>
                Neues Modul hinzufuegen
              </div>

              {moduleError && !moduleLoading ? (
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
                  {moduleError}
                </div>
              ) : null}

              <form onSubmit={handleAddModule}>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    htmlFor="modulTitel"
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
                    id="modulTitel"
                    type="text"
                    value={newModulTitel}
                    onChange={(ev) => setNewModulTitel(ev.target.value)}
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
                    htmlFor="modulBeschreibung"
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
                    id="modulBeschreibung"
                    value={newModulBeschreibung}
                    onChange={(ev) => setNewModulBeschreibung(ev.target.value)}
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

                <div style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="modulVideoUrl"
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "#2E2E2E",
                    }}
                  >
                    Video-URL (YouTube embed URL)
                  </label>
                  <input
                    id="modulVideoUrl"
                    type="url"
                    value={newModulVideoUrl}
                    onChange={(ev) => setNewModulVideoUrl(ev.target.value)}
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

                <button
                  type="submit"
                  disabled={addingModule}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#8B3A3A",
                    color: "#FFFFFF",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    cursor: addingModule ? "default" : "pointer",
                    opacity: addingModule ? 0.85 : 1,
                  }}
                >
                  {addingModule ? "Fuege hinzu..." : "Modul hinzufuegen"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

