"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";
import { Alert, EmptyState } from "@/src/components/ui";

type CourseRow = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  bild_url: string | null;
  ersteller_id: string | null;
  veroeffentlicht: boolean | null;
  erstellt_am: string | null;
};

type InProgressKurs = {
  kurs_id: string;
  titel: string;
  erledigt: number;
  gesamt: number;
  letzteAktivitaet: string;
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
  const [inProgressKurse, setInProgressKurse] = useState<InProgressKurs[]>([]);
  const [erledigtProKurs, setErledigtProKurs] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, titel, beschreibung, bild_url, ersteller_id, veroeffentlicht, erstellt_am")
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

    const loadInProgress = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;

      const { data: progressData, error: progressError } = await supabase
        .from("module_progress")
        .select("modul_id, erledigt_am")
        .eq("nutzer_id", user.id)
        .eq("erledigt", true);

      if (progressError || !progressData || progressData.length === 0) return;

      const erledigteModulIds = progressData.map((p) => String(p.modul_id));

      const { data: moduleData, error: moduleError } = await supabase
        .from("modules")
        .select("id, kurs_id")
        .in("id", erledigteModulIds);

      if (moduleError || !moduleData || moduleData.length === 0) return;

      const erledigtMap: Record<string, number> = {};
      for (const m of moduleData) {
        const k = String(m.kurs_id);
        erledigtMap[k] = (erledigtMap[k] ?? 0) + 1;
      }
      setErledigtProKurs(erledigtMap);

      const kursIds = [...new Set(moduleData.map((m) => String(m.kurs_id)))];

      const { data: alleModule, error: alleModuleError } = await supabase
        .from("modules")
        .select("id, kurs_id")
        .in("kurs_id", kursIds);

      const { data: kurseData, error: kurseError } = await supabase
        .from("kurse")
        .select("id, titel")
        .in("id", kursIds);

      if (alleModuleError || kurseError || !kurseData || !alleModule) return;

      const erledigungsDaten = new Map(
        progressData.map((p) => [String(p.modul_id), p.erledigt_am])
      );

      const result: InProgressKurs[] = [];

      for (const kurs of kurseData) {
        const kursIdStr = String(kurs.id);
        const alleModuleDesKurses = alleModule.filter((m) => String(m.kurs_id) === kursIdStr);
        const gesamt = alleModuleDesKurses.length;
        const erledigtIds = alleModuleDesKurses
          .filter((m) => erledigteModulIds.includes(String(m.id)))
          .map((m) => String(m.id));
        const erledigt = erledigtIds.length;

        if (erledigt === 0 || erledigt === gesamt) continue;

        const letzteAktivitaet = erledigtIds
          .map((id) => erledigungsDaten.get(id) ?? "")
          .sort()
          .reverse()[0] ?? "";

        result.push({ kurs_id: kurs.id, titel: kurs.titel, erledigt, gesamt, letzteAktivitaet });
      }

      result.sort((a, b) => b.letzteAktivitaet.localeCompare(a.letzteAktivitaet));
      setInProgressKurse(result.slice(0, 3));
    };

    load();
    loadInProgress();
  }, []);

  return (
    <main style={{ maxWidth: "var(--max-width-narrow)", margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <p style={{ fontSize: "var(--text-overline)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "var(--space-sm)" }}>
          Dein Lernbereich
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 300, lineHeight: 1.2, color: "var(--color-text)", marginBottom: "var(--space-sm)" }}>
          Meine <em style={{ fontStyle: "italic" }}>Kurse</em>
        </h1>
        <p style={{ fontSize: "var(--text-button)", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Lerne in deinem eigenen Tempo und entwickle dich weiter.
        </p>
      </div>

      {/* Weitermachen */}
      {inProgressKurse.length > 0 && (
        <section style={{ marginBottom: "var(--space-2xl)" }}>
          <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 500, color: "var(--color-text)", marginBottom: "var(--space-lg)" }}>
            Weitermachen
          </h2>
          <div style={{ display: "flex", gap: "var(--space-md)", overflowX: "auto", paddingBottom: "4px" }}>
            {inProgressKurse.map((kurs) => {
              const prozent = Math.round((kurs.erledigt / kurs.gesamt) * 100);
              return (
                <div
                  key={kurs.kurs_id}
                  style={{
                    flexShrink: 0,
                    width: "260px",
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-lg)",
                    boxShadow: "var(--shadow-card)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-sm)",
                  }}
                >
                  <p style={{ fontSize: "var(--text-body)", fontWeight: 500, color: "var(--color-text)", margin: 0, lineHeight: 1.3 }}>
                    {kurs.titel}
                  </p>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-secondary)", margin: 0 }}>
                    {kurs.erledigt} von {kurs.gesamt} Modulen · {prozent}%
                  </p>
                  {/* Progress Bar */}
                  <div style={{ height: "6px", borderRadius: "var(--radius-pill)", backgroundColor: "var(--bg-elevated)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${prozent}%`, backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-pill)", transition: "width 0.4s ease" }} />
                  </div>
                  <Link
                    href={`/dashboard/kurse/${kurs.kurs_id}`}
                    className="btn-primary"
                    style={{ alignSelf: "flex-start", padding: "8px 20px", fontSize: "var(--text-caption)", marginTop: "var(--space-xs)" }}
                  >
                    Weiter →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Alle Kurse */}
      <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 500, color: "var(--color-text)", marginBottom: "var(--space-lg)" }}>
        Alle Kurse
      </h2>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-button)" }}>Laden…</p>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : courses.length === 0 ? (
        <EmptyState title="Noch keine Kurse vorhanden" description="Sobald Kurse veröffentlicht werden, findest du sie hier." />
      ) : (
        <section
          className="kurse-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-lg)", alignItems: "stretch" }}
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} moduleCount={moduleCounts[course.id] ?? null} erledigtCount={erledigtProKurs[course.id] ?? 0} />
          ))}
        </section>
      )}
    </main>
  );
}

function CourseCard({ course, moduleCount, erledigtCount }: Readonly<{ course: CourseRow; moduleCount: number | null; erledigtCount: number }>) {
  const title = course.titel ?? "Unbenannter Kurs";
  const description = course.beschreibung ?? "Keine Beschreibung vorhanden.";
  const gesamt = moduleCount ?? 0;
  const prozent = gesamt > 0 ? Math.round((erledigtCount / gesamt) * 100) : 0;
  const angefangen = erledigtCount > 0 && erledigtCount < gesamt;

  const countLabel = useMemo(() => {
    if (moduleCount == null) return "—";
    return String(moduleCount);
  }, [moduleCount]);

  return (
    <Link
      href={`/dashboard/kurse/${course.id}`}
      className="dash-card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
        boxShadow: "var(--shadow-card)",
        minHeight: "220px",
        height: "100%",
      }}
    >
      {course.bild_url && (
        <img
          src={course.bild_url}
          alt=""
          style={{
            width: "100%",
            height: "130px",
            objectFit: "cover",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--bg-elevated)",
            marginBottom: "var(--space-md)",
            flexShrink: 0,
          }}
        />
      )}

      <div className="dash-card-title" style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "var(--text-body)", marginBottom: "var(--space-sm)", transition: "color 0.2s ease", lineHeight: 1.3 }}>
        {title}
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--color-border)", marginBottom: "var(--space-sm)" }} />

      <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-sm)", lineHeight: 1.65, flexGrow: 1 }}>
        {description}
      </div>

      {erledigtCount > 0 && gesamt > 0 && (
        <div style={{ marginTop: "var(--space-md)" }}>
          <div style={{ fontSize: "var(--text-micro)", color: "var(--color-text-secondary)", marginBottom: "var(--space-sm)" }}>
            {erledigtCount} von {gesamt} {gesamt === 1 ? "Modul" : "Modulen"} abgeschlossen
          </div>
          <div style={{ height: "5px", borderRadius: "var(--radius-pill)", backgroundColor: "var(--bg-elevated)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${prozent}%`, backgroundColor: "var(--color-primary)", borderRadius: "var(--radius-pill)", transition: "width 0.4s ease" }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: "var(--space-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-micro)" }}>
          {countLabel} {moduleCount === 1 ? "Modul" : "Module"}
        </div>
        {angefangen ? (
          <span className="dash-card-arrow" style={{ fontSize: "var(--text-caption)", color: "var(--color-primary)", fontWeight: 500 }}>Weitermachen →</span>
        ) : (
          <span className="dash-card-arrow" style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)", opacity: 0.7 }}>Öffnen →</span>
        )}
      </div>
    </Link>
  );
}
