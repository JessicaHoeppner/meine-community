"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type MemberRow = {
  id: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function MitgliederPage() {
  return (
    <AuthGuard>
      <MitgliederInner />
    </AuthGuard>
  );
}

function MitgliederInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error: membersError } = await supabase
        .from("profiles")
        .select("id, name, bio, avatar_url")
        .order("erstellt_am", { ascending: false });

      if (membersError) {
        setError(membersError.message);
        setLoading(false);
        return;
      }

      setMembers((data as MemberRow[]) ?? []);
      setLoading(false);
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => (m.name ?? "").toLowerCase().includes(q));
  }, [members, query]);

  return (
<main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Intro */}
          <div style={{ marginBottom: "48px" }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              margin: "0 0 22px",
              opacity: 0.85,
            }}>
              Deine Community
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "52px",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              color: "var(--color-text)",
              margin: 0,
            }}>
              <em style={{ fontStyle: "italic" }}>Mitglieder</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "22px 0 20px", opacity: 0.4 }} />
            <p style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              fontWeight: 400,
              color: "#7a6d65",
              lineHeight: 1.75,
              letterSpacing: "0.01em",
              maxWidth: "380px",
            }}>
              Entdecke andere Mitglieder und ihre Profile.
            </p>
          </div>

          {/* Rangliste Link */}
          <div style={{ marginBottom: "32px" }}>
            <a
              href="/dashboard/mitglieder/rangliste"
              className="rangliste-link"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "14px",
                color: "var(--color-primary)",
                textDecoration: "none",
                transition: "opacity 0.15s ease",
              }}
            >
              Rangliste anzeigen →
            </a>
          </div>

          {/* Search */}
          <div style={{ marginBottom: "40px" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nach Name suchen…"
              className="search-input"
              style={{
                width: "100%",
                maxWidth: "380px",
                padding: "14px 20px",
                borderRadius: "50px",
                border: "1px solid var(--color-border-strong)",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--color-text)",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            />
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px" }}>
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ color: "#9b8f87", fontSize: "15px" }}>Keine Mitglieder gefunden.</div>
          ) : (
            <section
              className="members-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "16px",
                alignItems: "stretch",
              }}
            >
              {filtered.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </section>
          )}
        </main>
  );
}

function MemberCard({ member }: Readonly<{ member: MemberRow }>) {
  const initials = useMemo(() => {
    const trimmed = (member.name ?? "").trim();
    if (!trimmed) return "?";
    return trimmed[0]?.toUpperCase() ?? "?";
  }, [member.name]);

  return (
    <div
      className="member-card"
      style={{
        backgroundColor: "#fbf8f4",
        border: "1px solid rgba(60,44,36,0.07)",
        borderRadius: "24px",
        padding: "24px 22px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
      }}
    >
      <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt="Profilbild"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #E8DDD0",
              backgroundColor: "#E8DDD0",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            aria-label="Profilbild Platzhalter"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(180,59,50,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "1.3rem",
              fontWeight: 300,
              border: "2px solid #E8DDD0",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}

        <div
          className="member-name"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            color: "var(--color-text)",
            fontSize: "15px",
            lineHeight: 1.3,
            transition: "color 0.2s ease",
          }}
        >
          {member.name || "Unbekannt"}
        </div>
      </div>

      {/* Trennlinie */}
      <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "12px" }} />

      <div
        style={{
          fontFamily: "var(--font-body)",
          color: "#9b8f87",
          fontSize: "13px",
          lineHeight: 1.6,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {member.bio?.trim() ? member.bio : "Keine Bio vorhanden."}
      </div>
    </div>
  );
}