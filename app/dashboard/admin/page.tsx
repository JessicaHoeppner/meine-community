"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ProfileRow = {
  id: string;
  rolle: string | null;
};

/*
 * Hinweis: In Supabase müssen ggf. angelegt werden:
 * - reports: id, melder_id, post_id, comment_id, grund, status, erstellt_am
 * - notifications: nutzer_id, nachricht, gelesen (für Benachrichtigung an Autor bei Entfernung)
 */

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminInner />
    </AuthGuard>
  );
}

function AdminInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [reportCount, setReportCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) { setError(userError.message); setLoading(false); return; }
      const user = userData.user;
      if (!user) { setLoading(false); return; }

      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("id, rolle").eq("id", user.id).maybeSingle();
      if (profileError) { setError(profileError.message); setLoading(false); return; }

      const role = (profile as ProfileRow | null)?.rolle ?? null;
      const admin = role?.toLowerCase() === "admin";
      setIsAdmin(admin);
      if (!admin) { setLoading(false); return; }

      const [{ count: courses, error: coursesError }, { count: members, error: membersError }] =
        await Promise.all([
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

      if (coursesError) { setError(coursesError.message); setLoading(false); return; }
      if (membersError) { setError(membersError.message); setLoading(false); return; }

      setCourseCount(typeof courses === "number" ? courses : 0);
      setMemberCount(typeof members === "number" ? members : 0);

      if (admin) {
        const { count: openReports } = await supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "offen");
        setReportCount(typeof openReports === "number" ? openReports : 0);
      }

      setLoading(false);
    };
    load();
  }, []);

  const cardStyle = useMemo(() => ({
    backgroundColor: "#fbf8f4",
    border: "1px solid rgba(60,44,36,0.07)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  }), []);

  return (
<main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Intro */}
          <div style={{ marginBottom: "56px" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 22px", opacity: 0.85 }}>
              Verwaltung
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "52px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "var(--color-text)", margin: 0 }}>
              <em style={{ fontStyle: "italic" }}>Admin</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "22px 0 20px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 400, color: "#7a6d65", lineHeight: 1.75, letterSpacing: "0.01em", maxWidth: "380px" }}>
              Übersicht und Verwaltung der Community-Plattform.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "var(--color-primary)", fontSize: "14px" }}>{error}</div>
          ) : !isAdmin ? (
            <div style={cardStyle}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-text)", fontSize: "17px", marginBottom: "10px" }}>Kein Zugriff</div>
              <div style={{ color: "#7a6d65", fontSize: "15px", marginBottom: "20px", lineHeight: 1.65 }}>Du hast keine Berechtigung, diesen Bereich zu sehen.</div>
              <Link href="/dashboard" className="btn-primary" style={{ display: "inline-block", padding: "13px 26px", borderRadius: "50px", backgroundColor: "var(--color-primary)", color: "#ffffff", textDecoration: "none", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", letterSpacing: "0.03em", transition: "background-color 0.2s ease" }}>
                Zum Dashboard
              </Link>
            </div>
          ) : (
              <section style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                <div className="admin-card" style={cardStyle}>
                  <div style={{ fontFamily: "var(--font-body)", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px" }}>Kurse gesamt</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "var(--color-text)", fontSize: "56px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.01em" }}>{courseCount ?? "—"}</div>
                  <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "20px 0 16px" }} />
                  <Link href="/dashboard/admin/kurse" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em" }}>
                    Kurse verwalten →
                  </Link>
                </div>
                <div className="admin-card" style={cardStyle}>
                  <div style={{ fontFamily: "var(--font-body)", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px" }}>Mitglieder gesamt</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "var(--color-text)", fontSize: "56px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.01em" }}>{memberCount ?? "—"}</div>
                  <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "20px 0 16px" }} />
                  <Link href="/dashboard/mitglieder" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em" }}>
                    Mitglieder ansehen →
                  </Link>
                </div>
                <div className="admin-card" style={cardStyle}>
                  <div style={{ fontFamily: "var(--font-body)", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px" }}>Gruppen</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "var(--color-text)", fontSize: "56px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.01em" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "8px" }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "20px 0 16px" }} />
                  <Link href="/dashboard/admin/gruppen" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em" }}>
                    Gruppen verwalten →
                  </Link>
                </div>
                <div className="admin-card" style={cardStyle}>
                  <div style={{ fontFamily: "var(--font-body)", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px" }}>Live Sessions</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "var(--color-text)", fontSize: "56px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.01em" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "8px" }}>
                      <circle cx="12" cy="12" r="10"/>
                      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/>
                    </svg>
                  </div>
                  <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "20px 0 16px" }} />
                  <Link href="/dashboard/admin/live" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em" }}>
                    Sessions verwalten →
                  </Link>
                </div>
                <Link href="/dashboard/admin/meldungen" className="admin-card" style={{ ...cardStyle, textDecoration: "none", display: "block" }}>
                  <div style={{ fontFamily: "var(--font-body)", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px" }}>Meldungen</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "56px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.01em", color: reportCount !== null && reportCount > 0 ? "#b43b32" : "#3c2c24" }}>
                    {reportCount === null ? "—" : reportCount}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: reportCount !== null && reportCount > 0 ? "#b43b32" : "#9b8f87", marginTop: "4px" }}>
                    {reportCount === null ? "…" : reportCount === 0 ? "Keine offenen Meldungen" : `${reportCount} offene ${reportCount === 1 ? "Meldung" : "Meldungen"}`}
                  </div>
                  <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "20px 0 16px" }} />
                  <span style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)", fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em" }}>
                    Meldungen verwalten →
                  </span>
                </Link>
              </section>
          )}
        </main>
  );
}