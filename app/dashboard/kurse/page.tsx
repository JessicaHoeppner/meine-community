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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#2E2E2E",
          }}
        >
          Kurse
        </h1>

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
        ) : courses.length === 0 ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
            Keine veroeffentlichten Kurse gefunden.
          </div>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "20px",
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
    <div
      style={{
        backgroundColor: "#FAF7F3",
        border: "1px solid #E8E4E0",
        borderRadius: "14px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {course.bild_url ? (
        <img
          src={course.bild_url}
          alt=""
          style={{
            width: "100%",
            height: "140px",
            objectFit: "cover",
            borderRadius: "12px",
            border: "1px solid #E8E4E0",
            backgroundColor: "#E8E4E0",
          }}
        />
      ) : null}
      <div>
        <div style={{ fontWeight: 700, color: "#2E2E2E", fontSize: "1.05rem" }}>
          {title}
        </div>
        <div style={{ color: "#6B6562", fontSize: "0.9rem", lineHeight: 1.6, marginTop: "6px" }}>
          {description}
        </div>
      </div>

      <div style={{ color: "#6B6562", fontSize: "0.9rem" }}>
        Anzahl Module: {countLabel}
      </div>

      <div style={{ marginTop: "6px" }}>
        <Link
          href={`/dashboard/kurse/${course.id}`}
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#8B3A3A",
            color: "#FFFFFF",
            fontWeight: 500,
            fontSize: "0.95rem",
            textDecoration: "none",
          }}
        >
          Kurs starten
        </Link>
      </div>
    </div>
  );
}

