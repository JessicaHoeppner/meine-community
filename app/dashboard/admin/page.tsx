"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ProfileRow = {
  id: string;
  rolle: string | null;
};

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        .admin-card:hover { border-color: rgba(180,59,50,0.35) !important; box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important; }
        .btn-primary:hover:not(:disabled) { background-color: #9f3129 !important; }
        .back-link:hover { color: #9f3129 !important; }
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
          <div style={{ marginBottom: "56px" }}>
            <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b43b32", margin: "0 0 22px", opacity: 0.85 }}>
              Verwaltung
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "52px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "#3c2c24", margin: 0 }}>
              <em style={{ fontStyle: "italic" }}>Admin</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "22px 0 20px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "15px", fontWeight: 400, color: "#7a6d65", lineHeight: 1.75, letterSpacing: "0.01em", maxWidth: "380px" }}>
              Übersicht und Verwaltung der Community-Plattform.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>{error}</div>
          ) : !isAdmin ? (
            <div style={cardStyle}>
              <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, color: "#3c2c24", fontSize: "17px", marginBottom: "10px" }}>Kein Zugriff</div>
              <div style={{ color: "#7a6d65", fontSize: "15px", marginBottom: "20px", lineHeight: 1.65 }}>Du hast keine Berechtigung, diesen Bereich zu sehen.</div>
              <Link href="/dashboard" className="btn-primary" style={{ display: "inline-block", padding: "13px 26px", borderRadius: "50px", backgroundColor: "#b43b32", color: "#ffffff", textDecoration: "none", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "14px", letterSpacing: "0.03em", transition: "background-color 0.2s ease" }}>
                Zum Dashboard
              </Link>
            </div>
          ) : (
            <section style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
              <div className="admin-card" style={cardStyle}>
                <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px" }}>Kurse gesamt</div>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#3c2c24", fontSize: "56px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.01em" }}>{courseCount ?? "—"}</div>
                <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "20px 0 16px" }} />
                <Link href="/dashboard/admin/kurse" style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b43b32", textDecoration: "none", fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em" }}>
                  Kurse verwalten →
                </Link>
              </div>
              <div className="admin-card" style={cardStyle}>
                <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "16px" }}>Mitglieder gesamt</div>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#3c2c24", fontSize: "56px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.01em" }}>{memberCount ?? "—"}</div>
                <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", margin: "20px 0 16px" }} />
                <Link href="/dashboard/mitglieder" style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b43b32", textDecoration: "none", fontWeight: 500, fontSize: "13px", letterSpacing: "0.03em" }}>
                  Mitglieder ansehen →
                </Link>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
