"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const commonLinkStyle: React.CSSProperties = {
    cursor: "pointer",
    color: "#2E2E2E",
    textDecoration: "none",
    fontSize: "0.95rem",
  };

  const navItems = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",
      }}
    >
      <a href="/" style={commonLinkStyle}>
        Startseite
      </a>
      <a href="/kurse" style={commonLinkStyle}>
        Kurse
      </a>
      <a href="/community" style={commonLinkStyle}>
        Community
      </a>
    </div>
  );

  const authButtons = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <a
        href="/login"
        style={{
          cursor: "pointer",
          color: "#2E2E2E",
          textDecoration: "none",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Login
      </a>
      <a
        href="/registrieren"
        style={{
          cursor: "pointer",
          padding: "8px 16px",
          borderRadius: "999px",
          backgroundColor: "#8B3A3A",
          color: "#FFFFFF",
          textDecoration: "none",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Registrieren
      </a>
    </div>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <nav
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#2E2E2E",
          }}
        >
          Meine Community
        </div>

        {!isMobile && (
          <>
            {navItems}
            {authButtons}
          </>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menü öffnen"
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "block",
                width: "20px",
                height: "2px",
                backgroundColor: "#2E2E2E",
                marginBottom: "4px",
              }}
            />
            <span
              style={{
                display: "block",
                width: "20px",
                height: "2px",
                backgroundColor: "#2E2E2E",
                marginBottom: "4px",
              }}
            />
            <span
              style={{
                display: "block",
                width: "20px",
                height: "2px",
                backgroundColor: "#2E2E2E",
              }}
            />
          </button>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div
          style={{
            padding: "8px 24px 16px",
            borderTop: "1px solid #E8E4E0",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            {navItems}
          </div>
          {authButtons}
        </div>
      )}
    </header>
  );
}

