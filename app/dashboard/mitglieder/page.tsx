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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');

        .member-card:hover {
          border-color: rgba(180,59,50,0.35) !important;
          box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important;
        }
        .member-card:hover .member-name { color: #b43b32 !important; }
        .search-input:focus {
          outline: none;
          border-color: #c9896e !important;
          box-shadow: 0 0 0 3px rgba(180,59,50,0.05) !important;
        }

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

        @media (max-width: 640px) {
          .members-grid { grid-template-columns: 1fr !important; }
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

        <main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>

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
              Deine Community
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
              <em style={{ fontStyle: "italic" }}>Mitglieder</em>
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
              maxWidth: "380px",
            }}>
              Entdecke andere Mitglieder und ihre Profile.
            </p>
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
                border: "1px solid #ddd5c6",
                fontSize: "14px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                backgroundColor: "#f7f1e8",
                color: "#3c2c24",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            />
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>
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
      </div>
    </>
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
              color: "#b43b32",
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
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontWeight: 600,
            color: "#3c2c24",
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
          fontFamily: "'Manrope', system-ui, sans-serif",
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
