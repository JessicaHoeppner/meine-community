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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: 0,
              color: "#2E2E2E",
            }}
          >
            Community
          </h1>
          <Link
            href="/dashboard/community/neu"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              borderRadius: "999px",
              backgroundColor: "#8B3A3A",
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            Neuen Beitrag erstellen
          </Link>
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
        ) : posts.length === 0 ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
            Noch keine Beitraege vorhanden.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E4E0",
          borderRadius: "16px",
          padding: "18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ color: "#6B6562", fontSize: "0.9rem" }}>{authorName}</div>
          <div style={{ color: "#6B6562", fontSize: "0.9rem" }}>
            {dateLabel} · {commentCount} Kommentare
          </div>
        </div>
        <div style={{ marginTop: "8px", fontWeight: 800, color: "#2E2E2E", fontSize: "1.1rem" }}>
          {post.titel ?? "Ohne Titel"}
        </div>
        <div style={{ marginTop: "8px", color: "#6B6562", lineHeight: 1.6, fontSize: "0.95rem" }}>
          {preview}
        </div>
      </div>
    </Link>
  );
}

