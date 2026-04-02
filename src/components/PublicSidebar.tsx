"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Startseite",
    href: "/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ),
  },
  {
    label: "Kurse",
    href: "/dashboard/kurse",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    ),
  },
  {
    label: "Community",
    href: "/dashboard/community",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
  },
  {
    label: "Preise",
    href: "/preise",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
  },
];

export default function PublicSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "1.2rem",
          color: "var(--color-text)",
          textDecoration: "none",
          padding: "var(--space-lg) var(--space-md)",
          display: "block",
        }}
      >
        Meine Community
      </Link>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "var(--space-sm) var(--space-sm)" }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-body-sm)",
              fontFamily: "var(--font-body)",
              fontWeight: isActive(item.href) ? 500 : 400,
              color: isActive(item.href)
                ? "var(--color-primary)"
                : "var(--color-text-secondary)",
              backgroundColor: isActive(item.href)
                ? "var(--bg-highlight)"
                : "transparent",
              textDecoration: "none",
              transition: "background-color 0.15s ease, color 0.15s ease",
              marginBottom: "2px",
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.backgroundColor = "var(--bg-highlight)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Auth-Bereich */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
        }}
      >
        <Link
          href="/login"
          onClick={() => setMobileOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--text-body-sm)",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-highlight)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Anmelden
        </Link>
        <Link
          href="/registrieren"
          onClick={() => setMobileOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--text-body-sm)",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            color: "#ffffff",
            backgroundColor: "var(--color-primary)",
            textDecoration: "none",
            transition: "background-color 0.2s ease",
          }}
        >
          Kostenlos starten
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="sidebar-desktop"
        style={{
          width: "260px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          background: "var(--bg-card)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          overflowY: "auto",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Topbar */}
      <div
        className="sidebar-mobile-bar"
        style={{
          display: "none",
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: "56px",
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0 var(--space-md)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "1.1rem",
            color: "var(--color-text)",
          }}
        >
          Meine Community
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menü"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(60,44,36,0.4)",
              zIndex: 49,
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "280px",
              height: "100vh",
              background: "var(--bg-card)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-dropdown)",
              overflowY: "auto",
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
