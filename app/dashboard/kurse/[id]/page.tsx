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
  const description =
    course?.beschreibung ?? "Keine Beschreibung vorhanden.";

  const moduleCount = useMemo(() => {
    return modules.length;
  }, [modules.length]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ marginBottom: "14px" }}>
          <Link
            href="/dashboard/kurse"
            style={{
              color: "#8B3A3A",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            ← Zurueck zu Kursen
          </Link>
        </div>

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
        ) : !course ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
            Kurs nicht gefunden.
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E8E4E0",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            {course.bild_url ? (
              <img
                src={course.bild_url}
                alt=""
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  border: "1px solid #E8E4E0",
                  backgroundColor: "#E8E4E0",
                  marginBottom: "16px",
                }}
              />
            ) : null}
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "10px",
                color: "#2E2E2E",
              }}
            >
              {title}
            </h1>
            <p style={{ color: "#6B6562", lineHeight: 1.7, marginTop: 0 }}>
              {description}
            </p>

            <div style={{ color: "#6B6562", fontSize: "0.95rem", marginTop: "12px" }}>
              Anzahl Module: {moduleCount}
            </div>

            <div style={{ marginTop: "18px" }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "#2E2E2E",
                  marginBottom: "10px",
                  fontSize: "1.05rem",
                }}
              >
                Module
              </div>
              {modules.length === 0 ? (
                <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
                  Keine Module gefunden.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {modules.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        backgroundColor: "#FAF7F3",
                        border: "1px solid #E8E4E0",
                        borderRadius: "12px",
                        padding: "14px 14px",
                      }}
                    >
                      <div style={{ color: "#6B6562", fontSize: "0.85rem", marginBottom: "4px" }}>
                        Modul {m.reihenfolge ?? "—"}
                      </div>
                      <div style={{ fontWeight: 700, color: "#2E2E2E" }}>
                        {m.titel ?? "Unbenannt"}
                      </div>
                      <div style={{ color: "#6B6562", fontSize: "0.9rem", lineHeight: 1.6, marginTop: "6px" }}>
                        {m.beschreibung ?? "Keine Beschreibung vorhanden."}
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <Link
                          href={`/dashboard/kurse/${courseId}/modul/${m.id}`}
                          style={{
                            display: "inline-block",
                            padding: "10px 16px",
                            borderRadius: "999px",
                            backgroundColor: "#8B3A3A",
                            color: "#FFFFFF",
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            textDecoration: "none",
                          }}
                        >
                          Modul ansehen
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

