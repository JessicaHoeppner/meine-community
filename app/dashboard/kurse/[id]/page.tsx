"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type CourseRow = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  bild_url: string | null;
  ersteller_id: string | null;
  veroeffentlicht: boolean | null;
  erstellt_am: string | null;
};

type ModuleRow = {
  id: string;
  kurs_id: string;
  titel: string | null;
  beschreibung: string | null;
  video_url: string | null;
  reihenfolge: number | null;
  erstellt_am: string | null;
};

export default function KursDetailPage() {
  return (
    <AuthGuard>
      <KursDetailInner />
    </AuthGuard>
  );
}

function KursDetailInner() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseRow | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);

      const { data, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, titel, beschreibung, bild_url, ersteller_id, veroeffentlicht, erstellt_am"
        )
        .eq("id", courseId)
        .maybeSingle();

      if (courseError) {
        setError(courseError.message);
        setLoading(false);
        return;
      }

      setCourse((data as CourseRow) ?? null);

      const { data: moduleData, error: modulesError } = await supabase
        .from("modules")
        .select("id, kurs_id, titel, beschreibung, video_url, reihenfolge, erstellt_am")
        .eq("kurs_id", courseId)
        .order("reihenfolge", { ascending: true });

      if (modulesError) {
        setError(modulesError.message);
        setLoading(false);
        return;
      }

      setModules((moduleData as ModuleRow[]) ?? []);
      setLoading(false);
    };

    load();
  }, [courseId]);

  const title = course?.titel ?? "Kurs";
  const description = course?.beschreibung ?? "Keine Beschreibung vorhanden.";

  const moduleCount = useMemo(() => {
    return modules.length;
  }, [modules.length]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        .module-card:hover { border-color: rgba(180,59,50,0.35) !important; box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important; }
        .module-card:hover .module-card-title { color: #b43b32 !important; }
        .module-card:hover .module-card-arrow { color: #b43b32 !important; opacity: 1 !important; }
        .back-link:hover { color: #9f3129 !important; }
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

          {/* Zurück-Link */}
          <div style={{ marginBottom: "32px" }}>
            <Link
              href="/dashboard/kurse"
              className="back-link"
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                color: "#b43b32",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "14px",
                letterSpacing: "0.02em",
                transition: "color 0.2s ease",
              }}
            >
              ← Zurück zu Kursen
            </Link>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>
              {error}
            </div>
          ) : !course ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Kurs nicht gefunden.</div>
          ) : (
            <>
              {/* Kurs-Header-Card */}
              <div
                style={{
                  backgroundColor: "#fbf8f4",
                  border: "1px solid rgba(60,44,36,0.07)",
                  borderRadius: "28px",
                  padding: "40px 40px 36px",
                  boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
                  marginBottom: "20px",
                }}
              >
                {course.bild_url ? (
                  <img
                    src={course.bild_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "18px",
                      border: "1px solid rgba(60,44,36,0.06)",
                      backgroundColor: "#e8ddd0",
                      marginBottom: "28px",
                    }}
                  />
                ) : null}

                <p style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#b43b32",
                  margin: "0 0 14px",
                  opacity: 0.85,
                }}>
                  Kursübersicht
                </p>

                <h1 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "42px",
                  fontWeight: 300,
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  color: "#3c2c24",
                  margin: "0 0 6px",
                }}>
                  <em style={{ fontStyle: "italic" }}>{title}</em>
                </h1>

                <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "18px 0 18px", opacity: 0.4 }} />

                <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#7a6d65", fontSize: "15px", lineHeight: 1.75, margin: "0 0 12px", maxWidth: "560px" }}>
                  {description}
                </p>

                <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "12px", letterSpacing: "0.04em" }}>
                  {moduleCount} {moduleCount === 1 ? "Modul" : "Module"}
                </div>
              </div>

              {/* Module */}
              <div
                style={{
                  backgroundColor: "#fbf8f4",
                  border: "1px solid rgba(60,44,36,0.07)",
                  borderRadius: "28px",
                  padding: "36px 40px 32px",
                  boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
                }}
              >
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "28px",
                  fontWeight: 300,
                  letterSpacing: "0.01em",
                  color: "#3c2c24",
                  margin: "0 0 24px",
                }}>
                  <em style={{ fontStyle: "italic" }}>Module</em>
                </h2>

                {modules.length === 0 ? (
                  <div style={{ color: "#9b8f87", fontSize: "15px" }}>Keine Module gefunden.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {modules.map((m) => (
                      <Link
                        key={m.id}
                        href={`/dashboard/kurse/${courseId}/modul/${m.id}`}
                        className="module-card"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          textDecoration: "none",
                          backgroundColor: "#f7f2eb",
                          border: "1px solid rgba(60,44,36,0.07)",
                          borderRadius: "18px",
                          padding: "20px 24px 18px",
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                          boxShadow: "0 1px 8px rgba(60,44,36,0.04)",
                        }}
                      >
                        <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "6px" }}>
                          Modul {m.reihenfolge ?? "—"}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <div>
                            <div
                              className="module-card-title"
                              style={{
                                fontFamily: "'Manrope', system-ui, sans-serif",
                                fontWeight: 600,
                                color: "#3c2c24",
                                fontSize: "15px",
                                marginBottom: "6px",
                                transition: "color 0.2s ease",
                                letterSpacing: "0.01em",
                                lineHeight: 1.35,
                              }}
                            >
                              {m.titel ?? "Unbenannt"}
                            </div>
                            <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#9b8f87", fontSize: "13px", lineHeight: 1.6 }}>
                              {m.beschreibung ?? "Keine Beschreibung vorhanden."}
                            </div>
                          </div>
                          <span className="module-card-arrow" style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "13px", color: "#c5b8ae", transition: "color 0.2s ease", opacity: 0.7, flexShrink: 0, paddingTop: "2px" }}>
                            →
                          </span>
                        </div>
                      </Link>
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
