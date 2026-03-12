"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type PostRow = {
  id: string;
  autor_id: string;
  titel: string | null;
  inhalt: string | null;
  erstellt_am: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
};

export default function CommunityFeedPage() {
  return (
    <AuthGuard>
      <CommunityFeedInner />
    </AuthGuard>
  );
}

function CommunityFeedInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, ProfileRow>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("id, autor_id, titel, inhalt, erstellt_am")
        .order("erstellt_am", { ascending: false });

      if (postError) {
        setError(postError.message);
        setLoading(false);
        return;
      }

      const postList = (postData as PostRow[]) ?? [];
      setPosts(postList);

      const authorIds = Array.from(new Set(postList.map((p) => p.autor_id).filter(Boolean)));
      if (authorIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", authorIds);

        if (!profileError) {
          const map: Record<string, ProfileRow> = {};
          for (const p of (profileData as ProfileRow[]) ?? []) map[p.id] = p;
          setAuthors(map);
        }
      }

      const postIds = postList.map((p) => p.id);
      if (postIds.length > 0) {
        const { data: commentData, error: commentError } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);

        if (!commentError) {
          const counts: Record<string, number> = {};
          for (const row of (commentData as Array<{ post_id: string }>) ?? []) {
            counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
          }
          setCommentCounts(counts);
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        .post-card:hover { border-color: rgba(180,59,50,0.35) !important; box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important; }
        .post-card:hover .post-card-title { color: #b43b32 !important; }
        .post-card:hover .post-card-arrow { color: #b43b32 !important; opacity: 1 !important; }
        .new-post-btn:hover { background-color: #9f3129 !important; }
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

        <main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Intro */}
          <div style={{ marginBottom: "56px" }}>
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
              Austausch & Vernetzung
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "52px",
                  fontWeight: 300,
                  lineHeight: 1.1,
                  letterSpacing: "0.01em",
                  color: "#3c2c24",
                  margin: 0,
                }}>
                  <em style={{ fontStyle: "italic" }}>Community</em>
                </h1>
                <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "20px 0 18px", opacity: 0.4 }} />
                <p style={{
                  margin: 0,
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "15px",
                  fontWeight: 400,
                  color: "#7a6d65",
                  lineHeight: 1.75,
                  letterSpacing: "0.01em",
                  maxWidth: "360px",
                }}>
                  Stell Fragen, teile Erfahrungen und wachse gemeinsam.
                </p>
              </div>
              <Link
                href="/dashboard/community/neu"
                className="new-post-btn"
                style={{
                  display: "inline-block",
                  padding: "14px 28px",
                  borderRadius: "50px",
                  backgroundColor: "#b43b32",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  letterSpacing: "0.04em",
                  transition: "background-color 0.2s ease",
                  flexShrink: 0,
                  marginTop: "8px",
                }}
              >
                + Neuen Beitrag erstellen
              </Link>
            </div>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ color: "#9b8f87", fontSize: "15px", lineHeight: 1.75 }}>
              Noch keine Beiträge vorhanden.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  authorName={authors[post.autor_id]?.name ?? "Unbekannt"}
                  commentCount={commentCounts[post.id] ?? 0}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function PostCard({
  post,
  authorName,
  commentCount,
}: Readonly<{
  post: PostRow;
  authorName: string;
  commentCount: number;
}>) {
  const preview = useMemo(() => {
    const text = (post.inhalt ?? "").trim();
    if (!text) return "Kein Inhalt.";
    if (text.length <= 200) return text;
    return `${text.slice(0, 200)}...`;
  }, [post.inhalt]);

  const dateLabel = useMemo(() => {
    if (!post.erstellt_am) return "—";
    const d = new Date(post.erstellt_am);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { year: "numeric", month: "short", day: "2-digit" });
  }, [post.erstellt_am]);

  return (
    <Link
      href={`/dashboard/community/${post.id}`}
      className="post-card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        backgroundColor: "#fbf8f4",
        border: "1px solid rgba(60,44,36,0.07)",
        borderRadius: "24px",
        padding: "26px 28px 22px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
      }}
    >
      {/* Meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Avatar-Initiale */}
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "rgba(60,44,36,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "14px",
            color: "#7a6d65",
            flexShrink: 0,
          }}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, color: "#3c2c24", fontSize: "13px" }}>
            {authorName}
          </span>
        </div>
        <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "12px", letterSpacing: "0.01em" }}>
          {dateLabel} · {commentCount} {commentCount === 1 ? "Kommentar" : "Kommentare"}
        </div>
      </div>

      {/* Trennlinie */}
      <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "16px" }} />

      {/* Titel — Cormorant Garamond für editoriales Feeling */}
      <div
        className="post-card-title"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 400,
          fontStyle: "italic",
          color: "#3c2c24",
          fontSize: "22px",
          lineHeight: 1.25,
          marginBottom: "10px",
          transition: "color 0.2s ease",
          letterSpacing: "0.01em",
        }}
      >
        {post.titel ?? "Ohne Titel"}
      </div>

      {/* Vorschau */}
      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#9b8f87", lineHeight: 1.7, fontSize: "14px", flexGrow: 1 }}>
        {preview}
      </div>

      {/* Arrow */}
      <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
        <span className="post-card-arrow" style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase", color: "#c5b8ae", transition: "color 0.2s ease", opacity: 0.8 }}>
          Lesen →
        </span>
      </div>
    </Link>
  );
}
