"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const commonLinkStyle: CSSProperties = {
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
      <a href="/dashboard/kurse" style={commonLinkStyle}>
        Kurse
      </a>
      <a href="/dashboard/community" style={commonLinkStyle}>
        Community
      </a>
      <a href="/preise" style={commonLinkStyle}>
        Preise
      </a>
    </div>
  );

  const authButtons = isAuthenticated ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <a href="/dashboard" style={commonLinkStyle}>
        Dashboard
      </a>
      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        style={{
          cursor: "pointer",
          padding: "8px 16px",
          borderRadius: "999px",
          border: "1px solid #E8E4E0",
          backgroundColor: "#FFFFFF",
          color: "#2E2E2E",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        Abmelden
      </button>
    </div>
  ) : (
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

