"use client";

import { useEffect, useMemo, useState } from "react";
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#2E2E2E",
          }}
        >
          Mein Profil
        </h1>

        {loading ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>Laden...</div>
        ) : (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8E4E0",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            {error && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#FEE2E2",
                  color: "#B91C1C",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  marginBottom: "16px",
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

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profilbild"
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "999px",
                    objectFit: "cover",
                    border: "1px solid #E8E4E0",
                    backgroundColor: "#E8E4E0",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "999px",
                    backgroundColor: "#E8E4E0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6B6562",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    border: "1px solid #E8E4E0",
                  }}
                  aria-label="Profilbild Platzhalter"
                >
                  {initials}
                </div>
              )}

              <div style={{ flex: "1 1 auto", minWidth: "220px" }}>
                <div style={{ color: "#6B6562", fontSize: "0.85rem" }}>Name</div>
                <div style={{ color: "#2E2E2E", fontSize: "1.15rem", fontWeight: 700 }}>
                  {profile?.name || userEmail || "—"}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(null);
                      setError(null);
                      setEditing(true);
                    }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "999px",
                      border: "none",
                      backgroundColor: "#8B3A3A",
                      color: "#FFFFFF",
                      fontWeight: 500,
                      cursor: "pointer",
                      height: "40px",
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
                    style={{
                      padding: "10px 16px",
                      borderRadius: "999px",
                      border: "1px solid #E8E4E0",
                      backgroundColor: "#FFFFFF",
                      color: "#2E2E2E",
                      fontWeight: 500,
                      cursor: "pointer",
                      height: "40px",
                    }}
                  >
                    Abbrechen
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <InfoBox label="Rolle" value={profile?.rolle ?? "Mitglied"} />
              <InfoBox label="Mitglied seit" value={memberSince} />
              <InfoBox label="E-Mail" value={userEmail ?? "—"} />
            </div>

            {!editing ? (
              <div>
                <div style={{ color: "#6B6562", fontSize: "0.85rem", marginBottom: "6px" }}>
                  Bio
                </div>
                <div style={{ color: "#2E2E2E", lineHeight: 1.7, fontSize: "0.95rem" }}>
                  {profile?.bio?.trim() ? profile.bio : "Noch keine Bio hinterlegt."}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="editName"
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      marginBottom: "6px",
                      color: "#2E2E2E",
                    }}
                  >
                    Name
                  </label>
                  <input
                    id="editName"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #E8E4E0",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label
                    htmlFor="editBio"
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      marginBottom: "6px",
                      color: "#2E2E2E",
                    }}
                  >
                    Bio
                  </label>
                  <textarea
                    id="editBio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #E8E4E0",
                      fontSize: "0.95rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#8B3A3A",
                    color: "#FFFFFF",
                    fontWeight: 500,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.85 : 1,
                    height: "40px",
                  }}
                >
                  {saving ? "Speichern..." : "Speichern"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoBox({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div
      style={{
        backgroundColor: "#FAF7F3",
        border: "1px solid #E8E4E0",
        borderRadius: "12px",
        padding: "12px 14px",
      }}
    >
      <div style={{ color: "#6B6562", fontSize: "0.8rem", marginBottom: "6px" }}>{label}</div>
      <div style={{ color: "#2E2E2E", fontSize: "0.95rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

