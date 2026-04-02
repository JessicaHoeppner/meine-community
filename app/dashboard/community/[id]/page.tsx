"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
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

/*
 * Hinweis: In Supabase muss die Tabelle "reports" angelegt werden:
 * CREATE TABLE reports (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   melder_id uuid REFERENCES auth.users(id),
 *   post_id uuid REFERENCES posts(id),
 *   comment_id uuid REFERENCES comments(id),
 *   grund text,
 *   status text DEFAULT 'offen',  -- offen, bearbeitet, abgelehnt
 *   erstellt_am timestamptz DEFAULT now()
 * );
 */

export default function CommunityPostPage() {
  return (
    <AuthGuard>
      <CommunityPostInner />
    </AuthGuard>
  );
}

function CommunityPostInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const postId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [post, setPost] = useState<PostRow | null>(null);
  const [author, setAuthor] = useState<ProfileRow | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitel, setEditTitel] = useState("");
  const [editInhalt, setEditInhalt] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, ProfileRow>>({});
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Likes & Bookmarks
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [isPostBookmarked, setIsPostBookmarked] = useState(false);
  const [commentLikeCounts, setCommentLikeCounts] = useState<Record<string, number>>({});
  const [myLikedComments, setMyLikedComments] = useState<Set<string>>(new Set());

  const REPORT_REASONS = [
    "Beleidigung oder Hassrede",
    "Spam oder Werbung",
    "Unangemessener Inhalt",
    "Falschinformationen",
    "Belästigung",
    "Sonstiges",
  ] as const;

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; commentId?: string } | null>(null);
  const [reportSelectedReason, setReportSelectedReason] = useState<string | null>(null);
  const [reportSonstigesText, setReportSonstigesText] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [reportToastVisible, setReportToastVisible] = useState(false);

  const isAuthor = Boolean(currentUserId && post?.autor_id === currentUserId);

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

    // Lade Kommentar-Likes
    const commentIds = list.map((c) => c.id);
    if (commentIds.length > 0) {
      const { data: likeData } = await supabase
        .from("likes")
        .select("comment_id, nutzer_id")
        .in("comment_id", commentIds)
        .is("post_id", null);

      if (likeData) {
        const counts: Record<string, number> = {};
        for (const row of likeData as Array<{ comment_id: string; nutzer_id: string }>) {
          counts[row.comment_id] = (counts[row.comment_id] ?? 0) + 1;
        }
        setCommentLikeCounts(counts);
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        // Post-Likes laden
        const { data: postLikes } = await supabase
          .from("likes")
          .select("nutzer_id")
          .eq("post_id", postId)
          .is("comment_id", null);

        if (postLikes) {
          const rows = postLikes as Array<{ nutzer_id: string }>;
          setPostLikeCount(rows.length);
          setIsPostLiked(rows.some((r) => r.nutzer_id === user.id));
        }

        // Bookmark laden
        const { data: bmData } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("nutzer_id", user.id)
          .eq("post_id", postId)
          .maybeSingle();

        setIsPostBookmarked(!!bmData);

        // Eigene Kommentar-Likes laden (nach loadComments)
        // werden nach loadComments gesetzt
      }

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

      const openEdit = searchParams?.get("bearbeiten") === "1" && user?.id === p.autor_id;
      if (openEdit) {
        setIsEditing(true);
        setEditTitel((p.titel ?? "").trim());
        setEditInhalt((p.inhalt ?? "").trim());
      }

      await loadComments(postId);

      // Eigene Kommentar-Likes
      if (user) {
        const { data: myLikes } = await supabase
          .from("likes")
          .select("comment_id")
          .eq("nutzer_id", user.id)
          .is("post_id", null);

        if (myLikes) {
          setMyLikedComments(new Set(myLikes.map((l: { comment_id: string }) => l.comment_id)));
        }
      }

      setLoading(false);
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, searchParams]);

  const togglePostLike = useCallback(async () => {
    if (!currentUserId || !postId) return;
    setIsPostLiked((prev) => !prev);
    setPostLikeCount((prev) => Math.max(0, prev + (isPostLiked ? -1 : 1)));
    if (isPostLiked) {
      await supabase.from("likes").delete().eq("nutzer_id", currentUserId).eq("post_id", postId).is("comment_id", null);
    } else {
      await supabase.from("likes").insert({ nutzer_id: currentUserId, post_id: postId, comment_id: null });
    }
  }, [currentUserId, postId, isPostLiked]);

  const togglePostBookmark = useCallback(async () => {
    if (!currentUserId || !postId) return;
    setIsPostBookmarked((prev) => !prev);
    if (isPostBookmarked) {
      await supabase.from("bookmarks").delete().eq("nutzer_id", currentUserId).eq("post_id", postId);
    } else {
      await supabase.from("bookmarks").insert({ nutzer_id: currentUserId, post_id: postId });
    }
  }, [currentUserId, postId, isPostBookmarked]);

  const toggleCommentLike = useCallback(async (commentId: string) => {
    if (!currentUserId) return;
    const isLiked = myLikedComments.has(commentId);
    setMyLikedComments((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    setCommentLikeCounts((prev) => ({
      ...prev,
      [commentId]: Math.max(0, (prev[commentId] ?? 0) + (isLiked ? -1 : 1)),
    }));
    if (isLiked) {
      await supabase.from("likes").delete().eq("nutzer_id", currentUserId).eq("comment_id", commentId).is("post_id", null);
    } else {
      await supabase.from("likes").insert({ nutzer_id: currentUserId, comment_id: commentId, post_id: null });
    }
  }, [currentUserId, myLikedComments]);

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

  // Icon-Hilfsfunktionen
  const HeartIcon = ({ filled, size = 15 }: { filled: boolean; size?: number }) => filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );

  const BookmarkIcon = ({ filled, size = 15 }: { filled: boolean; size?: number }) => filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3h14a1 1 0 0 1 1 1v17.438a.5.5 0 0 1-.757.429L12 18.23l-7.243 3.637A.5.5 0 0 1 4 21.438V4a1 1 0 0 1 1-1z"/>
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );

  return (
<main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Zurück */}
          <div style={{ marginBottom: "32px" }}>
            <Link href="/dashboard/community" className="back-link" style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-primary)",
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
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px" }}>
              {error}
            </div>
          ) : !post ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Beitrag nicht gefunden.</div>
          ) : (
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
                      width: "32px", height: "32px", borderRadius: "50%",
                      backgroundColor: "rgba(60,44,36,0.08)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: "italic", fontSize: "16px", color: "#7a6d65", flexShrink: 0,
                    }}>
                      {(author?.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-text)", fontSize: "14px" }}>
                      {author?.name ?? "Unbekannt"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {isAuthor && !isEditing && (
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => {
                          setIsEditing(true);
                          setEditTitel((post.titel ?? "").trim());
                          setEditInhalt((post.inhalt ?? "").trim());
                          setSaveError(null);
                        }}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#9b8f87", background: "none", border: "none", padding: 0, cursor: "pointer", transition: "color 0.2s ease" }}
                        title="Beitrag bearbeiten"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    )}
                    {!isAuthor && currentUserId && (
                      <button
                        type="button"
                        className="report-flag-btn"
                        onClick={() => {
                          setReportTarget({ type: "post" });
                          setReportSelectedReason(null);
                          setReportSonstigesText("");
                          setReportModalOpen(true);
                        }}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#9b8f87", background: "none", border: "none", padding: 0, cursor: "pointer", transition: "color 0.2s ease" }}
                        title="Beitrag melden"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      </button>
                    )}

                    {/* Post Like */}
                    {currentUserId && (
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={togglePostLike}
                        title={isPostLiked ? "Like entfernen" : "Gefällt mir"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          background: "none", border: "none", cursor: "pointer", padding: 0,
                          color: isPostLiked ? "#b43b32" : "#6f625b",
                          fontFamily: "var(--font-body)",
                          fontSize: "13px", fontWeight: 500,
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        <HeartIcon filled={isPostLiked} />
                        {postLikeCount > 0 && <span>{postLikeCount}</span>}
                      </button>
                    )}

                    {/* Post Bookmark */}
                    {currentUserId && (
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={togglePostBookmark}
                        title={isPostBookmarked ? "Gespeichert entfernen" : "Beitrag speichern"}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          background: "none", border: "none", cursor: "pointer", padding: 0,
                          color: isPostBookmarked ? "#b43b32" : "#6f625b",
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        <BookmarkIcon filled={isPostBookmarked} />
                      </button>
                    )}

                    <span style={{ fontFamily: "var(--font-body)", color: "#b3a89e", fontSize: "12px", letterSpacing: "0.01em" }}>
                      {dateLabel}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editTitel}
                      onChange={(e) => setEditTitel(e.target.value)}
                      placeholder="Titel"
                      style={{
                        width: "100%", padding: "14px 18px", borderRadius: "12px",
                        border: "1px solid var(--color-border-strong)", fontSize: "18px",
                        fontFamily: "var(--font-body)",
                        backgroundColor: "var(--bg-primary)", color: "var(--color-text)",
                        marginBottom: "16px", boxSizing: "border-box",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      }}
                    />
                    <textarea
                      className="edit-textarea"
                      value={editInhalt}
                      onChange={(e) => setEditInhalt(e.target.value)}
                      placeholder="Inhalt"
                      rows={8}
                      style={{
                        width: "100%", padding: "14px 18px", borderRadius: "12px",
                        border: "1px solid var(--color-border-strong)", fontSize: "15px",
                        fontFamily: "var(--font-body)",
                        backgroundColor: "var(--bg-primary)", color: "var(--color-text)",
                        lineHeight: 1.7, resize: "vertical", marginBottom: "20px",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      }}
                    />
                    {saveError && (
                      <div style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px", marginBottom: "16px" }}>
                        {saveError}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn-save"
                        disabled={saveLoading}
                        onClick={async () => {
                          if (!postId) return;
                          setSaveError(null);
                          setSaveLoading(true);
                          const { error: updateError } = await supabase
                            .from("posts")
                            .update({ titel: editTitel.trim() || null, inhalt: editInhalt.trim() || null })
                            .eq("id", postId);
                          setSaveLoading(false);
                          if (updateError) {
                            setSaveError(updateError.message);
                            return;
                          }
                          setPost((prev) => prev ? { ...prev, titel: editTitel.trim() || null, inhalt: editInhalt.trim() || null } : null);
                          setIsEditing(false);
                        }}
                        style={{
                          padding: "12px 24px", borderRadius: "50px", border: "none",
                          backgroundColor: "var(--color-primary)", color: "#ffffff",
                          fontFamily: "var(--font-body)",
                          fontWeight: 500, fontSize: "14px",
                          cursor: saveLoading ? "wait" : "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        {saveLoading ? "Speichern…" : "Speichern"}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        disabled={saveLoading}
                        onClick={() => { setIsEditing(false); setSaveError(null); }}
                        style={{
                          padding: "12px 24px", borderRadius: "50px",
                          border: "2px solid #9b8f87", backgroundColor: "transparent",
                          color: "#9b8f87", fontFamily: "var(--font-body)",
                          fontWeight: 500, fontSize: "14px",
                          cursor: saveLoading ? "default" : "pointer",
                          transition: "border-color 0.2s ease, color 0.2s ease",
                        }}
                      >
                        Abbrechen
                      </button>
                ) : (
                    <h1 style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "38px", fontWeight: 300, lineHeight: 1.15,
                      letterSpacing: "0.01em", color: "var(--color-text)", margin: 0,
                    }}>
                      <em style={{ fontStyle: "italic" }}>{post.titel ?? "Ohne Titel"}</em>
                    </h1>
                    <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "18px 0 20px", opacity: 0.35 }} />
                    <div style={{ fontFamily: "var(--font-body)", color: "#6f625b", lineHeight: 1.8, fontSize: "15px" }}>
                      {(post.inhalt ?? "").trim() || "Kein Inhalt."}
                )}
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
                  fontSize: "26px", fontWeight: 300,
                  letterSpacing: "0.01em", color: "var(--color-text)", margin: "0 0 24px",
                }}>
                  <em style={{ fontStyle: "italic" }}>Kommentare</em>
                </h2>

                {commentError ? (
                  <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px", marginBottom: "16px" }}>
                    {commentError}
                  </div>
                ) : null}

                {comments.length === 0 ? (
                  <div style={{ color: "#9b8f87", fontSize: "14px" }}>Noch keine Kommentare.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {comments.map((c) => (
                      <CommentCard
                        key={c.id}
                        comment={c}
                        authorName={commentAuthors[c.autor_id]?.name ?? "Unbekannt"}
                        currentUserId={currentUserId}
                        likeCount={commentLikeCounts[c.id] ?? 0}
                        isLiked={myLikedComments.has(c.id)}
                        onLikeToggle={() => toggleCommentLike(c.id)}
                        onCommentUpdated={(commentId, newInhalt) => {
                          setComments((prev) => prev.map((com) => (com.id === commentId ? { ...com, inhalt: newInhalt } : com)));
                        }}
                        onReportComment={(commentId) => {
                          setReportTarget({ type: "comment", commentId });
                          setReportSelectedReason(null);
                          setReportSonstigesText("");
                          setReportModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ height: "1px", backgroundColor: "#E8E4E0", marginTop: "32px", marginBottom: "24px" }} />

                <form onSubmit={handleSendComment}>
                  <textarea
                    value={commentText}
                    onChange={(ev) => setCommentText(ev.target.value)}
                    rows={3}
                    placeholder="Schreibe einen Kommentar…"
                    className="comment-textarea"
                    style={{
                      width: "100%", padding: "15px 18px", borderRadius: "14px",
                      border: "1px solid var(--color-border-strong)", fontSize: "15px",
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--bg-primary)", color: "var(--color-text)",
                      resize: "vertical", marginBottom: "12px", boxSizing: "border-box",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      lineHeight: 1.65,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="submit-btn"
                    style={{
                      padding: "13px 28px", borderRadius: "50px", border: "none",
                      backgroundColor: "var(--color-primary)", color: "#ffffff",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500, fontSize: "14px", letterSpacing: "0.04em",
                      cursor: sending ? "default" : "pointer",
                      opacity: sending ? 0.72 : 1,
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {sending ? "Sende…" : "Kommentar senden"}
                  </button>
                </form>
          )}
        </main>
      </div>

      {/* Report-Bestätigung */}
      {reportToastVisible && (
        <div
          className="report-confirm-overlay"
          role="dialog"
          aria-label="Meldung gesendet"
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 10000, display: "flex", alignItems: "center",
            justifyContent: "center", padding: "24px",
          }}
          onClick={() => setReportToastVisible(false)}
        >
          <div
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "40px",
              maxWidth: "380px", width: "100%", textAlign: "center",
              boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a8c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 20px", display: "block" }} aria-hidden>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "20px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 12px" }}>
              Meldung gesendet
            </p>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "15px", color: "#6f625b", lineHeight: 1.6, margin: 0 }}>
              Danke für deine Meldung. Wir prüfen das so schnell wie möglich.
            </p>
          </div>
        </div>
      )}

      {/* Report-Modal */}
      {reportModalOpen && reportTarget && (
        <div
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "24px",
          }}
          onClick={() => !reportSending && setReportModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "32px",
              maxWidth: "420px", width: "100%",
              boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "18px", fontWeight: 500, color: "var(--color-text)", margin: "0 0 6px" }}>
              {reportTarget.type === "post" ? "Beitrag melden" : "Kommentar melden"}
            </h3>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "#6f625b", margin: "0 0 20px" }}>
              Warum möchtest du das melden?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className="report-option-row"
                  onClick={() => setReportSelectedReason(reason)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", borderRadius: "12px",
                    border: "none", background: "none", cursor: "pointer",
                    textAlign: "left", transition: "background-color 0.2s ease",
                  }}
                >
                  <span style={{
                    width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                    border: reportSelectedReason === reason ? "none" : "2px solid #E8E4E0",
                    backgroundColor: reportSelectedReason === reason ? "#b43b32" : "transparent",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {reportSelectedReason === reason && (
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fff" }} />
                    )}
                  </span>
                  <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "15px", color: "var(--color-text)" }}>
                    {reason}
                  </span>
                </button>
              ))}
            </div>

            {reportSelectedReason === "Sonstiges" && (
              <textarea
                className="edit-textarea"
                value={reportSonstigesText}
                onChange={(e) => setReportSonstigesText(e.target.value)}
                placeholder="Beschreibe kurz, was das Problem ist..."
                rows={3}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "12px",
                  border: "1px solid #E8E4E0", fontSize: "14px",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  backgroundColor: "#fbf8f5", color: "var(--color-text)",
                  lineHeight: 1.5, resize: "vertical", marginBottom: "20px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
              />
            )}

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-save"
                disabled={reportSending || !reportSelectedReason}
                onClick={async () => {
                  if (!currentUserId || !reportSelectedReason) return;
                  const grund = reportSelectedReason === "Sonstiges"
                    ? (reportSonstigesText.trim() || "Sonstiges")
                    : reportSelectedReason;
                  setReportSending(true);
                  const payload = reportTarget.type === "post"
                    ? { melder_id: currentUserId, post_id: postId, comment_id: null, grund }
                    : { melder_id: currentUserId, post_id: null, comment_id: reportTarget.commentId ?? null, grund };
                  const { error: insertError } = await supabase.from("reports").insert(payload);
                  setReportSending(false);
                  if (insertError) return;
                  setReportModalOpen(false);
                  setReportToastVisible(true);
                  setTimeout(() => setReportToastVisible(false), 3000);
                }}
                style={{
                  padding: "12px 24px", borderRadius: "50px", border: "none",
                  backgroundColor: reportSelectedReason ? "#b43b32" : "#E8E4E0",
                  color: reportSelectedReason ? "#ffffff" : "#9b8f87",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 500, fontSize: "14px",
                  cursor: reportSending ? "wait" : reportSelectedReason ? "pointer" : "default",
                  transition: "background-color 0.2s ease, color 0.2s ease",
                }}
              >
                {reportSending ? "Wird gesendet…" : "Melden"}
              </button>
              <button
                type="button"
                className="btn-report-abbrechen"
                disabled={reportSending}
                onClick={() => setReportModalOpen(false)}
                style={{
                  padding: "12px 24px", borderRadius: "50px",
                  border: "none", backgroundColor: "transparent",
                  color: "#9b8f87", fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 500, fontSize: "14px",
                  cursor: reportSending ? "default" : "pointer",
                  transition: "color 0.2s ease",
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
  );
}

function CommentCard({
  comment,
  authorName,
  currentUserId,
  likeCount,
  isLiked,
  onLikeToggle,
  onCommentUpdated,
  onReportComment,
}: Readonly<{
  comment: CommentRow;
  authorName: string;
  currentUserId: string | null;
  likeCount: number;
  isLiked: boolean;
  onLikeToggle: () => void;
  onCommentUpdated: (commentId: string, newInhalt: string) => void;
  onReportComment: (commentId: string) => void;
}>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const isAuthor = Boolean(currentUserId && comment.autor_id === currentUserId);

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
            width: "26px", height: "26px", borderRadius: "50%",
            backgroundColor: "rgba(60,44,36,0.07)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic", fontSize: "13px", color: "#7a6d65", flexShrink: 0,
          }}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-text)", fontSize: "13px" }}>
            {authorName}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isAuthor && !isEditing && (
            <button
              type="button"
              className="comment-edit-link"
              onClick={() => { setIsEditing(true); setEditText((comment.inhalt ?? "").trim()); }}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#9b8f87", background: "none", border: "none", padding: 0, cursor: "pointer", transition: "color 0.2s ease" }}
              title="Kommentar bearbeiten"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}
          {!isAuthor && currentUserId && (
            <button
              type="button"
              className="report-flag-btn"
              onClick={() => onReportComment(comment.id)}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#9b8f87", background: "none", border: "none", padding: 0, cursor: "pointer", transition: "color 0.2s ease" }}
              title="Kommentar melden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            </button>
          )}

          {/* Kommentar Like */}
          {currentUserId && (
            <button
              type="button"
              className="icon-btn"
              onClick={onLikeToggle}
              title={isLiked ? "Like entfernen" : "Gefällt mir"}
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                background: "none", border: "none", cursor: "pointer", padding: 0,
                color: isLiked ? "#b43b32" : "#6f625b",
                fontFamily: "var(--font-body)",
                fontSize: "12px", fontWeight: 500,
                transition: "opacity 0.15s ease",
              }}
            >
              {isLiked ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              )}
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          )}

          <span style={{ fontFamily: "var(--font-body)", color: "#b3a89e", fontSize: "12px" }}>{dateLabel}</span>
        </div>
      </div>

      {isEditing ? (
          <textarea
            className="edit-textarea"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: "12px",
              border: "1px solid var(--color-border-strong)", fontSize: "14px",
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--bg-primary)", color: "var(--color-text)",
              lineHeight: 1.65, resize: "vertical", marginBottom: "12px",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-comment-save"
              disabled={saveLoading}
              onClick={async () => {
                setSaveLoading(true);
                const { error: updateError } = await supabase
                  .from("comments")
                  .update({ inhalt: editText.trim() || null })
                  .eq("id", comment.id);
                setSaveLoading(false);
                if (updateError) return;
                onCommentUpdated(comment.id, editText.trim() || "");
                setIsEditing(false);
              }}
              style={{
                padding: "10px 20px", borderRadius: "50px", border: "none",
                backgroundColor: "var(--color-primary)", color: "#ffffff",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 500, fontSize: "14px",
                cursor: saveLoading ? "wait" : "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              {saveLoading ? "Speichern…" : "Speichern"}
            </button>
            <button
              type="button"
              className="btn-comment-cancel"
              disabled={saveLoading}
              onClick={() => setIsEditing(false)}
              style={{
                padding: "10px 20px", borderRadius: "50px",
                border: "1px solid #9b8f87", backgroundColor: "transparent",
                color: "#9b8f87", fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 500, fontSize: "14px",
                cursor: saveLoading ? "default" : "pointer",
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
            >
              Abbrechen
            </button>
      ) : (
        <div style={{ fontFamily: "var(--font-body)", color: "#6f625b", lineHeight: 1.65, fontSize: "14px" }}>
          {(comment.inhalt ?? "").trim() || "—"}
        </div>
      )}
    </div>
      </div>
      </div>
      </div>
      </div>
      </div>
  );
}