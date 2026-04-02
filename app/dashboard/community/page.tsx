"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";
import { Alert, EmptyState } from "@/src/components/ui";

type PostRow = { id: string; autor_id: string; titel: string | null; inhalt: string | null; erstellt_am: string | null; gruppen_id: string | null };
type ProfileRow = { id: string; name: string | null };
type Gruppe = { id: string; name: string };
type ActiveTab = "alle" | "gespeichert";

export default function CommunityFeedPage() {
  return <AuthGuard><CommunityFeedInner /></AuthGuard>;
}

function CommunityFeedInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, ProfileRow>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [myLikedPosts, setMyLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ActiveTab>("alle");
  const [meineGruppen, setMeineGruppen] = useState<Gruppe[]>([]);
  const [activeGruppeId, setActiveGruppeId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: postData, error: postError } = await supabase.from("posts").select("id, autor_id, titel, inhalt, erstellt_am, gruppen_id").order("erstellt_am", { ascending: false });
      if (postError) { setError(postError.message); setLoading(false); return; }

      const postList = (postData as PostRow[]) ?? [];
      setPosts(postList);

      const authorIds = Array.from(new Set(postList.map((p) => p.autor_id).filter(Boolean)));
      if (authorIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("id, name").in("id", authorIds);
        if (!profileError) { const map: Record<string, ProfileRow> = {}; for (const p of (profileData as ProfileRow[]) ?? []) map[p.id] = p; setAuthors(map); }
      }

      const postIds = postList.map((p) => p.id);
      if (postIds.length > 0) {
        const { data: commentData, error: commentError } = await supabase.from("comments").select("post_id").in("post_id", postIds);
        if (!commentError) { const counts: Record<string, number> = {}; for (const row of (commentData as Array<{ post_id: string }>) ?? []) { counts[row.post_id] = (counts[row.post_id] ?? 0) + 1; } setCommentCounts(counts); }

        const { data: likeData } = await supabase.from("likes").select("post_id, nutzer_id").in("post_id", postIds).is("comment_id", null);
        if (likeData) { const counts: Record<string, number> = {}; for (const row of likeData as Array<{ post_id: string; nutzer_id: string }>) { counts[row.post_id] = (counts[row.post_id] ?? 0) + 1; } setLikeCounts(counts); }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: bookmarkData } = await supabase.from("bookmarks").select("post_id").eq("nutzer_id", user.id);
        if (bookmarkData) setBookmarks(new Set(bookmarkData.map((b: { post_id: string }) => b.post_id)));

        if (postIds.length > 0) {
          const { data: myLikes } = await supabase.from("likes").select("post_id").eq("nutzer_id", user.id).in("post_id", postIds).is("comment_id", null);
          if (myLikes) setMyLikedPosts(new Set(myLikes.map((l: { post_id: string }) => l.post_id)));
        }

        const { data: mitgliedData } = await supabase.from("gruppen_mitglieder").select("gruppen_id, gruppen(id, name)").eq("nutzer_id", user.id);
        if (mitgliedData) {
          const gruppen = mitgliedData.map((m: { gruppen_id: string; gruppen: { id: string; name: string } | null }) => m.gruppen).filter(Boolean) as Gruppe[];
          setMeineGruppen(gruppen);
        }
      }

      setLoading(false);
    };
    load();
  }, []);

  const toggleBookmark = useCallback(async (postId: string) => {
    if (!currentUserId) return;
    const isSaved = bookmarks.has(postId);
    setBookmarks((prev) => { const next = new Set(prev); isSaved ? next.delete(postId) : next.add(postId); return next; });
    if (isSaved) await supabase.from("bookmarks").delete().eq("nutzer_id", currentUserId).eq("post_id", postId);
    else await supabase.from("bookmarks").insert({ nutzer_id: currentUserId, post_id: postId });
  }, [currentUserId, bookmarks]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!currentUserId) return;
    const isLiked = myLikedPosts.has(postId);
    setMyLikedPosts((prev) => { const next = new Set(prev); isLiked ? next.delete(postId) : next.add(postId); return next; });
    setLikeCounts((prev) => ({ ...prev, [postId]: Math.max(0, (prev[postId] ?? 0) + (isLiked ? -1 : 1)) }));
    if (isLiked) await supabase.from("likes").delete().eq("nutzer_id", currentUserId).eq("post_id", postId).is("comment_id", null);
    else await supabase.from("likes").insert({ nutzer_id: currentUserId, post_id: postId, comment_id: null });
  }, [currentUserId, myLikedPosts]);

  const visiblePosts = useMemo(() => {
    let filtered = posts;
    if (activeGruppeId) filtered = filtered.filter((p) => String(p.gruppen_id ?? "") === String(activeGruppeId));
    if (activeTab === "gespeichert") filtered = filtered.filter((p) => bookmarks.has(p.id));
    return filtered;
  }, [posts, bookmarks, activeTab, activeGruppeId]);

  return (
    <main style={{ maxWidth: "var(--max-width-narrow)", margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-lg)", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "var(--text-overline)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "var(--space-sm)" }}>
              Austausch & Vernetzung
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 300, lineHeight: 1.2, color: "var(--color-text)", marginBottom: "var(--space-sm)" }}>
              <em style={{ fontStyle: "italic" }}>Community</em>
            </h1>
            <p style={{ fontSize: "var(--text-button)", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Stell Fragen, teile Erfahrungen und wachse gemeinsam.
            </p>
          </div>
          <Link href="/dashboard/community/neu" className="btn-primary" style={{ flexShrink: 0, marginTop: "var(--space-sm)" }}>
            + Neuer Beitrag
          </Link>
        </div>
      </div>

      {/* Gruppen-Chips */}
      {meineGruppen.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", alignItems: "center", marginBottom: "var(--space-md)" }}>
          <button type="button" onClick={() => setActiveGruppeId(null)} style={{
            padding: "7px 16px", borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer",
            fontSize: "var(--text-caption)", fontWeight: activeGruppeId === null ? 600 : 400,
            backgroundColor: activeGruppeId === null ? "var(--color-primary)" : "var(--bg-elevated)",
            color: activeGruppeId === null ? "#fff" : "var(--color-text)", transition: "all 0.15s ease",
          }}>Alle</button>
          {meineGruppen.map((g) => (
            <button key={g.id} type="button" onClick={() => setActiveGruppeId(String(g.id))} style={{
              padding: "7px 16px", borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer",
              fontSize: "var(--text-caption)", fontWeight: activeGruppeId === String(g.id) ? 600 : 400,
              backgroundColor: activeGruppeId === String(g.id) ? "var(--color-primary)" : "var(--bg-elevated)",
              color: activeGruppeId === String(g.id) ? "#fff" : "var(--color-text)", transition: "all 0.15s ease",
            }}>{g.name}</button>
          ))}
          <Link href="/dashboard/community/gruppen" style={{
            marginLeft: "auto", padding: "7px 16px", borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border-strong)", backgroundColor: "transparent",
            color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "var(--text-caption)", fontWeight: 500,
          }}>+ Gruppen entdecken</Link>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: "var(--space-xl)", borderBottom: "1px solid var(--color-border)" }}>
        {(["alle", "gespeichert"] as ActiveTab[]).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{
            background: "none", border: "none",
            borderBottom: activeTab === tab ? "2px solid var(--color-primary)" : "2px solid transparent",
            padding: "10px 20px", marginBottom: "-1px", cursor: "pointer",
            fontSize: "var(--text-body-sm)", fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? "var(--color-primary)" : "var(--color-text-secondary)",
            transition: "color 0.15s ease",
          }}>
            {tab === "alle" ? "Alle Beiträge" : "Gespeichert"}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Laden…</p>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : visiblePosts.length === 0 ? (
        <EmptyState
          title={activeTab === "gespeichert" ? "Noch nichts gespeichert" : "Noch keine Beiträge"}
          description={activeTab === "gespeichert" ? "Du hast noch keine Beiträge gespeichert." : "Starte die Unterhaltung und erstelle den ersten Beitrag."}
          action={activeTab !== "gespeichert" ? <Link href="/dashboard/community/neu" className="btn-primary" style={{ padding: "10px 24px" }}>Ersten Beitrag schreiben</Link> : undefined}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id} post={post}
              authorName={authors[post.autor_id]?.name ?? "Unbekannt"}
              commentCount={commentCounts[post.id] ?? 0}
              isAuthor={currentUserId != null && post.autor_id === currentUserId}
              isBookmarked={bookmarks.has(post.id)}
              onBookmarkToggle={() => toggleBookmark(post.id)}
              likeCount={likeCounts[post.id] ?? 0}
              isLiked={myLikedPosts.has(post.id)}
              onLikeToggle={() => toggleLike(post.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function PostCard({ post, authorName, commentCount, isAuthor, isBookmarked, onBookmarkToggle, likeCount, isLiked, onLikeToggle }: Readonly<{
  post: PostRow; authorName: string; commentCount: number; isAuthor: boolean;
  isBookmarked: boolean; onBookmarkToggle: () => void;
  likeCount: number; isLiked: boolean; onLikeToggle: () => void;
}>) {
  const preview = useMemo(() => { const text = (post.inhalt ?? "").trim(); if (!text) return "Kein Inhalt."; return text.length <= 200 ? text : `${text.slice(0, 200)}...`; }, [post.inhalt]);
  const dateLabel = useMemo(() => { if (!post.erstellt_am) return "—"; const d = new Date(post.erstellt_am); if (Number.isNaN(d.getTime())) return "—"; return d.toLocaleDateString("de-DE", { year: "numeric", month: "short", day: "2-digit" }); }, [post.erstellt_am]);

  return (
    <div className="dash-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-lg)", boxShadow: "var(--shadow-card)" }}>
      {/* Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-sm)", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "14px", color: "var(--color-text-secondary)", flexShrink: 0 }}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 500, color: "var(--color-text)", fontSize: "var(--text-caption)" }}>{authorName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAuthor && (
            <Link href={`/dashboard/community/${post.id}?bearbeiten=1`} title="Bearbeiten" style={{ color: "var(--color-primary)", display: "inline-flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </Link>
          )}
          <button type="button" onClick={onLikeToggle} title={isLiked ? "Like entfernen" : "Gefällt mir"} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", padding: 0, color: isLiked ? "var(--color-primary)" : "var(--color-text-secondary)", fontSize: "var(--text-micro)", fontWeight: 500 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button type="button" onClick={onBookmarkToggle} title={isBookmarked ? "Entfernen" : "Speichern"} style={{ display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: isBookmarked ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-micro)" }}>{dateLabel} · {commentCount} {commentCount === 1 ? "Kommentar" : "Kommentare"}</span>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--color-border)", marginBottom: "var(--space-md)" }} />

      <Link href={`/dashboard/community/${post.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="dash-card-title" style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic", color: "var(--color-text)", fontSize: "22px", lineHeight: 1.25, marginBottom: "var(--space-sm)", transition: "color 0.2s ease" }}>
          {post.titel ?? "Ohne Titel"}
        </div>
        <div style={{ color: "var(--color-text-muted)", lineHeight: 1.7, fontSize: "var(--text-body-sm)", flexGrow: 1 }}>{preview}</div>
        <div style={{ marginTop: "var(--space-md)", display: "flex", justifyContent: "flex-end" }}>
          <span className="dash-card-arrow" style={{ fontSize: "var(--text-micro)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", opacity: 0.8 }}>Lesen →</span>
        </div>
      </Link>
    </div>
  );
}
