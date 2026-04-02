"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type Gruppe = {
  id: string;
  name: string;
  beschreibung: string | null;
  memberCount: number;
  isMember: boolean;
};

export default function GruppenPage() {
  return (
    <AuthGuard>
      <GruppenInner />
    </AuthGuard>
  );
}

function GruppenInner() {
  const [gruppen, setGruppen] = useState<Gruppe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      setCurrentUserId(userId);

      const { data: gruppenData } = await supabase
        .from("gruppen")
        .select("id, name, beschreibung")
        .order("name", { ascending: true });

      if (!gruppenData) { setLoading(false); return; }

      const gruppenIds = (gruppenData as { id: string }[]).map((g) => g.id);

      const { data: mitgliederData } = await supabase
        .from("gruppen_mitglieder")
        .select("gruppen_id, nutzer_id")
        .in("gruppen_id", gruppenIds);

      const countMap: Record<string, number> = {};
      const memberSet = new Set<string>();
      for (const row of (mitgliederData ?? []) as { gruppen_id: string; nutzer_id: string }[]) {
        countMap[String(row.gruppen_id)] = (countMap[String(row.gruppen_id)] ?? 0) + 1;
        if (userId && String(row.nutzer_id) === String(userId)) {
          memberSet.add(String(row.gruppen_id));
        }
      }

      setGruppen(
        (gruppenData as { id: string; name: string; beschreibung: string | null }[]).map((g) => ({
          id: g.id,
          name: g.name,
          beschreibung: g.beschreibung,
          memberCount: countMap[String(g.id)] ?? 0,
          isMember: memberSet.has(String(g.id)),
        }))
      );
      setLoading(false);
    };
    load();
  }, []);

  const toggleMitglied = async (gruppeId: string, isMember: boolean) => {
    if (!currentUserId || toggling) return;
    setToggling(gruppeId);

    if (isMember) {
      await supabase
        .from("gruppen_mitglieder")
        .delete()
        .eq("gruppen_id", gruppeId)
        .eq("nutzer_id", currentUserId);
    } else {
      await supabase.from("gruppen_mitglieder").insert({
        gruppen_id: gruppeId,
        nutzer_id: currentUserId,
      });
    }

    setGruppen((prev) =>
      prev.map((g) =>
        String(g.id) === String(gruppeId)
          ? { ...g, isMember: !isMember, memberCount: g.memberCount + (isMember ? -1 : 1) }
          : g
      )
    );
    setToggling(null);
  };

  return (
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 24px 100px" }}>

          <Link href="/dashboard/community" className="back-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#9b8f87", fontSize: "13px", fontWeight: 500, textDecoration: "none", marginBottom: "36px", letterSpacing: "0.02em", transition: "color 0.2s ease" }}>
            ← Community
          </Link>

          <div style={{ marginBottom: "48px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 20px", opacity: 0.85 }}>
              Community
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "48px", fontWeight: 300, lineHeight: 1.1, letterSpacing: "0.01em", color: "var(--color-text)", margin: 0 }}>
              <em>Gruppen</em>
            </h1>
            <div style={{ width: "36px", height: "1px", backgroundColor: "var(--color-primary)", margin: "22px 0 20px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "15px", color: "#7a6d65", lineHeight: 1.75, maxWidth: "400px" }}>
              Tritt Gruppen bei und diskutiere in deinem Interessensbereich.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#9b8f87", fontSize: "15px" }}>Laden…</div>
          ) : gruppen.length === 0 ? (
            <div style={{ color: "#9b8f87", fontSize: "15px" }}>Noch keine Gruppen vorhanden.</div>
          ) : (
            <div
              className="gruppen-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
            >
              {gruppen.map((g) => (
                <div
                  key={g.id}
                  className="gruppen-card"
                  style={{
                    backgroundColor: "#fbf8f4",
                    border: "1px solid rgba(60,44,36,0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    boxShadow: "0 2px 16px rgba(60,44,36,0.05)",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 400, color: "var(--color-text)", lineHeight: 1.25 }}>
                    {g.name}
                  </div>

                  {g.beschreibung && (
                    <p style={{ margin: 0, fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "14px", color: "#6f625b", lineHeight: 1.65, flexGrow: 1 }}>
                      {g.beschreibung}
                    </p>
                  )}

                  <div style={{ fontSize: "12px", color: "#9b8f87", fontFamily: "var(--font-body)" }}>
                    {g.memberCount} {g.memberCount === 1 ? "Mitglied" : "Mitglieder"}
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    {g.isMember ? (
                      <button
                        type="button"
                        className="btn-leave"
                        disabled={toggling === g.id}
                        onClick={() => toggleMitglied(g.id, true)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "50px",
                          border: "1px solid rgba(60,44,36,0.18)",
                          backgroundColor: "transparent",
                          color: "#6f625b",
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: toggling === g.id ? "not-allowed" : "pointer",
                          opacity: toggling === g.id ? 0.5 : 1,
                          transition: "border-color 0.2s ease, color 0.2s ease",
                        }}
                      >
                        Verlassen
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-join"
                        disabled={toggling === g.id}
                        onClick={() => toggleMitglied(g.id, false)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "50px",
                          border: "none",
                          backgroundColor: "var(--color-primary)",
                          color: "#fff",
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: toggling === g.id ? "not-allowed" : "pointer",
                          opacity: toggling === g.id ? 0.5 : 1,
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        Beitreten
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
  );
}