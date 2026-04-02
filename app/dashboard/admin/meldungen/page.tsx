"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ReportRow = {
  id: string;
  melder_id: string;
  post_id: string | null;
  comment_id: string | null;
  grund: string | null;
  status: string | null;
  erstellt_am: string | null;
};

export default function AdminMeldungenPage() {
  return (
    <AuthGuard>
      <AdminMeldungenInner />
    </AuthGuard>
  );
}

function AdminMeldungenInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reportMeta, setReportMeta] = useState<{
    melderNames: Record<string, string>;
    postDetails: Record<string, { titel: string | null; inhalt: string | null; autor_id: string; autorName: string }>;
    commentDetails: Record<string, { inhalt: string | null; autor_id: string; autorName: string }>;
  }>({ melderNames: {}, postDetails: {}, commentDetails: {} });
  const [confirmRemove, setConfirmRemove] = useState<{
    reportId: string;
    postId?: string;
    commentId?: string;
    autorId: string;
    isPost: boolean;
  } | null>(null);

  async function handleEntfernen(payload: {
    reportId: string;
    postId?: string;
    commentId?: string;
    autorId: string;
    isPost: boolean;
  }) {
    const { reportId, postId, commentId, autorId } = payload;
    try {
      // 1. Notification an Autor senden
      if (autorId) {
        await supabase.from("notifications").insert({
          nutzer_id: autorId,
          nachricht: "Dein Beitrag/Kommentar wurde wegen eines Verstoßes gegen die Community-Richtlinien entfernt.",
          gelesen: false,
        });
      }

      // 2. Inhalt löschen
      if (commentId) {
        const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId);
        if (deleteError) {
          console.error("Fehler beim Löschen:", deleteError);
          alert("Fehler beim Löschen: " + deleteError.message);
          return;
        }
      } else if (postId) {
        await supabase.from("comments").delete().eq("post_id", postId);
        const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId);
        if (deleteError) {
          console.error("Fehler beim Löschen:", deleteError);
          alert("Fehler beim Löschen: " + deleteError.message);
          return;
        }
      }

      // 3. Meldung als bearbeitet markieren
      await supabase.from("reports").update({ status: "bearbeitet" }).eq("id", reportId);

      // 4. State aktualisieren - Karte aus Liste entfernen
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setConfirmRemove(null);
      alert("Inhalt wurde erfolgreich entfernt.");
    } catch (err) {
      console.error("Unerwarteter Fehler:", err);
      alert("Ein Fehler ist aufgetreten.");
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }
      const user = userData.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("id, rolle").eq("id", user.id).maybeSingle();
      const role = (profile as { rolle: string | null } | null)?.rolle ?? null;
      const admin = role?.toLowerCase() === "admin";
      setIsAdmin(admin);

      if (!admin) {
        setLoading(false);
        return;
      }

      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("id, melder_id, post_id, comment_id, grund, status, erstellt_am")
        .eq("status", "offen")
        .order("erstellt_am", { ascending: false });

      if (reportError) {
        setError(reportError.message);
        setLoading(false);
        return;
      }

      const list = (reportData as ReportRow[]) ?? [];
      setReports(list);

      const melderIds = Array.from(new Set(list.map((r) => r.melder_id).filter(Boolean)));
      const postIds = Array.from(new Set(list.map((r) => r.post_id).filter(Boolean))) as string[];
      const commentIds = Array.from(new Set(list.map((r) => r.comment_id).filter(Boolean))) as string[];

      const melderNames: Record<string, string> = {};
      const postDetails: Record<string, { titel: string | null; inhalt: string | null; autor_id: string; autorName: string }> = {};
      const commentDetails: Record<string, { inhalt: string | null; autor_id: string; autorName: string }> = {};

      if (melderIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", melderIds);
        for (const p of (profiles as { id: string; name: string | null }[]) ?? []) {
          melderNames[p.id] = p.name ?? "Unbekannt";
        }
      }
      if (postIds.length > 0) {
        const { data: posts } = await supabase.from("posts").select("id, titel, inhalt, autor_id").in("id", postIds);
        const postsList = (posts as { id: string; titel: string | null; inhalt: string | null; autor_id: string }[]) ?? [];
        const autorIds = Array.from(new Set(postsList.map((p) => p.autor_id).filter(Boolean)));
        const { data: autorProfiles } = await supabase.from("profiles").select("id, name").in("id", autorIds);
        const names: Record<string, string> = {};
        for (const a of (autorProfiles as { id: string; name: string | null }[]) ?? []) names[a.id] = a.name ?? "Unbekannt";
        for (const p of postsList) postDetails[p.id] = { titel: p.titel, inhalt: p.inhalt, autor_id: p.autor_id, autorName: names[p.autor_id] ?? "Unbekannt" };
      }
      if (commentIds.length > 0) {
        const { data: comments } = await supabase.from("comments").select("id, inhalt, autor_id").in("id", commentIds);
        const commentsList = (comments as { id: string; inhalt: string | null; autor_id: string }[]) ?? [];
        const autorIds = Array.from(new Set(commentsList.map((c) => c.autor_id).filter(Boolean)));
        const { data: autorProfiles } = await supabase.from("profiles").select("id, name").in("id", autorIds);
        const names: Record<string, string> = {};
        for (const a of (autorProfiles as { id: string; name: string | null }[]) ?? []) names[a.id] = a.name ?? "Unbekannt";
        for (const c of commentsList) commentDetails[c.id] = { inhalt: c.inhalt, autor_id: c.autor_id, autorName: names[c.autor_id] ?? "Unbekannt" };
      }

      setReportMeta({ melderNames, postDetails, commentDetails });
      setLoading(false);
    };

    load();
  }, []);

  if (!isAdmin && !loading) {
    return (
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-text)", fontSize: "17px", marginBottom: "10px" }}>Kein Zugriff</p>
          <Link href="/dashboard/admin" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "14px" }}>
            ← Zurück zum Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000&family=Manrope:wght@400;500;600&display=swap');
        .admin-meldungen-card:hover { border-color: rgba(180,59,50,0.35) !important; box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important; }
        .btn-meld-remove:hover:not(:disabled) { background-color: #9f3129 !important; }
        .btn-meld-reject:hover:not(:disabled) { border-color: #3c2c24 !important; color: #3c2c24 !important; }
        .back-link-meld:hover { color: #9f3129 !important; }
        .auth-grain-meld::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.016;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }
      `,
        }}
      />
      <div className="auth-grain-meld" style={{ minHeight: "100vh", backgroundColor: "#efe6dc", position: "relative", overflow: "hidden", fontFamily: "var(--font-body)" }}>
<main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>
          <div style={{ marginBottom: "32px" }}>
            <Link
              href="/dashboard/admin"
              className="back-link-meld"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "14px", letterSpacing: "0.02em", transition: "color 0.2s ease" }}
            >
              ← Zurück
            </Link>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 300, color: "var(--color-primary)", margin: "0 0 32px" }}>
            Meldungen
          </h1>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px" }}>{error}</div>
          ) : reports.length === 0 ? (
            <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "16px", color: "#9b8f87" }}>Keine offenen Meldungen</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  melderName={reportMeta.melderNames[r.melder_id] ?? "Unbekannt"}
                  postDetail={r.post_id ? reportMeta.postDetails[r.post_id] : undefined}
                  commentDetail={r.comment_id ? reportMeta.commentDetails[r.comment_id] : undefined}
                  onRemove={(payload) => setConfirmRemove(payload)}
                  onReject={async () => {
                    await supabase.from("reports").update({ status: "abgelehnt" }).eq("id", r.id);
                    setReports((prev) => prev.filter((x) => x.id !== r.id));
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {confirmRemove && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={() => setConfirmRemove(null)}
        >
          <div
            style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "40px", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "16px", color: "var(--color-text)", margin: "0 0 24px", lineHeight: 1.6 }}>
              Bist du sicher, dass du diesen Inhalt entfernen möchtest? Der Autor wird benachrichtigt.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-meld-remove"
                onClick={() => handleEntfernen(confirmRemove)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "50px",
                  border: "none",
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                Ja, entfernen
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                style={{ padding: "12px 24px", border: "none", background: "none", color: "#9b8f87", fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 500, fontSize: "14px", cursor: "pointer" }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
  );
}

function ReportCard({
  report,
  melderName,
  postDetail,
  commentDetail,
  onRemove,
  onReject,
}: Readonly<{
  report: ReportRow;
  melderName: string;
  postDetail?: { titel: string | null; inhalt: string | null; autor_id: string; autorName: string };
  commentDetail?: { inhalt: string | null; autor_id: string; autorName: string };
  onRemove: (payload: { reportId: string; postId?: string; commentId?: string; autorId: string; isPost: boolean }) => void;
  onReject: () => void | Promise<void>;
}>) {
  const [updating, setUpdating] = useState(false);
  const isPost = Boolean(report.post_id && postDetail);

  const dateLabel = useMemo(() => {
    if (!report.erstellt_am) return "—";
    const d = new Date(report.erstellt_am);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "2-digit" });
  }, [report.erstellt_am]);

  const contentExcerpt = (text: string | null, max: number) => {
    const t = (text ?? "").trim();
    if (!t) return "—";
    return t.length <= max ? t : `${t.slice(0, max)}…`;
  };

  return (
    <div className="admin-meldungen-card" style={{ backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.07)", borderRadius: "24px", padding: "24px 28px", boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)" }}>
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "13px", color: "#9b8f87", marginBottom: "6px" }}>Gemeldet von: {melderName}</div>
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", fontWeight: 500, color: "#6f625b", marginBottom: "6px" }}>Grund: {report.grund ?? "—"}</div>
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "13px", color: "#9b8f87", marginBottom: "16px" }}>{dateLabel}</div>
      <div style={{ height: "1px", backgroundColor: "#E8E4E0", marginBottom: "16px" }} />
      <div style={{ backgroundColor: "#f7f2ec", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
        {isPost && postDetail ? (
            <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "var(--color-text)", marginBottom: "8px" }}>
              Post von {postDetail.autorName}: {postDetail.titel ?? "—"}
            </div>
            <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "#6f625b", lineHeight: 1.6 }}>{contentExcerpt(postDetail.inhalt, 200)}</div>
        ) : commentDetail ? (
            <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "var(--color-text)", marginBottom: "8px" }}>Kommentar von {commentDetail.autorName}:</div>
            <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "#6f625b", lineHeight: 1.6 }}>{contentExcerpt(commentDetail.inhalt, 200)}</div>
        ) : (
          <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "#9b8f87" }}>Inhalt nicht mehr verfügbar</div>
        )}
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {((isPost && postDetail) || commentDetail) && (
          <button
            type="button"
            className="btn-meld-remove"
            disabled={updating}
            onClick={() => {
              if (isPost && report.post_id && postDetail) onRemove({ reportId: report.id, postId: report.post_id, autorId: postDetail.autor_id, isPost: true });
              else if (report.comment_id && commentDetail) onRemove({ reportId: report.id, commentId: report.comment_id, autorId: commentDetail.autor_id, isPost: false });
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "50px",
              border: "none",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              cursor: updating ? "wait" : "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            Inhalt entfernen
          </button>
        )}
        <button
          type="button"
          className="btn-meld-reject"
          disabled={updating}
          onClick={async () => {
            setUpdating(true);
            await onReject();
            setUpdating(false);
          }}
          style={{
            padding: "10px 20px",
            borderRadius: "50px",
            border: "1px solid #9b8f87",
            backgroundColor: "transparent",
            color: "#9b8f87",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            cursor: updating ? "wait" : "pointer",
            transition: "border-color 0.2s ease, color 0.2s ease",
          }}
        >
          Meldung ablehnen
        </button>
      </div>
    </div>
  );
}