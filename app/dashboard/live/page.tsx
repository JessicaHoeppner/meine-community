"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type LiveSession = {
  id: string;
  titel: string;
  beschreibung: string | null;
  datum: string;
  status: "geplant" | "live" | "beendet";
  meeting_link: string | null;
};

export default function LivePage() {
  return (
    <AuthGuard>
      <LiveInner />
    </AuthGuard>
  );
}

function LiveInner() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("live_sessions")
        .select("id, titel, beschreibung, datum, status, meeting_link")
        .order("datum", { ascending: true });
      setSessions((data as LiveSession[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const kommende = sessions.filter((s) => s.status === "geplant" || s.status === "live");
  const vergangene = sessions.filter((s) => s.status === "beendet");

  return (
        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "64px 24px 100px" }}>

          {/* Header */}
          <div style={{ marginBottom: "56px" }}>
            <Link href="/dashboard" className="back-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#9b8f87", fontSize: "13px", fontWeight: 500, textDecoration: "none", marginBottom: "32px", letterSpacing: "0.02em", transition: "color 0.2s ease" }}>
              ← Dashboard
            </Link>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 20px", opacity: 0.85 }}>
              Live
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "48px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "var(--color-text)", margin: 0 }}>
              <em>Live Sessions</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "22px 0 20px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "15px", color: "#7a6d65", lineHeight: 1.75, maxWidth: "400px" }}>
              Gemeinsam lernen, in Echtzeit.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#9b8f87", fontSize: "15px" }}>Laden…</div>
          ) : (
            <>
              {/* Kommende & Live */}
              <section style={{ marginBottom: "64px" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 300, color: "var(--color-text)", margin: "0 0 28px", letterSpacing: "0.01em" }}>
                  Kommende Sessions
                </h2>
                {kommende.length === 0 ? (
                  <p style={{ color: "#9b8f87", fontSize: "15px" }}>Aktuell keine geplanten Sessions.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {kommende.map((s) => (
                      <SessionCard key={s.id} session={s} />
                    ))}
                  </div>
                )}
              </section>

              {/* Vergangene */}
              {vergangene.length > 0 && (
                <section>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 300, color: "var(--color-text)", margin: "0 0 28px", letterSpacing: "0.01em" }}>
                    Vergangene Sessions
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {vergangene.map((s) => (
                      <SessionCard key={s.id} session={s} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
  );
}

function SessionCard({ session }: { session: LiveSession }) {
  const isLive = session.status === "live";
  const isBeendet = session.status === "beendet";

  const formattedDate = new Date(session.datum).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(session.datum).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/dashboard/live/${session.id}`}
      className="session-card"
      style={{
        display: "flex",
        gap: "24px",
        alignItems: "flex-start",
        backgroundColor: "#fbf8f4",
        border: "1px solid rgba(60,44,36,0.08)",
        borderRadius: "20px",
        padding: "24px 28px",
        boxShadow: "0 2px 16px rgba(60,44,36,0.05)",
        textDecoration: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        opacity: isBeendet ? 0.65 : 1,
      }}
    >
      {/* Icon */}
      <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: isLive ? "#b43b32" : "#ede5dc", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isLive ? "#fff" : "#b3a89e"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10,8 16,12 10,16" fill={isLive ? "#fff" : "#b3a89e"} stroke="none"/>
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          {isLive && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: "var(--color-primary)", color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "50px", padding: "3px 10px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fff", display: "inline-block", animation: "pulse-live 1.4s ease-in-out infinite" }} />
              Live
            </span>
          )}
          {session.status === "geplant" && (
            <span style={{ display: "inline-flex", alignItems: "center", backgroundColor: "rgba(60,44,36,0.06)", color: "#7a6d65", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "50px", padding: "3px 10px" }}>
              Geplant
            </span>
          )}
          {isBeendet && (
            <span style={{ display: "inline-flex", alignItems: "center", backgroundColor: "rgba(60,44,36,0.06)", color: "#9b8f87", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "50px", padding: "3px 10px" }}>
              Beendet
            </span>
          )}
        </div>

        <div className="session-title" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 400, color: "var(--color-text)", marginBottom: "6px", transition: "color 0.2s ease", lineHeight: 1.25 }}>
          {session.titel}
        </div>

        {session.beschreibung && (
          <p style={{ margin: "0 0 10px", color: "#7a6d65", fontSize: "14px", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {session.beschreibung}
          </p>
        )}

        <div style={{ fontSize: "13px", color: "#9b8f87", fontWeight: 500 }}>
          {formattedDate} · {formattedTime} Uhr
        </div>
      </div>

      {/* Arrow */}
      {!isBeendet && (
        <div style={{ flexShrink: 0, color: "var(--color-primary)", fontSize: "20px", alignSelf: "center" }}>→</div>
      )}
    </Link>
  );
}