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
          Mitglieder
        </h1>

        <div style={{ marginBottom: "18px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nach Name suchen..."
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #E8E4E0",
              fontSize: "0.95rem",
              backgroundColor: "#FFFFFF",
            }}
          />
        </div>

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
            }}
          >
            {error}
          </div>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "20px",
            }}
          >
            {filtered.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </section>
        )}
      </main>
    </div>
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
      style={{
        backgroundColor: "#FAF7F3",
        border: "1px solid #E8E4E0",
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt="Profilbild"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "999px",
              objectFit: "cover",
              border: "1px solid #E8E4E0",
              backgroundColor: "#E8E4E0",
            }}
          />
        ) : (
          <div
            aria-label="Profilbild Platzhalter"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "999px",
              backgroundColor: "#E8E4E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B6562",
              fontSize: "1.05rem",
              fontWeight: 700,
              border: "1px solid #E8E4E0",
            }}
          >
            {initials}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "#2E2E2E" }}>
            {member.name || "Unbekannt"}
          </div>
          <div
            style={{
              color: "#6B6562",
              fontSize: "0.9rem",
              lineHeight: 1.5,
              marginTop: "4px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {member.bio?.trim() ? member.bio : "Keine Bio vorhanden."}
          </div>
        </div>
      </div>
    </div>
  );
}

