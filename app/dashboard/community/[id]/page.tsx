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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');

        .comment-textarea:focus {
          outline: none;
          border-color: #c9896e !important;
          box-shadow: 0 0 0 3px rgba(180,59,50,0.05) !important;
        }
        .submit-btn:hover:not(:disabled) { background-color: #9f3129 !important; }
        .back-link:hover { color: #9f3129 !important; }
        .comment-card:hover { border-color: rgba(180,59,50,0.30) !important; }

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

          {/* Zurück */}
          <div style={{ marginBottom: "32px" }}>
            <Link href="/dashboard/community" className="back-link" style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              color: "#b43b32",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "14px",
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}>
              ← Zurück zum Feed
            </Link>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>
              {error}
            </div>
          ) : !post ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Beitrag nicht gefunden.</div>
          ) : (
            <>
              {/* Post-Card */}
              <div style={{
                backgroundColor: "#fbf8f4",
                border: "1px solid rgba(60,44,36,0.07)",
                borderRadius: "28px",
                padding: "40px 40px 36px",
                boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
                marginBottom: "20px",
              }}>
                {/* Meta */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(60,44,36,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "16px",
                      color: "#7a6d65",
                      flexShrink: 0,
                    }}>
                      {(author?.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, color: "#3c2c24", fontSize: "14px" }}>
                      {author?.name ?? "Unbekannt"}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "12px", letterSpacing: "0.01em" }}>
                    {dateLabel}
                  </span>
                </div>

                {/* Titel */}
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "38px",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  color: "#3c2c24",
                  margin: 0,
                }}>
                  <em style={{ fontStyle: "italic" }}>{post.titel ?? "Ohne Titel"}</em>
                </h1>

                <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "18px 0 20px", opacity: 0.35 }} />

                {/* Inhalt */}
                <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#6f625b", lineHeight: 1.8, fontSize: "15px" }}>
                  {(post.inhalt ?? "").trim() || "Kein Inhalt."}
                </div>
              </div>

              {/* Kommentare-Card */}
              <div style={{
                backgroundColor: "#fbf8f4",
                border: "1px solid rgba(60,44,36,0.07)",
                borderRadius: "28px",
                padding: "36px 40px 32px",
                boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
              }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "26px",
                  fontWeight: 300,
                  letterSpacing: "0.01em",
                  color: "#3c2c24",
                  margin: "0 0 24px",
                }}>
                  <em style={{ fontStyle: "italic" }}>Kommentare</em>
                </h2>

                {commentError ? (
                  <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px", marginBottom: "16px" }}>
                    {commentError}
                  </div>
                ) : null}

                {/* Kommentar-Formular */}
                <form onSubmit={handleSendComment} style={{ marginBottom: "28px" }}>
                  <textarea
                    value={commentText}
                    onChange={(ev) => setCommentText(ev.target.value)}
                    rows={3}
                    placeholder="Schreibe einen Kommentar…"
                    className="comment-textarea"
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
                      marginBottom: "12px",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      lineHeight: 1.65,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="submit-btn"
                    style={{
                      padding: "13px 28px",
                      borderRadius: "50px",
                      border: "none",
                      backgroundColor: "#b43b32",
                      color: "#ffffff",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      letterSpacing: "0.04em",
                      cursor: sending ? "default" : "pointer",
                      opacity: sending ? 0.72 : 1,
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {sending ? "Sende…" : "Kommentar senden"}
                  </button>
                </form>

                {/* Trennlinie */}
                <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "20px" }} />

                {/* Kommentar-Liste */}
                {comments.length === 0 ? (
                  <div style={{ color: "#9b8f87", fontSize: "14px" }}>Noch keine Kommentare.</div>
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
    </>
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
    <div className="comment-card" style={{
      backgroundColor: "#f7f2eb",
      border: "1px solid rgba(60,44,36,0.06)",
      borderRadius: "16px",
      padding: "16px 20px",
      transition: "border-color 0.2s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            backgroundColor: "rgba(60,44,36,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontSize: "13px",
            color: "#7a6d65",
            flexShrink: 0,
          }}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, color: "#3c2c24", fontSize: "13px" }}>{authorName}</span>
        </div>
        <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "12px" }}>{dateLabel}</div>
      </div>
      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#6f625b", lineHeight: 1.65, fontSize: "14px" }}>
        {(comment.inhalt ?? "").trim() || "—"}
      </div>
    </div>
  );
}
