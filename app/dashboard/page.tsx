"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import AuthGuard from "@/src/components/AuthGuard";

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState<string>("deiner Community");

  return (
    <AuthGuard>
      <DashboardInner displayName={displayName} setDisplayName={setDisplayName} />
    </AuthGuard>
  );
}

type Stats = {
  aktivKurse: number;
  moduleAbgeschlossen: number;
  gesamtfortschritt: number;
  beitraege: number;
};

function DashboardInner({
  displayName,
  setDisplayName,
}: Readonly<{
  displayName: string;
  setDisplayName: (value: string) => void;
}>) {
  const [stats, setStats] = React.useState<Stats | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const nameFromMeta =
        (user?.user_metadata?.name as string | undefined) ??
        (user?.user_metadata?.full_name as string | undefined);

      setDisplayName(nameFromMeta || user?.email || "deiner Community");

      if (!user) return;

      const { data: progressData } = await supabase
        .from("module_progress")
        .select("modul_id, kurs_id")
        .eq("nutzer_id", user.id)
        .eq("erledigt", true);

      const progress = (progressData ?? []) as { modul_id: string; kurs_id: string }[];
      const moduleAbgeschlossen = progress.length;

      const kursIds = [...new Set(progress.map((p) => String(p.kurs_id)))];
      const aktivKurse = kursIds.length;

      let gesamtfortschritt = 0;
      if (kursIds.length > 0) {
        const { data: moduleData } = await supabase
          .from("modules")
          .select("id, kurs_id")
          .in("kurs_id", kursIds);
        const alleModule = (moduleData ?? []) as { id: string; kurs_id: string }[];
        if (alleModule.length > 0) {
          gesamtfortschritt = Math.round((moduleAbgeschlossen / alleModule.length) * 100);
        }
      }

      const { count: postCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("autor_id", user.id);

      setStats({
        aktivKurse,
        moduleAbgeschlossen,
        gesamtfortschritt,
        beitraege: typeof postCount === "number" ? postCount : 0,
      });
    };

    loadUser();
  }, [setDisplayName]);

  const cards: Array<{
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
  }> = [
    {
      title: "Meine Kurse",
      description: "Starte neue Kurse oder mache dort weiter, wo du aufgehört hast.",
      href: "/dashboard/kurse",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
    },
    {
      title: "Community",
      description: "Stelle Fragen, teile Fortschritte und bleib motiviert.",
      href: "/dashboard/community",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      title: "Mein Profil",
      description: "Verwalte deine Daten und Einstellungen.",
      href: "/dashboard/profil",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      title: "Mitglieder",
      description: "Finde andere Mitglieder und entdecke ihre Profile.",
      href: "/dashboard/mitglieder",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
  ];

  return (
    <main
      style={{
        maxWidth: "var(--max-width-narrow)",
        margin: "0 auto",
        padding: "var(--space-2xl) var(--space-lg)",
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <p
          style={{
            fontSize: "var(--text-overline)",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Willkommen zurück
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h2)",
            fontWeight: 300,
            lineHeight: 1.2,
            color: "var(--color-text)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Dein <em style={{ fontStyle: "italic" }}>Dashboard</em>
        </h1>
        <p
          style={{
            fontSize: "var(--text-button)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
          }}
        >
          Schön, dass du da bist,{" "}
          <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
            {displayName}
          </span>
          .
        </p>
      </div>

      {/* Statistiken */}
      {stats !== null && (
        <section
          className="dash-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--space-md)",
            marginBottom: "var(--space-xl)",
          }}
        >
          {[
            { value: String(stats.aktivKurse), label: "Aktive Kurse" },
            { value: String(stats.moduleAbgeschlossen), label: "Module abgeschlossen" },
            { value: `${stats.gesamtfortschritt}%`, label: "Gesamtfortschritt" },
            { value: String(stats.beitraege), label: "Beiträge geschrieben" },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "32px",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  lineHeight: 1.1,
                  marginBottom: "var(--space-xs)",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Karten-Grid */}
      <section
        className="dash-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-lg)",
          alignItems: "stretch",
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
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
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                marginBottom: "var(--space-md)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-primary-subtle)",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <h2
                className="dash-card-title"
                style={{
                  fontSize: "var(--text-body)",
                  fontWeight: 600,
                  margin: 0,
                  color: "var(--color-text)",
                  transition: "color 0.2s ease",
                }}
              >
                {card.title}
              </h2>
            </div>

            <div
              style={{
                height: "1px",
                backgroundColor: "var(--color-border)",
                marginBottom: "var(--space-md)",
              }}
            />

            <p
              style={{
                margin: 0,
                fontSize: "var(--text-body-sm)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                flexGrow: 1,
              }}
            >
              {card.description}
            </p>

            <div
              style={{
                marginTop: "var(--space-md)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <span
                className="dash-card-arrow"
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-muted)",
                  transition: "color 0.2s ease, opacity 0.2s ease",
                  opacity: 0.7,
                }}
              >
                Öffnen →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
