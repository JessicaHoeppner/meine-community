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

function DashboardInner({
  displayName,
  setDisplayName,
}: Readonly<{
  displayName: string;
  setDisplayName: (value: string) => void;
}>) {
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const nameFromMeta =
        (user?.user_metadata?.name as string | undefined) ??
        (user?.user_metadata?.full_name as string | undefined);

      setDisplayName(nameFromMeta || user?.email || "deiner Community");
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
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M18 10 C15 8 10 8 7 10 L7 28 C10 26 15 26 18 28 C21 26 26 26 29 28 L29 10 C26 8 21 8 18 10 Z" fill="#b43b32"/>
          <line x1="18" y1="10" x2="18" y2="28" stroke="#f7f1e8" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      title: "Community",
      description: "Stelle Fragen, teile Fortschritte und bleib motiviert.",
      href: "/dashboard/community",
      icon: (
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M8 24V12C8 10.3 9.3 9 11 9L25 9C26.7 9 28 10.3 28 12L28 20C28 21.7 26.7 23 25 23L12 23L8 28Z" fill="#b43b32"/>
          <circle cx="14" cy="16" r="1.4" fill="#f7f1e8"/>
          <circle cx="18" cy="16" r="1.4" fill="#f7f1e8"/>
          <circle cx="22" cy="16" r="1.4" fill="#f7f1e8"/>
        </svg>
      ),
    },
    {
      title: "Mein Profil",
      description: "Verwalte deine Daten und Einstellungen.",
      href: "/dashboard/profil",
      icon: (
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="18" cy="13" r="6" fill="#b43b32"/>
          <path d="M6 30C6 24 11.4 19 18 19C24.6 19 30 24 30 30" stroke="#b43b32" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
      ),
    },
    {
      title: "Mitglieder",
      description: "Finde andere Mitglieder und entdecke ihre Profile.",
      href: "/dashboard/mitglieder",
      icon: (
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="13" cy="13" r="5" fill="#b43b32"/>
          <circle cx="23" cy="13" r="5" fill="#b43b32" opacity="0.6"/>
          <path d="M2 30C2 24.5 7 20 13 20C19 20 24 24.5 24 30" stroke="#b43b32" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M23 20C26.5 20 31 23 31 28" stroke="#b43b32" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');

        .dash-card:hover {
          border-color: rgba(180,59,50,0.35) !important;
          box-shadow: 0 8px 48px rgba(60,44,36,0.11), 0 1px 4px rgba(60,44,36,0.05) !important;
        }
        .dash-card:hover .dash-card-title { color: #b43b32 !important; }
        .dash-card:hover .dash-card-arrow { color: #b43b32 !important; opacity: 1 !important; }

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

        @media (max-width: 640px) {
          .dash-headline { font-size: 40px !important; }
          .dash-grid     { grid-template-columns: 1fr !important; }
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
        {/* Organische Hintergrund-Dekoration */}
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

        <main
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "880px",
            margin: "0 auto",
            padding: "80px 24px 100px",
          }}
        >
          {/* ── Intro-Bereich ── */}
          <div style={{ marginBottom: "64px" }}>

            {/* Eyebrow */}
            <p style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#b43b32",
              margin: "0 0 22px",
              opacity: 0.85,
            }}>
              Willkommen zurück
            </p>

            {/* Headline */}
            <h1
              className="dash-headline"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "52px",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "0.01em",
                color: "#3c2c24",
                margin: 0,
              }}
            >
              <em style={{ fontStyle: "italic" }}>Dein Dashboard</em>
            </h1>

            {/* Divider — wie auf Login und Startseite */}
            <div style={{
              width: "36px",
              height: "1px",
              backgroundColor: "#b43b32",
              margin: "24px 0 22px",
              opacity: 0.4,
            }} />

            {/* Begrüßung */}
            <p style={{
              margin: 0,
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#7a6d65",
              lineHeight: 1.75,
              letterSpacing: "0.01em",
              maxWidth: "420px",
            }}>
              Schön, dass du da bist,{" "}
              <span style={{ color: "#3c2c24", fontWeight: 500 }}>{displayName}</span>.
            </p>
          </div>

          {/* ── Karten-Grid ── */}
          <section
            className="dash-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
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
                  backgroundColor: "#fbf8f4",
                  border: "1px solid rgba(60,44,36,0.07)",
                  borderRadius: "28px",
                  padding: "32px 30px 28px",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: "0 2px 24px rgba(60,44,36,0.06), 0 1px 3px rgba(60,44,36,0.03)",
                  boxSizing: "border-box",
                }}
              >
                {/* Icon + Titel inline — wie Startseiten-Karten */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "14px",
                }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "44px",
                    height: "44px",
                    borderRadius: "13px",
                    backgroundColor: "rgba(180,59,50,0.07)",
                    flexShrink: 0,
                  }}>
                    {card.icon}
                  </div>
                  <h2
                    className="dash-card-title"
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      letterSpacing: "0.01em",
                      margin: 0,
                      color: "#3c2c24",
                      transition: "color 0.2s ease",
                      lineHeight: 1.3,
                    }}
                  >
                    {card.title}
                  </h2>
                </div>

                {/* Feine Trennlinie */}
                <div style={{
                  height: "1px",
                  backgroundColor: "rgba(60,44,36,0.06)",
                  marginBottom: "16px",
                }} />

                {/* Beschreibung */}
                <p style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#9b8f87",
                  lineHeight: 1.7,
                  flexGrow: 1,
                }}>
                  {card.description}
                </p>

                {/* Pfeil-Indikator */}
                <div style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}>
                  <span
                    className="dash-card-arrow"
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "13px",
                      color: "#c5b8ae",
                      transition: "color 0.2s ease",
                      opacity: 0.7,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Öffnen →
                  </span>
                </div>
              </Link>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
