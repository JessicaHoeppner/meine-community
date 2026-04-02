"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type RanglisteEntry = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  posts: number;
  module: number;
  kommentare: number;
  score: number;
};

export default function RanglistePage() {
  return (
    <AuthGuard>
      <RanglisteInner />
    </AuthGuard>
  );
}

function RanglisteInner() {
  const [entries, setEntries] = useState<RanglisteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id ?? null);

      // Parallel: Profile, Posts, Module, Kommentare
      const [
        { data: profileData },
        { data: postData },
        { data: moduleData },
        { data: commentData },
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, avatar_url"),
        supabase.from("posts").select("autor_id"),
        supabase.from("module_progress").select("nutzer_id").eq("erledigt", true),
        supabase.from("comments").select("autor_id"),
      ]);

      const profiles = (profileData ?? []) as { id: string; name: string | null; avatar_url: string | null }[];

      // Zählen per Nutzer
      const postCounts: Record<string, number> = {};
      for (const row of (postData ?? []) as { autor_id: string }[]) {
        postCounts[String(row.autor_id)] = (postCounts[String(row.autor_id)] ?? 0) + 1;
      }

      const moduleCounts: Record<string, number> = {};
      for (const row of (moduleData ?? []) as { nutzer_id: string }[]) {
        moduleCounts[String(row.nutzer_id)] = (moduleCounts[String(row.nutzer_id)] ?? 0) + 1;
      }

      const commentCounts: Record<string, number> = {};
      for (const row of (commentData ?? []) as { autor_id: string }[]) {
        commentCounts[String(row.autor_id)] = (commentCounts[String(row.autor_id)] ?? 0) + 1;
      }

      const ranked: RanglisteEntry[] = profiles
        .map((p) => {
          const posts = postCounts[String(p.id)] ?? 0;
          const module = moduleCounts[String(p.id)] ?? 0;
          const kommentare = commentCounts[String(p.id)] ?? 0;
          const score = module * 10 + posts * 5 + kommentare * 2;
          return { id: p.id, name: p.name, avatar_url: p.avatar_url, posts, module, kommentare, score };
        })
        .sort((a, b) => b.score - a.score);

      setEntries(ranked);
      setLoading(false);
    };
    load();
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Reihenfolge für Top-3-Podest: Platz 2 links, Platz 1 Mitte, Platz 3 rechts
  const podestOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podestConfig: Record<number, { size: number; border: string; lift: number; rank: number }> = {
    0: { size: 64, border: "#a8a8a8", lift: 0,   rank: 2 },
    1: { size: 80, border: "#d4a853", lift: -20, rank: 1 },
    2: { size: 64, border: "#cd7f32", lift: 0,   rank: 3 },
  };

  return (
        <main style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 24px 100px" }}>

          {/* Zurück */}
          <Link
            href="/dashboard/mitglieder"
            className="back-link"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#9b8f87", fontSize: "13px", fontWeight: 500, textDecoration: "none", marginBottom: "40px", letterSpacing: "0.02em", transition: "opacity 0.15s ease" }}
          >
            ← Zurück
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "56px", textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "52px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "var(--color-text)", margin: "0 0 16px" }}>
              <em>Rangliste</em>
            </h1>
            <p style={{ margin: 0, fontSize: "15px", color: "#6f625b", lineHeight: 1.7 }}>
              Die aktivsten Mitglieder unserer Community
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#9b8f87", fontSize: "15px", textAlign: "center" }}>Laden…</div>
          ) : (
            <>
              {/* ── Top 3 Podest ── */}
              {top3.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "32px", marginBottom: "56px" }}>
                  {podestOrder.map((entry, idx) => {
                    if (!entry) return null;
                    const cfg = podestConfig[idx];
                    const isMe = String(entry.id) === String(currentUserId ?? "");
                    const initial = (entry.name ?? "?")[0]?.toUpperCase() ?? "?";
                    return (
                      <div
                        key={entry.id}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transform: `translateY(${cfg.lift}px)` }}
                      >
                        {/* Rang-Badge */}
                        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "12px", fontWeight: 600, color: cfg.border, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          #{cfg.rank}
                        </div>

                        {/* Avatar */}
                        <div style={{ width: cfg.size, height: cfg.size, borderRadius: "50%", border: `3px solid ${cfg.border}`, overflow: "hidden", backgroundColor: "#ede5dc", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isMe ? "0 0 0 3px rgba(180,59,50,0.15)" : "none" }}>
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: cfg.size * 0.38, fontWeight: 300, color: "#9b8f87" }}>
                              {initial}
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 600, fontSize: cfg.rank === 1 ? "16px" : "14px", color: isMe ? "#b43b32" : "#3c2c24", textAlign: "center", maxWidth: "120px", lineHeight: 1.3 }}>
                          {entry.name ?? "Unbekannt"}
                        </div>

                        {/* Score */}
                        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: cfg.rank === 1 ? "28px" : "22px", fontWeight: 300, color: cfg.border, lineHeight: 1 }}>
                          {entry.score}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9b8f87", letterSpacing: "0.06em", textTransform: "uppercase" }}>Punkte</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Ab Platz 4 ── */}
              {rest.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {rest.map((entry, idx) => {
                    const rank = idx + 4;
                    const isMe = String(entry.id) === String(currentUserId ?? "");
                    const initial = (entry.name ?? "?")[0]?.toUpperCase() ?? "?";
                    return (
                      <div
                        key={entry.id}
                        className="rank-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          backgroundColor: isMe ? "rgba(180,59,50,0.05)" : "#fbf8f4",
                          border: `1px solid ${isMe ? "rgba(180,59,50,0.15)" : "rgba(60,44,36,0.08)"}`,
                          borderRadius: "8px",
                          padding: "14px 18px",
                          boxShadow: "0 1px 8px rgba(60,44,36,0.04)",
                          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                        }}
                      >
                        {/* Rang */}
                        <div style={{ width: "32px", flexShrink: 0, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", fontWeight: 600, color: "#9b8f87", textAlign: "center" }}>
                          {rank}
                        </div>

                        {/* Avatar */}
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#ede5dc", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "15px", fontWeight: 300, color: "#9b8f87" }}>
                              {initial}
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <div style={{ flex: 1, fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: isMe ? 600 : 500, fontSize: "15px", color: isMe ? "#b43b32" : "#3c2c24" }}>
                          {entry.name ?? "Unbekannt"}
                        </div>

                        {/* Badges */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <BadgeChip label={`${entry.module} Module`} />
                          <BadgeChip label={`${entry.posts} Posts`} />
                          <BadgeChip label={`${entry.kommentare} Kommentare`} />
                        </div>

                        {/* Score */}
                        <div style={{ flexShrink: 0, minWidth: "56px", textAlign: "right" }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 300, color: "var(--color-text)", lineHeight: 1 }}>
                            {entry.score}
                          </div>
                          <div style={{ fontSize: "10px", color: "#9b8f87", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pkt.</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {entries.length === 0 && (
                <div style={{ color: "#9b8f87", fontSize: "15px", textAlign: "center" }}>Noch keine Daten vorhanden.</div>
              )}
            </>
          )}
        </main>
  );
}

function BadgeChip({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: "12px",
      color: "#6f625b",
      backgroundColor: "rgba(60,44,36,0.06)",
      borderRadius: "50px",
      padding: "3px 10px",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}