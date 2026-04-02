"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
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
    label: "Live",
    href: "/dashboard/live",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
    ),
  },
  {
    label: "Mitglieder",
    href: "/dashboard/mitglieder",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
];

const adminItem: NavItem = {
  label: "Admin",
  href: "/dashboard/admin",
  adminOnly: true,
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const name =
        (user.user_metadata?.name as string) ||
        (user.user_metadata?.full_name as string) ||
        user.email ||
        "";
      setUserName(name);

      const { data: profile } = await supabase
        .from("profiles")
        .select("rolle")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(
        ((profile as { rolle?: string } | null)?.rolle ?? "").toLowerCase() ===
          "admin"
      );
    };
    load();
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const allItems = isAdmin ? [...navItems, adminItem] : navItems;

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
        {allItems.map((item, i) => (
          <div key={item.href}>
            {item.adminOnly && (
              <div
                style={{
                  height: "1px",
                  background: "var(--color-border)",
                  margin: "var(--space-sm) var(--space-sm)",
                }}
              />
            )}
            <Link
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
          </div>
        ))}
      </nav>

      {/* User-Bereich */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-md)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            flexShrink: 0,
          }}
        >
          {userName
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "var(--text-caption)",
              fontWeight: 500,
              color: "var(--color-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userName || "Nutzer"}
          </div>
          <div style={{ display: "flex", gap: "var(--space-sm)" }}>
            <Link
              href="/dashboard/profil"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "var(--text-micro)",
                color: "var(--color-text-muted)",
                textDecoration: "none",
              }}
            >
              Profil
            </Link>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              style={{
                fontSize: "var(--text-micro)",
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Abmelden
            </button>
          </div>
        </div>
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
