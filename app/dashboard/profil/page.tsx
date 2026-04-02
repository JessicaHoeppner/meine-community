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
  headerbild: string | null;
  website: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
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
  const [postCount, setPostCount] = useState(0);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editTwitter, setEditTwitter] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const memberSince = useMemo(() => {
    const iso = userCreatedAt ?? profile?.erstellt_am;
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("de-DE", { year: "numeric", month: "long" });
  }, [userCreatedAt, profile?.erstellt_am]);

  const initials = useMemo(() => {
    const base = profile?.name ?? userEmail ?? "";
    return base.trim()[0]?.toUpperCase() ?? "?";
  }, [profile?.name, userEmail]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) { setError(userError.message); setLoading(false); return; }

      const user = userData.user;
      if (!user) { setLoading(false); return; }

      setUserEmail(user.email ?? null);
      setUserCreatedAt((user as unknown as { created_at?: string }).created_at ?? null);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, bio, rolle, avatar_url, headerbild, website, instagram, linkedin, twitter, erstellt_am")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) { setError(profileError.message); setLoading(false); return; }

      const normalized: ProfileRow = profileData ?? {
        id: user.id,
        name: (user.user_metadata?.name as string | undefined) ?? (user.user_metadata?.full_name as string | undefined) ?? null,
        bio: null, rolle: "Mitglied", avatar_url: null, headerbild: null,
        website: null, instagram: null, linkedin: null, twitter: null, erstellt_am: null,
      };

      setProfile(normalized);
      setEditName(normalized.name ?? "");
      setEditBio(normalized.bio ?? "");
      setEditWebsite(normalized.website ?? "");
      setEditInstagram(normalized.instagram ?? "");
      setEditLinkedin(normalized.linkedin ?? "");
      setEditTwitter(normalized.twitter ?? "");

      // Post-Anzahl laden
      const { data: postsData } = await supabase
        .from("posts")
        .select("id")
        .eq("autor_id", user.id);

      setPostCount((postsData ?? []).length);
      setLoading(false);
    };

    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) { setSaving(false); return; }

    const payload = {
      id: user.id,
      name: editName.trim() || null,
      bio: editBio.trim().slice(0, 200) || null,
      website: editWebsite.trim() || null,
      instagram: editInstagram.trim() || null,
      linkedin: editLinkedin.trim() || null,
      twitter: editTwitter.trim() || null,
    };

    const { data: saved, error: saveError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("id, name, bio, rolle, avatar_url, headerbild, website, instagram, linkedin, twitter, erstellt_am")
      .maybeSingle();

    setSaving(false);
    if (saveError) { setError(saveError.message); return; }

    if (saved) setProfile(saved as ProfileRow);
    else setProfile((prev) => prev ? { ...prev, ...payload } : prev);

    setEditing(false);
    setSuccess("Profil gespeichert.");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setAvatarError("Nur JPG, PNG oder WebP erlaubt."); return; }
    if (file.size > 2 * 1024 * 1024) { setAvatarError("Maximale Dateigröße: 2 MB."); return; }

    setAvatarError(null);
    setUploadingAvatar(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) { setUploadingAvatar(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${user.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
    if (uploadError) { setAvatarError(uploadError.message); setUploadingAvatar(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setUploadingAvatar(false);
    if (updateError) { setAvatarError(updateError.message); return; }

    setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : prev);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setHeaderError("Nur JPG, PNG oder WebP erlaubt."); return; }
    if (file.size > 5 * 1024 * 1024) { setHeaderError("Maximale Dateigröße: 5 MB."); return; }

    setHeaderError(null);
    setUploadingHeader(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) { setUploadingHeader(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `header-${user.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
    if (uploadError) { setHeaderError(uploadError.message); setUploadingHeader(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.from("profiles").update({ headerbild: publicUrl }).eq("id", user.id);
    setUploadingHeader(false);
    if (updateError) { setHeaderError(updateError.message); return; }

    setProfile((prev) => prev ? { ...prev, headerbild: publicUrl } : prev);
    if (headerInputRef.current) headerInputRef.current.value = "";
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
    setSuccess(null);
    setEditName(profile?.name ?? "");
    setEditBio(profile?.bio ?? "");
    setEditWebsite(profile?.website ?? "");
    setEditInstagram(profile?.instagram ?? "");
    setEditLinkedin(profile?.linkedin ?? "");
    setEditTwitter(profile?.twitter ?? "");
  };

  const socialLinks = useMemo(() => {
    const links: { key: string; label: string; url: string; icon: React.ReactNode }[] = [];
    if (profile?.website) links.push({ key: "web", label: profile.website, url: profile.website.startsWith("http") ? profile.website : `https://${profile.website}`, icon: <GlobeIcon /> });
    if (profile?.instagram) links.push({ key: "ig", label: `@${profile.instagram}`, url: `https://instagram.com/${profile.instagram}`, icon: <InstagramIcon /> });
    if (profile?.linkedin) links.push({ key: "li", label: profile.linkedin, url: profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`, icon: <LinkedInIcon /> });
    if (profile?.twitter) links.push({ key: "tw", label: `@${profile.twitter}`, url: `https://x.com/${profile.twitter}`, icon: <XIcon /> });
    return links;
  }, [profile?.website, profile?.instagram, profile?.linkedin, profile?.twitter]);

  return (
<main style={{ position: "relative", zIndex: 1, maxWidth: "720px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Intro */}
          <div style={{ marginBottom: "40px" }}>
            <p style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em",
              textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 22px", opacity: 0.85,
            }}>
              Dein Account
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "52px", fontWeight: 300, lineHeight: 1.1,
              letterSpacing: "0.01em", color: "var(--color-text)", margin: 0,
            }}>
              <em style={{ fontStyle: "italic" }}>Mein Profil</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "22px 0 20px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 400, color: "#7a6d65", lineHeight: 1.75, letterSpacing: "0.01em" }}>
              Verwalte deine persönlichen Daten und Einstellungen.
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <div style={{ marginBottom: "20px", padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: "20px", padding: "13px 16px", borderRadius: "12px", backgroundColor: "#edf7f0", border: "1px solid rgba(22,101,52,0.12)", color: "#166534", fontSize: "14px" }}>
              {success}
            </div>
          )}

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : (
            <div style={{
              backgroundColor: "#fbf8f4",
              border: "1px solid rgba(60,44,36,0.07)",
              borderRadius: "28px",
              boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
              overflow: "visible",
            }}>

              {/* ── Headerbild + Avatar overlap ── */}
              <div style={{ position: "relative" }}>

                {/* Hidden file inputs */}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} style={{ display: "none" }} aria-label="Profilbild hochladen" />
                <input ref={headerInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleHeaderUpload} style={{ display: "none" }} aria-label="Headerbild hochladen" />

                {/* Headerbild */}
                <div
                  className="header-area"
                  style={{ position: "relative", height: "200px", borderRadius: "12px 12px 0 0", overflow: "hidden", cursor: "pointer" }}
                  onClick={() => !uploadingHeader && headerInputRef.current?.click()}
                  title="Headerbild ändern"
                >
                  {profile?.headerbild ? (
                    <img
                      src={profile.headerbild}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: "linear-gradient(135deg, #efe6dc 0%, #f7f2ec 50%, #efe6dc 100%)",
                    }} />
                  )}
                  {/* Header-Upload-Button (sichtbar bei Hover via CSS) */}
                  <div
                    className="header-upload-btn"
                    style={{
                      position: "absolute", top: "14px", right: "14px",
                      backgroundColor: "rgba(255,255,255,0.88)",
                      backdropFilter: "blur(4px)",
                      borderRadius: "50px",
                      padding: "8px 14px",
                      display: "flex", alignItems: "center", gap: "6px",
                      fontSize: "12px", fontWeight: 500, color: "var(--color-text)",
                      pointerEvents: "none",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    {uploadingHeader ? "Lädt…" : "Headerbild ändern"}
                  </div>
                </div>

                {/* Avatar — überlappt Headerbild */}
                <div style={{ position: "absolute", bottom: "-50px", left: "28px", zIndex: 2 }}>
                  <div
                    className="avatar-upload-area"
                    onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                    title="Profilbild ändern"
                    style={{ width: "100px", height: "100px" }}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profilbild"
                        style={{
                          width: "100px", height: "100px", borderRadius: "50%",
                          objectFit: "cover", border: "4px solid #fbf8f4",
                          backgroundColor: "#e8ddd0", display: "block",
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100px", height: "100px", borderRadius: "50%",
                        backgroundColor: "rgba(180,59,50,0.08)", border: "4px solid #fbf8f4",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic", fontSize: "2.4rem", fontWeight: 300, color: "var(--color-primary)",
                      }}>
                        {uploadingAvatar ? "…" : initials}
                      </div>
                    )}
                    <div className="avatar-overlay" aria-hidden>
                      {uploadingAvatar ? (
                        <span style={{ color: "#fff", fontSize: "12px" }}>…</span>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  {avatarError && (
                    <p style={{ fontSize: "11px", color: "var(--color-primary)", margin: "4px 0 0", maxWidth: "100px", lineHeight: 1.3 }}>{avatarError}</p>
                  )}
                </div>
              </div>

              {/* ── Profil-Inhalt ── */}
              <div style={{ padding: "68px 32px 36px" }}>

                {/* Name + Edit-Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "32px", fontWeight: 300,
                      color: "var(--color-text)", lineHeight: 1.15, letterSpacing: "0.01em",
                    }}>
                      {profile?.name || userEmail || "—"}
                    </div>
                    {profile?.rolle && (
                      <div style={{ fontSize: "12px", color: "#9b8f87", marginTop: "4px", letterSpacing: "0.05em" }}>
                        {profile.rolle}
                      </div>
                    )}
                  </div>

                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => { setSuccess(null); setError(null); setEditing(true); }}
                      className="btn-edit"
                      style={{
                        padding: "10px 22px", borderRadius: "50px", border: "none",
                        backgroundColor: "var(--color-primary)", color: "#ffffff",
                        fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em",
                        cursor: "pointer", transition: "background-color 0.2s ease", flexShrink: 0,
                      }}
                    >
                      Profil bearbeiten
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn-cancel"
                      style={{
                        padding: "10px 22px", borderRadius: "50px",
                        border: "1px solid rgba(60,44,36,0.20)", backgroundColor: "transparent",
                        color: "#7a6d65", fontWeight: 500, fontSize: "13px",
                        cursor: "pointer", transition: "border-color 0.2s ease, color 0.2s ease", flexShrink: 0,
                      }}
                    >
                      Abbrechen
                    </button>
                  )}
                </div>

                {/* Bio */}
                {!editing && (
                  <div style={{ fontSize: "14px", color: "#6f625b", lineHeight: 1.75, marginBottom: "20px", maxWidth: "480px" }}>
                    {profile?.bio?.trim() || <span style={{ color: "#b3a89e", fontStyle: "italic" }}>Noch keine Bio hinterlegt.</span>}
                  </div>
                )}

                {/* Statistiken */}
                {!editing && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#9b8f87", marginBottom: "18px", flexWrap: "wrap" }}>
                    <span>
                      <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>{postCount}</strong> {postCount === 1 ? "Beitrag" : "Beiträge"}
                    </span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>Mitglied seit {memberSince}</span>
                  </div>
                )}

                {/* Social Links */}
                {!editing && socialLinks.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
                    {socialLinks.map((link) => (
                      <a
                        key={link.key}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          color: "#6f625b", textDecoration: "none",
                          fontSize: "13px", transition: "color 0.15s ease",
                        }}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* ── Bearbeitungs-Formular ── */}
                {editing && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "24px" }} />

                    <FieldGroup label="Name">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="profil-input"
                        style={inputStyle}
                      />
                    </FieldGroup>

                    <FieldGroup label={`Bio (${editBio.length}/200)`}>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value.slice(0, 200))}
                        rows={3}
                        className="profil-textarea"
                        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                      />
                    </FieldGroup>

                    <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "4px 0 24px" }} />

                    <FieldGroup label="Website">
                      <input
                        type="text"
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        placeholder="z.B. meine-seite.de"
                        className="profil-input"
                        style={inputStyle}
                      />
                    </FieldGroup>

                    <FieldGroup label="Instagram (Nutzername)">
                      <input
                        type="text"
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value.replace(/^@/, ""))}
                        placeholder="nutzername (ohne @)"
                        className="profil-input"
                        style={inputStyle}
                      />
                    </FieldGroup>

                    <FieldGroup label="LinkedIn">
                      <input
                        type="text"
                        value={editLinkedin}
                        onChange={(e) => setEditLinkedin(e.target.value)}
                        placeholder="z.B. in/dein-name oder URL"
                        className="profil-input"
                        style={inputStyle}
                      />
                    </FieldGroup>

                    <FieldGroup label="Twitter / X (Nutzername)">
                      <input
                        type="text"
                        value={editTwitter}
                        onChange={(e) => setEditTwitter(e.target.value.replace(/^@/, ""))}
                        placeholder="nutzername (ohne @)"
                        className="profil-input"
                        style={inputStyle}
                      />
                    </FieldGroup>

                    <div style={{ marginTop: "28px" }}>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-save"
                        style={{
                          padding: "14px 36px", borderRadius: "50px", border: "none",
                          backgroundColor: "var(--color-primary)", color: "#ffffff",
                          fontWeight: 500, fontSize: "14px", letterSpacing: "0.04em",
                          cursor: saving ? "default" : "pointer",
                          opacity: saving ? 0.72 : 1,
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        {saving ? "Speichern…" : "Speichern"}
                      </button>
                    </div>

                    {headerError && (
                      <p style={{ fontSize: "12px", color: "var(--color-primary)", marginTop: "12px" }}>{headerError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: "12px",
  border: "1px solid var(--color-border-strong)", fontSize: "14px",
  fontFamily: "var(--font-body)",
  backgroundColor: "var(--bg-primary)", color: "var(--color-text)",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

function FieldGroup({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em",
        textTransform: "uppercase", marginBottom: "8px", color: "var(--color-text-muted)",
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}