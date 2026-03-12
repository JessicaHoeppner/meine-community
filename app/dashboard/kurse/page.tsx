"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export default function KursePage() {
  return (
    <AuthGuard>
      <KurseInner />
    </AuthGuard>
  );
}

function KurseInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, titel, beschreibung, bild_url, ersteller_id, veroeffentlicht, erstellt_am"
        )
        .eq("veroeffentlicht", true)
        .order("erstellt_am", { ascending: false });

      if (courseError) {
        setError(courseError.message);
        setLoading(false);
        return;
      }

      const parsed = (courseData as CourseRow[]) ?? [];
      setCourses(parsed);

      const courseIds = parsed.map((c) => c.id);
      if (courseIds.length > 0) {
        const { data: moduleRows, error: modulesError } = await supabase
          .from("modules")
          .select("kurs_id")
          .in("kurs_id", courseIds);

        if (!modulesError) {
          const counts: Record<string, number> = {};
          for (const row of (moduleRows as Array<{ kurs_id: string }>) ?? []) {
            counts[row.kurs_id] = (counts[row.kurs_id] ?? 0) + 1;
          }
          setModuleCounts(counts);
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        .course-card:hover { border-color: rgba(180,59,50,0.35) !important; box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important; }
        .course-card:hover .course-card-title { color: #b43b32 !important; }
        .course-card:hover .course-card-arrow { color: #b43b32 !important; opacity: 1 !important; }
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
        @media (max-width: 640px) {
          .kurse-grid { grid-template-columns: 1fr !important; }
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

          {/* Intro */}
          <div style={{ marginBottom: "56px" }}>
            <p style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#b43b32",
              margin: "0 0 22px",
              opacity: 0.85,
            }}>
              Dein Lernbereich
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "52px",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              color: "#3c2c24",
              margin: 0,
            }}>
              <em style={{ fontStyle: "italic" }}>Meine Kurse</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "24px 0 22px", opacity: 0.4 }} />
            <p style={{
              margin: 0,
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#7a6d65",
              lineHeight: 1.75,
              letterSpacing: "0.01em",
              maxWidth: "420px",
            }}>
              Lerne in deinem eigenen Tempo und entwickle dich weiter.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>
              {error}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ color: "#7a6d65", fontSize: "15px", lineHeight: 1.75 }}>
              Keine veröffentlichten Kurse gefunden.
            </div>
          ) : (
            <section
              className="kurse-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
                alignItems: "stretch",
              }}
            >
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  moduleCount={moduleCounts[course.id] ?? null}
                />
              ))}
            </section>
          )}
        </main>
      </div>
    </>
  );
}

function CourseCard({
  course,
  moduleCount,
}: Readonly<{ course: CourseRow; moduleCount: number | null }>) {
  const title = course.titel ?? "Unbenannter Kurs";
  const description = course.beschreibung ?? "Keine Beschreibung vorhanden.";
  const countLabel = useMemo(() => {
    if (moduleCount == null) return "—";
    return String(moduleCount);
  }, [moduleCount]);

  return (
    <Link
      href={`/dashboard/kurse/${course.id}`}
      className="course-card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        backgroundColor: "#fbf8f4",
        border: "1px solid rgba(60,44,36,0.07)",
        borderRadius: "28px",
        padding: "28px 28px 24px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
        boxSizing: "border-box",
        minHeight: "220px",
        height: "100%",
      }}
    >
      {course.bild_url ? (
        <img
          src={course.bild_url}
          alt=""
          style={{
            width: "100%",
            height: "130px",
            objectFit: "cover",
            borderRadius: "16px",
            border: "1px solid rgba(60,44,36,0.06)",
            backgroundColor: "#e8ddd0",
            marginBottom: "20px",
            flexShrink: 0,
          }}
        />
      ) : null}

      <div
        className="course-card-title"
        style={{
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontWeight: 600,
          color: "#3c2c24",
          fontSize: "16px",
          marginBottom: "10px",
          transition: "color 0.2s ease",
          letterSpacing: "0.01em",
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>

      <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "12px" }} />

      <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#9b8f87", fontSize: "14px", lineHeight: 1.65, flexGrow: 1 }}>
        {description}
      </div>

      <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#b3a89e", fontSize: "12px", letterSpacing: "0.02em" }}>
          {countLabel} {moduleCount === 1 ? "Modul" : "Module"}
        </div>
        <span className="course-card-arrow" style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "13px", color: "#c5b8ae", transition: "color 0.2s ease", opacity: 0.7 }}>
          Öffnen →
        </span>
      </div>
    </Link>
  );
}
