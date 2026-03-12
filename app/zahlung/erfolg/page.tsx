"use client";

import Link from "next/link";

export default function ZahlungErfolgPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap');
        .btn-primary:hover { background-color: #9f3129 !important; }
        .auth-grain::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.016;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }
      `}} />

      <div className="auth-grain" style={{ minHeight: "100vh", backgroundColor: "#efe6dc", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative", overflow: "hidden", fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
          <svg style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "70%", opacity: 0.38 }} viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="250" cy="200" rx="250" ry="180" fill="#e8ddd0"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "38%", opacity: 0.40 }} viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e8ddd0" d="M0,60 C360,140 720,20 1080,80 C1260,110 1380,60 1440,70 L1440,160 L0,160 Z"/>
          </svg>
          <svg style={{ position: "absolute", top: "5%", right: "-8%", width: "38%", height: "55%", opacity: 0.22 }} viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="175" rx="200" ry="155" fill="#ddd4c8"/>
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "480px", width: "100%", backgroundColor: "#fbf8f4", border: "1px solid rgba(60,44,36,0.07)", borderRadius: "32px", padding: "52px 44px 44px", boxShadow: "0 8px 60px rgba(60,44,36,0.09), 0 1px 8px rgba(60,44,36,0.04)" }}>
          <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b43b32", margin: "0 0 20px", opacity: 0.85 }}>
            Zahlung erfolgreich
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "42px", fontWeight: 300, lineHeight: 1.15, letterSpacing: "0.01em", color: "#3c2c24", margin: 0 }}>
            <em style={{ fontStyle: "italic" }}>Willkommen! Deine Mitgliedschaft ist aktiv.</em>
          </h1>
          <div style={{ width: "36px", height: "1px", backgroundColor: "#b43b32", margin: "22px auto", opacity: 0.4 }} />
          <p style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "15px", fontWeight: 400, color: "#7a6d65", lineHeight: 1.75, margin: "0 0 36px" }}>
            Du kannst jetzt alle Kurse und die Community nutzen.
          </p>
          <Link href="/dashboard" className="btn-primary" style={{ display: "inline-block", padding: "16px 36px", borderRadius: "50px", backgroundColor: "#b43b32", color: "#ffffff", textDecoration: "none", fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 500, fontSize: "15px", letterSpacing: "0.04em", transition: "background-color 0.2s ease" }}>
            Zum Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
