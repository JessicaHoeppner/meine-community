"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type CourseRow = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  veroeffentlicht: boolean | null;
  erstellt_am: string | null;
};

type ProfileRow = {
  id: string;
  rolle: string | null;
};

export default function AdminKursePage() {
  return (
    <AuthGuard>
      <AdminKurseInner />
    </AuthGuard>
  );
}

function AdminKurseInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});

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

      const { data: courseData, error: coursesError } = await supabase
        .from("courses").select("id, titel, beschreibung, veroeffentlicht, erstellt_am")
        .order("erstellt_am", { ascending: false });
      if (coursesError) { setError(coursesError.message); setLoading(false); return; }

      const list = (courseData as CourseRow[]) ?? [];
      setCourses(list);

      const ids = list.map((c) => c.id);
      if (ids.length > 0) {
        const { data: moduleRows } = await supabase.from("modules").select("kurs_id").in("kurs_id", ids);
        const counts: Record<string, number> = {};
        for (const row of (moduleRows as Array<{ kurs_id: string }>) ?? []) {
          counts[row.kurs_id] = (counts[row.kurs_id] ?? 0) + 1;
        }
        setModuleCounts(counts);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (courseId: string) => {
    setError(null);
    const ok = window.confirm("Willst du diesen Kurs wirklich loeschen?");
    if (!ok) return;
    const { error: deleteError } = await supabase.from("courses").delete().eq("id", courseId);
    if (deleteError) { setError(deleteError.message); return; }
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setModuleCounts((prev) => { const next = { ...prev }; delete next[courseId]; return next; });
  };

  const noAccessCard = useMemo(() => ({
    backgroundColor: "#fbf8f4",
    border: "1px solid rgba(60,44,36,0.07)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
  }), []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        .btn-primary:hover:not(:disabled) { background-color: #9f3129 !important; }
        .btn-outlined:hover { background-color: #b43b32 !important; color: #ffffff !important; border-color: #b43b32 !important; }
        .btn-delete:hover { color: #b43b32 !important; }
        .back-link:hover { color: #9f3129 !important; }
        .course-card:hover { border-color: rgba(180,59,50,0.35) !important; box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important; }
        .auth-grain::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.016;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }
      `}} />

      <div className="auth-grain" style={{ minHeight: "100vh", backgroundColor: "#efe6dc", position: "relative", overflow: "hidden", fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
          <svg style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "70%", opacity: 0.38 }} viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="250" cy="200" rx="250" ry="180" fill="#e8ddd0"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", opacity: 0.40 }} viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e8ddd0" d="M0,60 C360,140 720,20 1080,80 C1260,110 1380,60 1440,70 L1440,160 L0,160 Z"/>
          </svg>
          <svg style={{ position: "absolute", top: "5%", right: "-8%", width: "38%", height: "55%", opacity: 0.22 }} viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="175" rx="200" ry="155" fill="#ddd4c8"/>
          </svg>
        </div>

        <main style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "80px 24px 100px" }}>

          {/* Intro */}
          <div style={{ marginBottom: "48px" }}>
            <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b43b32", margin: "0 0 22px", opacity: 0.85 }}>
              Admin
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "48px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "#3c2c24", margin: 0 }}>
                  <em style={{ fontStyle: "italic" }}>Kurse verwalten</em>
                </h1>
                <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "20px 0 18px", opacity: 0.4 }} />
                <p style={{ margin: 0, fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "15px", color: "#7a6d65", lineHeight: 1.75, maxWidth: "360px" }}>
                  Erstelle, bearbeite und veröffentliche Kurse.
                </p>
              </div>
              <Link href="/dashboard/admin/kurse/neu" className="btn-primary" style={{ display: "inline-block", padding: "14px 28px", borderRadius: "50px", backgroundColor: "#b43b32", color: "#ffffff", textDecoration: "none", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "14px", letterSpacing: "0.04em", transition: "background-color 0.2s ease", flexShrink: 0, marginTop: "8px" }}>
                + Neuen Kurs erstellen
              </Link>
            </div>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px", marginBottom: "16px" }}>{error}</div>
          ) : !isAdmin ? (
            <div style={noAccessCard}>
              <div style={{ fontWeight: 500, color: "#3c2c24", fontSize: "17px", marginBottom: "10px" }}>Kein Zugriff</div>
              <Link href="/dashboard" style={{ color: "#b43b32", textDecoration: "none", fontWeight: 500, fontSize: "14px" }}>Zum Dashboard</Link>
            </div>
          ) : courses.length === 0 ? (
            <div style={{ color: "#9b8f87", fontSize: "15px" }}>Keine Kurse vorhanden.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {courses.map((c) => (
                <div key={c.id} className="course-card" style={{ backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.07)", borderRadius: "24px", padding: "26px 28px 22px", transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ minWidth: "200px", flex: "1 1 auto" }}>
                      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 600, color: "#3c2c24", fontSize: "16px", marginBottom: "8px", letterSpacing: "0.01em" }}>
                        {c.titel ?? "Unbenannter Kurs"}
                      </div>
                      <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "10px" }} />
                      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#9b8f87", fontSize: "14px", lineHeight: 1.6, marginBottom: "8px" }}>
                        {c.beschreibung ?? "Keine Beschreibung vorhanden."}
                      </div>
                      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "12px", letterSpacing: "0.02em" }}>
                        {c.veroeffentlicht ? "✓ Veröffentlicht" : "Nicht veröffentlicht"} · {moduleCounts[c.id] ?? 0} Module
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
                      <Link href={`/dashboard/admin/kurse/${c.id}`} className="btn-outlined" style={{ display: "inline-block", padding: "10px 20px", borderRadius: "50px", border: "2px solid #b43b32", backgroundColor: "transparent", color: "#b43b32", textDecoration: "none", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "13px", letterSpacing: "0.02em", transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease" }}>
                        Bearbeiten
                      </Link>
                      <button type="button" onClick={() => handleDelete(c.id)} className="btn-delete" style={{ padding: "10px 16px", borderRadius: "50px", border: "none", backgroundColor: "transparent", color: "#9b8f87", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "13px", cursor: "pointer", transition: "color 0.2s ease" }}>
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
