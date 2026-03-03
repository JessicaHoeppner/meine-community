"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

type SearchCourse = { id: string; titel: string | null };
type SearchPost = { id: string; titel: string | null };

export default function Navbar() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    courses: SearchCourse[];
    posts: SearchPost[];
  }>({ courses: [], posts: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setIsAuthenticated(!!user);
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("rolle")
        .eq("id", user.id)
        .maybeSingle();
      const rolle = (profile as { rolle?: string } | null)?.rolle ?? null;
      setIsAdmin((rolle ?? "").toLowerCase() === "admin");
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim();
    if (!term) {
      setSearchResults({ courses: [], posts: [] });
      setSearching(false);
      return;
    }
    setSearching(true);
    const pattern = `%${term}%`;
    const [coursesRes, postsRes] = await Promise.all([
      supabase
        .from("courses")
        .select("id, titel")
        .ilike("titel", pattern)
        .eq("veroeffentlicht", true)
        .limit(5),
      supabase
        .from("posts")
        .select("id, titel")
        .ilike("titel", pattern)
        .limit(5),
    ]);
    setSearchResults({
      courses: (coursesRes.data as SearchCourse[]) ?? [],
      posts: (postsRes.data as SearchPost[]) ?? [],
    });
    setSearchOpen(true);
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      runSearch(searchQuery);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, runSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commonLinkStyle: CSSProperties = {
    cursor: "pointer",
    color: "#2E2E2E",
    textDecoration: "none",
    fontSize: "0.95rem",
  };

  const navItems = (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <a href="/" style={commonLinkStyle}>Startseite</a>
      <a href="/dashboard/kurse" style={commonLinkStyle}>Kurse</a>
      <a href="/dashboard/community" style={commonLinkStyle}>Community</a>
      <a href="/preise" style={commonLinkStyle}>Preise</a>
    </div>
  );

  const authButtons = isAuthenticated ? (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {isAdmin && (
        <a href="/dashboard/admin" style={commonLinkStyle}>
          Admin
        </a>
      )}
      <a href="/dashboard" style={commonLinkStyle}>Dashboard</a>
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
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <a href="/login" style={{ ...commonLinkStyle, fontWeight: 500 }}>Login</a>
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

  const hasResults =
    searchResults.courses.length > 0 || searchResults.posts.length > 0;
  const showDropdown = searchOpen && (searchQuery.trim() !== "");

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
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#2E2E2E" }}>
          Meine Community
        </div>

        {!isMobile && (
          <>
            {navItems}
            <div ref={searchRef} style={{ position: "relative" }}>
              <input
                type="search"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                style={{
                  width: "160px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid #E8E4E0",
                  fontSize: "0.9rem",
                  backgroundColor: "#FAF7F3",
                  color: "#2E2E2E",
                }}
              />
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "4px",
                    minWidth: "260px",
                    maxWidth: "320px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8E4E0",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  {searching ? (
                    <div style={{ padding: "12px 14px", color: "#6B6562", fontSize: "0.9rem" }}>
                      Suchen...
                    </div>
                  ) : !hasResults ? (
                    <div style={{ padding: "12px 14px", color: "#6B6562", fontSize: "0.9rem" }}>
                      Keine Treffer
                    </div>
                  ) : (
                    <>
                      {searchResults.courses.length > 0 && (
                        <div style={{ padding: "8px 0" }}>
                          <div style={{ padding: "6px 14px", fontSize: "0.75rem", color: "#6B6562", fontWeight: 600 }}>
                            Kurse
                          </div>
                          {searchResults.courses.map((c) => (
                            <Link
                              key={`c-${c.id}`}
                              href={`/dashboard/kurse/${c.id}`}
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              style={{
                                display: "block",
                                padding: "8px 14px",
                                fontSize: "0.9rem",
                                color: "#2E2E2E",
                                textDecoration: "none",
                              }}
                            >
                              {c.titel || "Unbenannter Kurs"}
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.posts.length > 0 && (
                        <div style={{ padding: "8px 0", borderTop: "1px solid #E8E4E0" }}>
                          <div style={{ padding: "6px 14px", fontSize: "0.75rem", color: "#6B6562", fontWeight: 600 }}>
                            Beiträge
                          </div>
                          {searchResults.posts.map((p) => (
                            <Link
                              key={`p-${p.id}`}
                              href={`/dashboard/community/${p.id}`}
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              style={{
                                display: "block",
                                padding: "8px 14px",
                                fontSize: "0.9rem",
                                color: "#2E2E2E",
                                textDecoration: "none",
                              }}
                            >
                              {p.titel || "Ohne Titel"}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            {authButtons}
          </>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menü öffnen"
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block", width: "20px", height: "2px", backgroundColor: "#2E2E2E", marginBottom: "4px" }} />
            <span style={{ display: "block", width: "20px", height: "2px", backgroundColor: "#2E2E2E", marginBottom: "4px" }} />
            <span style={{ display: "block", width: "20px", height: "2px", backgroundColor: "#2E2E2E" }} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "12px" }}>
            {navItems}
          </div>
          {authButtons}
        </div>
      )}
    </header>
  );
}
