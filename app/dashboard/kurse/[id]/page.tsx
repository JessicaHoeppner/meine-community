"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";
import { Alert } from "@/src/components/ui";

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
  dauer?: number | null;
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
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);

      const { data, error: courseError } = await supabase
        .from("courses")
        .select("id, titel, beschreibung, bild_url, ersteller_id, veroeffentlicht, erstellt_am")
        .eq("id", courseId)
        .maybeSingle();

      if (courseError) { setError(courseError.message); setLoading(false); return; }
      setCourse((data as CourseRow) ?? null);

      const { data: moduleData, error: modulesError } = await supabase
        .from("modules")
        .select("id, kurs_id, titel, beschreibung, video_url, reihenfolge, erstellt_am, dauer")
        .eq("kurs_id", courseId)
        .order("reihenfolge", { ascending: true });

      if (modulesError) { setError(modulesError.message); setLoading(false); return; }

      const moduleList = (moduleData as ModuleRow[]) ?? [];
      setModules(moduleList);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && moduleList.length > 0) {
        const { data: progressData } = await supabase
          .from("module_progress")
          .select("modul_id")
          .eq("nutzer_id", user.id)
          .eq("erledigt", true)
          .in("modul_id", moduleList.map((m) => m.id));
        const ids = new Set((progressData ?? []).map((p: { modul_id: string }) => p.modul_id));
        setCompletedModuleIds(ids);
      }

      setLoading(false);
    };

    load();
  }, [courseId]);

  const title = course?.titel ?? "Kurs";
  const description = course?.beschreibung ?? "Keine Beschreibung vorhanden.";
  const moduleCount = modules.length;

  return (
    <main style={{ maxWidth: "var(--max-width-narrow)", margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <Link
          href="/dashboard/kurse"
          style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "var(--text-body-sm)", transition: "opacity 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ← Zurück zu Kursen
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Laden…</p>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : !course ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Kurs nicht gefunden.</p>
      ) : (
        <>
          {/* Kurs-Header-Card */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-card)",
            marginBottom: "var(--space-lg)",
          }}>
            {course.bild_url && (
              <img src={course.bild_url} alt="" style={{
                width: "100%", height: "200px", objectFit: "cover",
                borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)",
                backgroundColor: "var(--bg-elevated)", marginBottom: "var(--space-lg)",
              }} />
            )}

            <p style={{ fontSize: "var(--text-overline)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "var(--space-sm)" }}>
              Kursübersicht
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 300, lineHeight: 1.15, color: "var(--color-text)", marginBottom: "var(--space-sm)" }}>
              <em style={{ fontStyle: "italic" }}>{title}</em>
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-button)", lineHeight: 1.75, marginBottom: "var(--space-sm)", maxWidth: "var(--max-width-text)" }}>
              {description}
            </p>
            <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-micro)" }}>
              {moduleCount} {moduleCount === 1 ? "Modul" : "Module"}
            </div>
          </div>

          {/* Module-Liste */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-card)",
          }}>
            <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 500, color: "var(--color-text)", marginBottom: "var(--space-md)" }}>
              Module
            </h2>

            {moduleCount > 0 && (
              <>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-sm)" }}>
                  {completedModuleIds.size} von {moduleCount} Modulen abgeschlossen
                </p>
                <div style={{ height: "6px", borderRadius: "var(--radius-pill)", backgroundColor: "var(--bg-elevated)", overflow: "hidden", marginBottom: "var(--space-lg)" }}>
                  <div style={{ height: "100%", width: `${moduleCount ? (completedModuleIds.size / moduleCount) * 100 : 0}%`, borderRadius: "var(--radius-pill)", backgroundColor: "var(--color-primary)", transition: "width 0.3s ease" }} />
                </div>
              </>
            )}

            {modules.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>Keine Module gefunden.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                {modules.map((m) => {
                  const isCompleted = completedModuleIds.has(m.id);
                  const dauerMin = m.dauer != null && Number.isFinite(m.dauer) ? m.dauer : null;
                  return (
                    <Link
                      key={m.id}
                      href={`/dashboard/kurse/${courseId}/modul/${m.id}`}
                      className="dash-card"
                      style={{
                        display: "flex", alignItems: "flex-start", textDecoration: "none",
                        backgroundColor: "var(--bg-primary)", border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)", padding: "var(--space-md) var(--space-lg)",
                        gap: "var(--space-md)", boxShadow: "none",
                      }}
                    >
                      <span style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden>
                        {isCompleted ? (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="var(--color-success)"/><path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="var(--color-border-strong)" strokeWidth="2"/></svg>
                        )}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "var(--text-micro)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                          Modul {m.reihenfolge ?? "—"}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <span className="dash-card-title" style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "var(--text-button)", transition: "color 0.2s ease", lineHeight: 1.35 }}>
                            {m.titel ?? "Unbenannt"}
                          </span>
                          {dauerMin != null && (
                            <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                              {dauerMin} Min
                            </span>
                          )}
                        </div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-caption)", lineHeight: 1.6 }}>
                          {m.beschreibung ?? "Keine Beschreibung vorhanden."}
                        </div>
                      </div>
                      <span className="dash-card-arrow" style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)", opacity: 0.7, flexShrink: 0, paddingTop: "2px" }}>→</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
