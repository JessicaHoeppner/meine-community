"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ProfileRow = {
  id: string;
  name: string | null;
  bio: string | null;
  rolle: string | null;
  avatar_url: string | null;
  erstellt_am: string | null;
};

export default function ProfilPage() {
  return (
    <AuthGuard>
      <ProfilInner />
    </AuthGuard>
  );
}

function ProfilInner() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const memberSince = useMemo(() => {
    const iso = profile?.erstellt_am ?? userCreatedAt;
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }, [profile?.erstellt_am, userCreatedAt]);

  useEffect(() => {
    const load = async () => {
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

      setUserEmail(user.email ?? null);
      setUserCreatedAt((user as unknown as { created_at?: string }).created_at ?? null);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, bio, rolle, avatar_url, erstellt_am")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const normalized: ProfileRow = profileData ?? {
        id: user.id,
        name:
          (user.user_metadata?.name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          null,
        bio: null,
        rolle: "Mitglied",
        avatar_url: null,
        erstellt_am: null,
      };

      setProfile(normalized);
      setEditName(normalized.name ?? "");
      setEditBio(normalized.bio ?? "");
      setLoading(false);
    };

    load();
  }, []);

  const initials = useMemo(() => {
    const base = profile?.name ?? userEmail ?? "";
    const trimmed = base.trim();
    if (!trimmed) return "?";
    return trimmed[0]?.toUpperCase() ?? "?";
  }, [profile?.name, userEmail]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setSaving(false);
      return;
    }

    const payload = {
      id: user.id,
      name: editName.trim() || null,
      bio: editBio.trim() || null,
    };

    const { data: saved, error: saveError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("id, name, bio, rolle, avatar_url, erstellt_am")
      .maybeSingle();

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    if (saved) setProfile(saved as ProfileRow);
    else setProfile((prev) => (prev ? { ...prev, ...payload } : prev));

    setEditing(false);
    setSuccess("Profil gespeichert.");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setAvatarError("Nur JPG, PNG oder WebP erlaubt.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Maximale Dateigröße: 2 MB.");
      return;
    }

    setAvatarError(null);
    setUploadingAvatar(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) { setUploadingAvatar(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${user.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setAvatarError(uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setUploadingAvatar(false);

    if (updateError) {
      setAvatarError(updateError.message);
      return;
    }

    setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : prev);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');

        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus,
        textarea:-webkit-autofill, textarea:-webkit-autofill:hover, textarea:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #f7f1e8 inset !important;
          -webkit-text-fill-color: #3c2c24 !important;
          transition: background-color 9999s ease-in-out 0s;
        }

        .profil-input:focus, .profil-textarea:focus {
          outline: none;
          border-color: #c9896e !important;
          box-shadow: 0 0 0 3px rgba(180,59,50,0.05) !important;
        }
        .btn-save:hover:not(:disabled)  { background-color: #9f3129 !important; }
        .btn-edit:hover:not(:disabled)  { background-color: #9f3129 !important; }
        .btn-cancel:hover { border-color: rgba(60,44,36,0.4) !important; color: #3c2c24 !important; }
        .avatar-upload-area { cursor: pointer; position: relative; }
        .avatar-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(60,44,36,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s ease;
        }
        .avatar-upload-area:hover .avatar-overlay { opacity: 1; }

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
      `}} />

      <div
        className="auth-grain"
        style={{
          minHeight: "100vh",
          backgroundColor: "#efe6dc",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
          <svg style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "70%", opacity: 0.38 }}
            viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="250" cy="200" rx="250" ry="180" fill="#e8ddd0"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", opacity: 0.40 }}
            viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e8ddd0" d="M0,60 C360,140 720,20 1080,80 C1260,110 1380,60 1440,70 L1440,160 L0,160 Z"/>
          </svg>
          <svg style={{ position: "absolute", top: "5%", right: "-8%", width: "38%", height: "55%", opacity: 0.22 }}
            viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="175" rx="200" ry="155" fill="#ddd4c8"/>
          </svg>
        </div>

        <main style={{ position: "relative", zIndex: 1, maxWidth: "720px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Intro */}
          <div style={{ marginBottom: "48px" }}>
            <p style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#b43b32",
              margin: "0 0 22px",
              opacity: 0.85,
            }}>
              Dein Account
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "52px",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              color: "#3c2c24",
              margin: 0,
            }}>
              <em style={{ fontStyle: "italic" }}>Mein Profil</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "22px 0 20px", opacity: 0.4 }} />
            <p style={{
              margin: 0,
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#7a6d65",
              lineHeight: 1.75,
              letterSpacing: "0.01em",
            }}>
              Verwalte deine persönlichen Daten und Einstellungen.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : (
            <div style={{
              backgroundColor: "#fbf8f4",
              border: "1px solid rgba(60,44,36,0.07)",
              borderRadius: "28px",
              padding: "44px 40px 36px",
              boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
            }}>
              {error && (
                <div style={{ marginBottom: "24px", padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ marginBottom: "24px", padding: "13px 16px", borderRadius: "12px", backgroundColor: "#edf7f0", border: "1px solid rgba(22,101,52,0.12)", color: "#166534", fontSize: "14px" }}>
                  {success}
                </div>
              )}

              {/* Avatar + name row */}
              <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "28px", flexWrap: "wrap" }}>

                {/* Avatar upload area */}
                <div style={{ flexShrink: 0 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                    aria-label="Profilbild hochladen"
                  />
                  <div
                    className="avatar-upload-area"
                    onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                    title="Profilbild ändern"
                    style={{ width: "80px", height: "80px" }}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profilbild"
                        style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid #E8DDD0", backgroundColor: "#E8DDD0", display: "block" }}
                      />
                    ) : (
                      <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(180,59,50,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#b43b32",
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "2rem",
                        fontWeight: 300,
                        border: "2px solid #E8DDD0",
                      }}>
                        {uploadingAvatar ? "…" : initials}
                      </div>
                    )}
                    {/* Hover-Overlay mit Kamera-Icon */}
                    <div className="avatar-overlay" aria-hidden>
                      {uploadingAvatar ? (
                        <span style={{ color: "#fff", fontSize: "12px", fontFamily: "'Manrope', system-ui, sans-serif" }}>…</span>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  {avatarError && (
                    <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "12px", color: "#b43b32", margin: "6px 0 0", maxWidth: "80px", lineHeight: 1.4 }}>
                      {avatarError}
                    </p>
                  )}
                </div>

                <div style={{ flex: "1 1 auto", minWidth: "200px" }}>
                  <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "6px" }}>Name</div>
                  <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#3c2c24", fontSize: "20px", fontWeight: 500 }}>
                    {profile?.name || userEmail || "—"}
                  </div>
                </div>

                <div>
                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => { setSuccess(null); setError(null); setEditing(true); }}
                      className="btn-edit"
                      style={{
                        padding: "12px 24px",
                        borderRadius: "50px",
                        border: "none",
                        backgroundColor: "#b43b32",
                        color: "#ffffff",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        letterSpacing: "0.03em",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      Profil bearbeiten
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setError(null);
                        setSuccess(null);
                        setEditName(profile?.name ?? "");
                        setEditBio(profile?.bio ?? "");
                      }}
                      className="btn-cancel"
                      style={{
                        padding: "12px 24px",
                        borderRadius: "50px",
                        border: "1px solid rgba(60,44,36,0.20)",
                        backgroundColor: "transparent",
                        color: "#7a6d65",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "border-color 0.2s ease, color 0.2s ease",
                      }}
                    >
                      Abbrechen
                    </button>
                  )}
                </div>
              </div>

              {/* Trennlinie */}
              <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "24px" }} />

              {/* Info boxes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginBottom: "28px" }}>
                <InfoBox label="Rolle" value={profile?.rolle ?? "Mitglied"} />
                <InfoBox label="Mitglied seit" value={memberSince} />
                <InfoBox label="E-Mail" value={userEmail ?? "—"} />
              </div>

              {/* Bio / Edit form */}
              {!editing ? (
                <div>
                  <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>
                    Bio
                  </div>
                  <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#6f625b", lineHeight: 1.75, fontSize: "15px" }}>
                    {profile?.bio?.trim() ? profile.bio : "Noch keine Bio hinterlegt."}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="editName" style={{
                      display: "block",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                      color: "#a89c94",
                    }}>
                      Name
                    </label>
                    <input
                      id="editName"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="profil-input"
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
                    />
                  </div>

                  <div style={{ marginBottom: "28px" }}>
                    <label htmlFor="editBio" style={{
                      display: "block",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                      color: "#a89c94",
                    }}>
                      Bio
                    </label>
                    <textarea
                      id="editBio"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={4}
                      className="profil-textarea"
                      style={{
                        width: "100%",
                        padding: "15px 18px",
                        borderRadius: "14px",
                        border: "1px solid #ddd5c6",
                        fontSize: "15px",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        backgroundColor: "#f7f1e8",
                        color: "#3c2c24",
                        resize: "vertical",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                        lineHeight: 1.65,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-save"
                    style={{
                      padding: "15px 36px",
                      borderRadius: "50px",
                      border: "none",
                      backgroundColor: "#b43b32",
                      color: "#ffffff",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      letterSpacing: "0.04em",
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.72 : 1,
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {saving ? "Speichern…" : "Speichern"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function InfoBox({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div style={{
      backgroundColor: "#f7f2eb",
      border: "1px solid rgba(60,44,36,0.06)",
      borderRadius: "16px",
      padding: "14px 16px",
    }}>
      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#3c2c24", fontSize: "14px", fontWeight: 500 }}>{value}</div>
    </div>
  );
}
