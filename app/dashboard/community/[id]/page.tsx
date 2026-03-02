"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type PostRow = {
  id: string;
  autor_id: string;
  titel: string | null;
  inhalt: string | null;
  erstellt_am: string | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  autor_id: string;
  inhalt: string | null;
  erstellt_am: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
};

export default function CommunityPostPage() {
  return (
    <AuthGuard>
      <CommunityPostInner />
    </AuthGuard>
  );
}

function CommunityPostInner() {
  const params = useParams<{ id: string }>();
  const postId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [post, setPost] = useState<PostRow | null>(null);
  const [author, setAuthor] = useState<ProfileRow | null>(null);

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, ProfileRow>>({});
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const loadComments = async (id: string) => {
    setCommentError(null);
    const { data: commentData, error: commentsError } = await supabase
      .from("comments")
      .select("id, post_id, autor_id, inhalt, erstellt_am")
      .eq("post_id", id)
      .order("erstellt_am", { ascending: true });

    if (commentsError) {
      setCommentError(commentsError.message);
      return;
    }

    const list = (commentData as CommentRow[]) ?? [];
    setComments(list);

    const authorIds = Array.from(new Set(list.map((c) => c.autor_id).filter(Boolean)));
    if (authorIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", authorIds);

      if (!profileError) {
        const map: Record<string, ProfileRow> = {};
        for (const p of (profileData as ProfileRow[]) ?? []) map[p.id] = p;
        setCommentAuthors(map);
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!postId) return;
      setLoading(true);
      setError(null);

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("id, autor_id, titel, inhalt, erstellt_am")
        .eq("id", postId)
        .maybeSingle();

      if (postError) {
        setError(postError.message);
        setLoading(false);
        return;
      }

      const p = (postData as PostRow | null) ?? null;
      setPost(p);
      if (!p) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("id", p.autor_id)
        .maybeSingle();

      setAuthor((profileData as ProfileRow | null) ?? null);

      await loadComments(postId);
      setLoading(false);
    };

    load();
  }, [postId]);

  const dateLabel = useMemo(() => {
    if (!post?.erstellt_am) return "—";
    const d = new Date(post.erstellt_am);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "2-digit" });
  }, [post?.erstellt_am]);

  const handleSendComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!postId) return;
    setCommentError(null);

    if (!commentText.trim()) {
      setCommentError("Bitte schreibe einen Kommentar.");
      return;
    }

    setSending(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setSending(false);
      setCommentError(userError.message);
      return;
    }
    const user = userData.user;
    if (!user) {
      setSending(false);
      return;
    }

    const { error: insertError } = await supabase.from("comments").insert({
      post_id: postId,
      autor_id: user.id,
      inhalt: commentText.trim(),
    });

    setSending(false);

    if (insertError) {
      setCommentError(insertError.message);
      return;
    }

    setCommentText("");
    await loadComments(postId);
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
        <div style={{ marginBottom: "14px" }}>
          <Link
            href="/dashboard/community"
            style={{
              color: "#8B3A3A",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            ← Zurueck zum Feed
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
        ) : !post ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>Beitrag nicht gefunden.</div>
        ) : (
          <>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E4E0",
                borderRadius: "16px",
                padding: "22px",
                marginBottom: "12px",
              }}
            >
              <div style={{ color: "#6B6562", fontSize: "0.9rem", marginBottom: "8px" }}>
                {author?.name ?? "Unbekannt"} · {dateLabel}
              </div>
              <h1 style={{ margin: 0, color: "#2E2E2E", fontSize: "2rem", fontWeight: 800 }}>
                {post.titel ?? "Ohne Titel"}
              </h1>
              <div style={{ marginTop: "14px", color: "#6B6562", lineHeight: 1.7, fontSize: "1rem" }}>
                {(post.inhalt ?? "").trim() || "Kein Inhalt."}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E4E0",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <div style={{ fontWeight: 800, color: "#2E2E2E", fontSize: "1.1rem", marginBottom: "10px" }}>
                Kommentare
              </div>

              {commentError ? (
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
                  {commentError}
                </div>
              ) : null}

              <form onSubmit={handleSendComment} style={{ marginBottom: "14px" }}>
                <textarea
                  value={commentText}
                  onChange={(ev) => setCommentText(ev.target.value)}
                  rows={3}
                  placeholder="Schreibe einen Kommentar..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #E8E4E0",
                    fontSize: "0.95rem",
                    backgroundColor: "#FFFFFF",
                    resize: "vertical",
                    marginBottom: "10px",
                  }}
                />
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#8B3A3A",
                    color: "#FFFFFF",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    cursor: sending ? "default" : "pointer",
                    opacity: sending ? 0.85 : 1,
                  }}
                >
                  {sending ? "Sende..." : "Kommentar senden"}
                </button>
              </form>

              {comments.length === 0 ? (
                <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
                  Noch keine Kommentare.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {comments.map((c) => (
                    <CommentCard
                      key={c.id}
                      comment={c}
                      authorName={commentAuthors[c.autor_id]?.name ?? "Unbekannt"}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function CommentCard({
  comment,
  authorName,
}: Readonly<{ comment: CommentRow; authorName: string }>) {
  const dateLabel = useMemo(() => {
    if (!comment.erstellt_am) return "—";
    const d = new Date(comment.erstellt_am);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { year: "numeric", month: "short", day: "2-digit" });
  }, [comment.erstellt_am]);

  return (
    <div
      style={{
        backgroundColor: "#FAF7F3",
        border: "1px solid #E8E4E0",
        borderRadius: "12px",
        padding: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ color: "#6B6562", fontSize: "0.9rem" }}>{authorName}</div>
        <div style={{ color: "#6B6562", fontSize: "0.9rem" }}>{dateLabel}</div>
      </div>
      <div style={{ marginTop: "8px", color: "#2E2E2E", lineHeight: 1.6, fontSize: "0.95rem" }}>
        {(comment.inhalt ?? "").trim() || "—"}
      </div>
    </div>
  );
}

