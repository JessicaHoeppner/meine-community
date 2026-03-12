"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

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

      if (modulesError) {
        setError(modulesError.message);
        setLoading(false);
        return;
      }

      const list = (moduleData as ModuleRow[]) ?? [];
      setModules(list);
      const found = list.find((m) => m.id === modulId) ?? null;
      setCurrent(found);
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        .back-link:hover    { color: #9f3129 !important; }
        .nav-btn-next:hover:not(:disabled) { background-color: #9f3129 !important; }
        .nav-btn-prev:hover:not(:disabled) { border-color: rgba(60,44,36,0.4) !important; color: #3c2c24 !important; }
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
              href={`/dashboard/kurse/${kursId}`}
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
              ← Zurück zum Kurs
            </Link>
          </div>

          {loading ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Laden…</div>
          ) : error ? (
            <div style={{ padding: "13px 16px", borderRadius: "12px", backgroundColor: "#fce9e9", border: "1px solid rgba(180,59,50,0.12)", color: "#b43b32", fontSize: "14px" }}>
              {error}
            </div>
          ) : !current ? (
            <div style={{ color: "#7a6d65", fontSize: "15px" }}>Modul nicht gefunden.</div>
          ) : (
            <div
              style={{
                backgroundColor: "#fbf8f4",
                border: "1px solid rgba(60,44,36,0.07)",
                borderRadius: "28px",
                padding: "44px 40px 36px",
                boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
              }}
            >
              {/* Modul-Label */}
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
                Modul {current.reihenfolge ?? "—"}
              </p>

              {/* Modul-Titel */}
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "38px",
                fontWeight: 300,
                lineHeight: 1.15,
                letterSpacing: "0.01em",
                color: "#3c2c24",
                margin: 0,
              }}>
                <em style={{ fontStyle: "italic" }}>{current.titel ?? "Unbenanntes Modul"}</em>
              </h1>

              {/* Divider */}
              <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "20px 0 20px", opacity: 0.4 }} />

              {/* Beschreibung */}
              <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", color: "#7a6d65", fontSize: "15px", lineHeight: 1.75, margin: "0 0 32px", maxWidth: "600px" }}>
                {current.beschreibung ?? "Keine Beschreibung vorhanden."}
              </p>

              {/* Video */}
              {embedUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: "#1a1410",
                    marginBottom: "32px",
                  }}
                >
                  <iframe
                    src={embedUrl}
                    title="YouTube Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </div>
              ) : (
                <div style={{ color: "#9b8f87", fontSize: "14px", marginBottom: "32px", fontFamily: "'Manrope', system-ui, sans-serif" }}>
                  Kein Video hinterlegt.
                </div>
              )}

              {/* Trennlinie */}
              <div style={{ height: "1px", backgroundColor: "rgba(60,44,36,0.06)", marginBottom: "24px" }} />

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!prev) return;
                    router.push(`/dashboard/kurse/${kursId}/modul/${prev.id}`);
                  }}
                  disabled={!prev}
                  className="nav-btn-prev"
                  style={{
                    padding: "13px 24px",
                    borderRadius: "50px",
                    border: "1px solid rgba(60,44,36,0.18)",
                    backgroundColor: "transparent",
                    color: "#7a6d65",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    letterSpacing: "0.02em",
                    cursor: prev ? "pointer" : "default",
                    opacity: prev ? 1 : 0.35,
                    transition: "border-color 0.2s ease, color 0.2s ease",
                  }}
                >
                  ← Vorheriges Modul
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!next) return;
                    router.push(`/dashboard/kurse/${kursId}/modul/${next.id}`);
                  }}
                  disabled={!next}
                  className="nav-btn-next"
                  style={{
                    padding: "13px 24px",
                    borderRadius: "50px",
                    border: "none",
                    backgroundColor: "#b43b32",
                    color: "#ffffff",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    letterSpacing: "0.04em",
                    cursor: next ? "pointer" : "default",
                    opacity: next ? 1 : 0.35,
                    transition: "background-color 0.2s ease",
                  }}
                >
                  Nächstes Modul →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function toYouTubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input);

    if (url.hostname.includes("youtube.com") && url.pathname.startsWith("/embed/")) {
      return url.toString();
    }

    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;

      const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);
      if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    return null;
  } catch {
    const id = input.trim();
    if (/^[a-zA-Z0-9_-]{6,}$/.test(id)) {
      return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  }
}
