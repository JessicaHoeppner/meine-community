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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, rolle")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const role = (profile as ProfileRow | null)?.rolle ?? null;
      const admin = role?.toLowerCase() === "admin";
      setIsAdmin(admin);
      if (!admin) {
        setLoading(false);
        return;
      }

      const { data: courseData, error: coursesError } = await supabase
        .from("courses")
        .select("id, titel, beschreibung, veroeffentlicht, erstellt_am")
        .order("erstellt_am", { ascending: false });

      if (coursesError) {
        setError(coursesError.message);
        setLoading(false);
        return;
      }

      const list = (courseData as CourseRow[]) ?? [];
      setCourses(list);

      const ids = list.map((c) => c.id);
      if (ids.length > 0) {
        const { data: moduleRows } = await supabase
          .from("modules")
          .select("kurs_id")
          .in("kurs_id", ids);

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

    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setModuleCounts((prev) => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
  };

  const cardStyle = useMemo(
    () => ({
      backgroundColor: "#FFFFFF",
      border: "1px solid #E8E4E0",
      borderRadius: "16px",
      padding: "20px",
    }),
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: 0,
              color: "#2E2E2E",
            }}
          >
            Admin · Kurse
          </h1>

          <Link
            href="/dashboard/admin/kurse/neu"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              borderRadius: "999px",
              backgroundColor: "#8B3A3A",
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            Neuen Kurs erstellen
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
              marginBottom: "12px",
            }}
          >
            {error}
          </div>
        ) : !isAdmin ? (
          <div style={cardStyle}>
            <div style={{ fontWeight: 700, color: "#2E2E2E", marginBottom: "8px" }}>
              Kein Zugriff
            </div>
            <Link
              href="/dashboard"
              style={{
                color: "#8B3A3A",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Zum Dashboard
            </Link>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
            Keine Kurse vorhanden.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {courses.map((c) => (
              <div key={c.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ minWidth: "220px", flex: "1 1 auto" }}>
                    <div style={{ fontWeight: 800, color: "#2E2E2E", fontSize: "1.05rem" }}>
                      {c.titel ?? "Unbenannter Kurs"}
                    </div>
                    <div style={{ color: "#6B6562", fontSize: "0.9rem", marginTop: "6px", lineHeight: 1.6 }}>
                      {c.beschreibung ?? "Keine Beschreibung vorhanden."}
                    </div>
                    <div style={{ color: "#6B6562", fontSize: "0.9rem", marginTop: "10px" }}>
                      Veroeffentlicht: {c.veroeffentlicht ? "Ja" : "Nein"} · Anzahl Module:{" "}
                      {moduleCounts[c.id] ?? 0}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Link
                      href={`/dashboard/admin/kurse/${c.id}`}
                      style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        borderRadius: "999px",
                        border: "1px solid #E8E4E0",
                        backgroundColor: "#FFFFFF",
                        color: "#2E2E2E",
                        textDecoration: "none",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      Bearbeiten
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "999px",
                        border: "none",
                        backgroundColor: "#8B3A3A",
                        color: "#FFFFFF",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      Loeschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

