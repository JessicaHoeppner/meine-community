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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "14px" }}>
          <Link
            href={`/dashboard/kurse/${kursId}`}
            style={{
              color: "#8B3A3A",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            ← Zurueck zum Kurs
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
        ) : !current ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
            Modul nicht gefunden.
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
            <div style={{ color: "#6B6562", fontSize: "0.9rem", marginBottom: "6px" }}>
              Modul {current.reihenfolge ?? "—"}
            </div>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: "10px",
                color: "#2E2E2E",
              }}
            >
              {current.titel ?? "Unbenanntes Modul"}
            </h1>
            <p style={{ color: "#6B6562", lineHeight: 1.7, marginTop: 0 }}>
              {current.beschreibung ?? "Keine Beschreibung vorhanden."}
            </p>

            <div style={{ marginTop: "16px" }}>
              {embedUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid #E8E4E0",
                    backgroundColor: "#000000",
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
                <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>
                  Kein Video hinterlegt.
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                marginTop: "20px",
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
                style={{
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "1px solid #E8E4E0",
                  backgroundColor: "#FFFFFF",
                  color: "#2E2E2E",
                  fontWeight: 500,
                  cursor: prev ? "pointer" : "default",
                  opacity: prev ? 1 : 0.6,
                }}
              >
                Vorheriges Modul
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!next) return;
                  router.push(`/dashboard/kurse/${kursId}/modul/${next.id}`);
                }}
                disabled={!next}
                style={{
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#8B3A3A",
                  color: "#FFFFFF",
                  fontWeight: 500,
                  cursor: next ? "pointer" : "default",
                  opacity: next ? 1 : 0.6,
                }}
              >
                Naechstes Modul
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function toYouTubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input);

    // Already embed
    if (url.hostname.includes("youtube.com") && url.pathname.startsWith("/embed/")) {
      return url.toString();
    }

    // youtu.be/<id>
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // youtube.com/watch?v=<id>
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;

      // youtube.com/shorts/<id>
      const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);
      if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    return null;
  } catch {
    // If it's not a valid URL, try to treat it as a raw video id
    const id = input.trim();
    if (/^[a-zA-Z0-9_-]{6,}$/.test(id)) {
      return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  }
}

