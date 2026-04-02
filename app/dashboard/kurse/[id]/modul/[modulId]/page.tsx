"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";
import { Alert } from "@/src/components/ui";

type ModuleRow = {
  id: string;
  kurs_id: string;
  titel: string | null;
  beschreibung: string | null;
  video_url: string | null;
  reihenfolge: number | null;
  erstellt_am: string | null;
};

export default function ModulDetailPage() {
  return (
    <AuthGuard>
      <ModulDetailInner />
    </AuthGuard>
  );
}

function ModulDetailInner() {
  const router = useRouter();
  const params = useParams<{ id: string; modulId: string }>();
  const kursId = params?.id;
  const modulId = params?.modulId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [current, setCurrent] = useState<ModuleRow | null>(null);
  const [completed, setCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!kursId || !modulId) return;
      setLoading(true);
      setError(null);

      const { data: moduleData, error: modulesError } = await supabase
        .from("modules")
        .select("id, kurs_id, titel, beschreibung, video_url, reihenfolge, erstellt_am")
        .eq("kurs_id", kursId)
        .order("reihenfolge", { ascending: true });

      if (modulesError) { setError(modulesError.message); setLoading(false); return; }

      const list = (moduleData as ModuleRow[]) ?? [];
      setModules(list);
      setCurrent(list.find((m) => m.id === modulId) ?? null);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && modulId) {
        const { data: progressRow } = await supabase
          .from("module_progress")
          .select("erledigt")
          .eq("nutzer_id", user.id)
          .eq("modul_id", modulId)
          .maybeSingle();
        setCompleted(progressRow?.erledigt === true);
      }

      setLoading(false);
    };

    load();
  }, [kursId, modulId]);

  const index = useMemo(() => {
    if (!current) return -1;
    return modules.findIndex((m) => m.id === current.id);
  }, [modules, current]);

  const prev = index > 0 ? modules[index - 1] : null;
  const next = index >= 0 && index < modules.length - 1 ? modules[index + 1] : null;

  const embedUrl = useMemo(() => {
    const raw = current?.video_url?.trim();
    if (!raw) return null;
    return toYouTubeEmbedUrl(raw);
  }, [current?.video_url]);

  return (
    <main style={{ maxWidth: "var(--max-width-narrow)", margin: "0 auto", padding: "var(--space-2xl) var(--space-lg)" }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <Link
          href={`/dashboard/kurse/${kursId}`}
          style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500, fontSize: "var(--text-body-sm)", transition: "opacity 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ← Zurück zum Kurs
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Laden…</p>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : !current ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Modul nicht gefunden.</p>
      ) : (
        <div style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-xl)",
          boxShadow: "var(--shadow-card)",
        }}>
          {/* Modul-Label */}
          <p style={{ fontSize: "var(--text-overline)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "var(--space-sm)" }}>
            Modul {current.reihenfolge ?? "—"}
          </p>

          {/* Modul-Titel */}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", fontWeight: 300, lineHeight: 1.15, color: "var(--color-text)", marginBottom: "var(--space-md)" }}>
            <em style={{ fontStyle: "italic" }}>{current.titel ?? "Unbenanntes Modul"}</em>
          </h1>

          {/* Beschreibung */}
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-button)", lineHeight: 1.75, marginBottom: "var(--space-xl)", maxWidth: "600px" }}>
            {current.beschreibung ?? "Keine Beschreibung vorhanden."}
          </p>

          {/* Video */}
          {embedUrl ? (
            <div style={{
              position: "relative", width: "100%", paddingTop: "56.25%",
              borderRadius: "var(--radius-md)", overflow: "hidden",
              backgroundColor: "#1a1410", marginBottom: "var(--space-xl)",
            }}>
              <iframe
                src={embedUrl}
                title="YouTube Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
          ) : (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-body-sm)", marginBottom: "var(--space-xl)" }}>
              Kein Video hinterlegt.
            </p>
          )}

          {/* Als erledigt markieren */}
          <div style={{ marginBottom: "var(--space-xl)" }}>
            <button
              type="button"
              disabled={progressSaving}
              className={completed ? "btn-primary" : "btn-secondary"}
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user || !modulId) return;
                setProgressSaving(true);
                try {
                  await supabase.from("module_progress").upsert(
                    { nutzer_id: user.id, modul_id: modulId, erledigt: true, erledigt_am: new Date().toISOString() },
                    { onConflict: "nutzer_id,modul_id" }
                  );
                  setCompleted(true);
                } finally {
                  setProgressSaving(false);
                }
              }}
              style={completed ? {
                backgroundColor: "var(--color-success)",
                boxShadow: "none",
                cursor: "default",
              } : undefined}
            >
              {completed ? "Erledigt ✓" : "Als erledigt markieren"}
            </button>
          </div>

          {/* Trennlinie */}
          <div style={{ height: "1px", backgroundColor: "var(--color-border)", marginBottom: "var(--space-lg)" }} />

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-sm)", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => prev && router.push(`/dashboard/kurse/${kursId}/modul/${prev.id}`)}
              disabled={!prev}
              className="btn-secondary"
              style={{ opacity: prev ? 1 : 0.35 }}
            >
              ← Vorheriges Modul
            </button>
            <button
              type="button"
              onClick={() => next && router.push(`/dashboard/kurse/${kursId}/modul/${next.id}`)}
              disabled={!next}
              className="btn-primary"
              style={{ opacity: next ? 1 : 0.35, boxShadow: "none" }}
            >
              Nächstes Modul →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function toYouTubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtube.com") && url.pathname.startsWith("/embed/")) return url.toString();
    if (url.hostname === "youtu.be") { const id = url.pathname.replace("/", "").trim(); return id ? `https://www.youtube.com/embed/${id}` : null; }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);
      if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }
    return null;
  } catch {
    const id = input.trim();
    if (/^[a-zA-Z0-9_-]{6,}$/.test(id)) return `https://www.youtube.com/embed/${id}`;
    return null;
  }
}
