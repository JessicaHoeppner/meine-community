"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

type SearchCourse = { id: string; titel: string | null };
type SearchPost = { id: string; titel: string | null };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    courses: SearchCourse[];
    posts: SearchPost[];
  }>({ courses: [], posts: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInputOpen, setSearchInputOpen] = useState(false);
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

  // Scroll-Schatten auf Header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    const pattern = `${term}%`;
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
        setSearchInputOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchInputOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Styles ──────────────────────────────────────────────
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getNavLinkStyle = (href: string): CSSProperties => ({
    cursor: "pointer",
    color: isActive(href) ? "var(--color-text)" : "var(--color-text-secondary)",
    textDecoration: "none",
    fontSize: "var(--text-nav)",
    fontFamily: "var(--font-body)",
    fontWeight: isActive(href) ? 500 : 400,
    transition: "color 0.2s ease",
    position: "relative",
    paddingBottom: "4px",
    borderBottom: isActive(href) ? "2px solid var(--color-primary)" : "2px solid transparent",
  });

  const authLinkStyle: CSSProperties = {
    cursor: "pointer",
    color: "var(--color-text-secondary)",
    textDecoration: "none",
    fontSize: "var(--text-nav)",
    fontFamily: "var(--font-body)",
    fontWeight: 400,
    transition: "color 0.2s ease",
  };

  // ── Nav items ────────────────────────────────────────────
  const navItems = (
    <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
      <a href="/"                      className="nav-link" style={getNavLinkStyle("/")}>Startseite</a>
      <a href="/dashboard/kurse"       className="nav-link" style={getNavLinkStyle("/dashboard/kurse")}>Kurse</a>
      <a href="/dashboard/community"   className="nav-link" style={getNavLinkStyle("/dashboard/community")}>Community</a>
      {isAuthenticated && (
        <a href="/dashboard/live" className="nav-link" style={getNavLinkStyle("/dashboard/live")}>Live</a>
      )}
      <a href="/preise"                className="nav-link" style={getNavLinkStyle("/preise")}>Preise</a>
    </div>
  );

  // ── Auth buttons ─────────────────────────────────────────
  const authButtons = isAuthenticated ? (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {isAdmin && (
        <a href="/dashboard/admin" className="nav-link" style={authLinkStyle}>
          Admin
        </a>
      )}
      <a href="/dashboard" className="nav-link" style={authLinkStyle}>Dashboard</a>
      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        className="nav-signout"
        style={{
          cursor: "pointer",
          padding: "8px 20px",
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--color-border-strong)",
          backgroundColor: "transparent",
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-nav)",
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          transition: "border-color 0.2s ease, color 0.2s ease",
        }}
      >
        Abmelden
      </button>
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <a href="/login" className="nav-link" style={{ ...authLinkStyle, fontWeight: 500 }}>Login</a>
      <a
        href="/registrieren"
        className="nav-register"
        style={{
          cursor: "pointer",
          padding: "8px 20px",
          borderRadius: "var(--radius-pill)",
          backgroundColor: "var(--color-primary)",
          color: "#ffffff",
          textDecoration: "none",
          fontSize: "var(--text-nav)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          transition: "background-color 0.2s ease",
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
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--bg-primary)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: scrolled ? "var(--shadow-nav)" : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* ── Desktop ── */}
        {!isMobile && (
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 40px",
              height: "64px",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
            }}
          >
            {/* Zone Links: Logo */}
            <div style={{ justifySelf: "start" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "1.3rem",
                  letterSpacing: "0.03em",
                  color: "var(--color-text)",
                  whiteSpace: "nowrap",
                }}
              >
                Meine Community
              </div>
            </div>

            {/* Zone Mitte: Nav-Links */}
            <div
              style={{
                justifySelf: "center",
                display: "flex",
                alignItems: "center",
                gap: "32px",
              }}
            >
              <a href="/"                    className="nav-link" style={getNavLinkStyle("/")}>Startseite</a>
              <a href="/dashboard/kurse"     className="nav-link" style={getNavLinkStyle("/dashboard/kurse")}>Kurse</a>
              <a href="/dashboard/community" className="nav-link" style={getNavLinkStyle("/dashboard/community")}>Community</a>
              {isAuthenticated && (
                <a href="/dashboard/live" className="nav-link" style={getNavLinkStyle("/dashboard/live")}>Live</a>
              )}
              <a href="/preise"              className="nav-link" style={getNavLinkStyle("/preise")}>Preise</a>
            </div>

            {/* Zone Rechts: Suche + Auth */}
            <div
              style={{
                justifySelf: "end",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              {/* Suchfeld */}
              <div ref={searchRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Lupen-Icon */}
                <button
                  type="button"
                  className="nav-search-btn"
                  onClick={() => {
                    setSearchInputOpen((prev) => !prev);
                    setSearchOpen(false);
                  }}
                  aria-label="Suche öffnen"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-secondary)",
                    transition: "color 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>

                {/* Eingabefeld — eingeblendet per searchInputOpen */}
                <div style={{
                  overflow: "hidden",
                  width: searchInputOpen ? "160px" : "0px",
                  opacity: searchInputOpen ? 1 : 0,
                  transition: "width 0.25s ease, opacity 0.2s ease",
                }}>
                  <input
                    type="search"
                    placeholder="Suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                    autoFocus={searchInputOpen}
                    style={{
                      width: "160px",
                      padding: "8px 16px",
                      borderRadius: "50px",
                      border: "1px solid #E8E4E0",
                      fontSize: "14px",
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--bg-proof)",
                      color: "var(--color-text)",
                      outline: "none",
                      display: "block",
                    }}
                  />
                </div>
                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "6px",
                      minWidth: "260px",
                      maxWidth: "320px",
                      backgroundColor: "var(--bg-proof)",
                      border: "1px solid rgba(60,44,36,0.10)",
                      borderRadius: "16px",
                      boxShadow: "0 8px 32px rgba(60,44,36,0.10)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                  >
                    {searching ? (
                      <div style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "14px", fontFamily: "var(--font-body)" }}>
                        Suchen…
                      </div>
                    ) : !hasResults ? (
                      <div style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontSize: "14px", fontFamily: "var(--font-body)" }}>
                        Keine Treffer
                      </div>
                    ) : (
                      <>
                        {searchResults.courses.length > 0 && (
                          <div style={{ padding: "8px 0" }}>
                            <div style={{ padding: "6px 16px", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                              Kurse
                            </div>
                            {searchResults.courses.map((c) => (
                              <Link
                                key={`c-${c.id}`}
                                href={`/dashboard/kurse/${c.id}`}
                                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                className="search-result-link"
                                style={{
                                  display: "block",
                                  padding: "9px 16px",
                                  fontSize: "14px",
                                  fontFamily: "var(--font-body)",
                                  color: "var(--color-text)",
                                  textDecoration: "none",
                                  transition: "background-color 0.15s ease",
                                }}
                              >
                                {c.titel || "Unbenannter Kurs"}
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.posts.length > 0 && (
                          <div style={{ padding: "8px 0", borderTop: "1px solid rgba(60,44,36,0.07)" }}>
                            <div style={{ padding: "6px 16px", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                              Beiträge
                            </div>
                            {searchResults.posts.map((p) => (
                              <Link
                                key={`p-${p.id}`}
                                href={`/dashboard/community/${p.id}`}
                                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                className="search-result-link"
                                style={{
                                  display: "block",
                                  padding: "9px 16px",
                                  fontSize: "14px",
                                  fontFamily: "var(--font-body)",
                                  color: "var(--color-text)",
                                  textDecoration: "none",
                                  transition: "background-color 0.15s ease",
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

              {/* Auth */}
              {authButtons}
            </div>
          </div>
        )}

        {/* ── Mobile ── */}
        {isMobile && (
          <div
            style={{
              padding: "0 24px",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "1.2rem",
                letterSpacing: "0.03em",
                color: "var(--color-text)",
              }}
            >
              Meine Community
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menü öffnen"
              style={{ border: "none", background: "transparent", padding: "4px", cursor: "pointer" }}
            >
              <span style={{ display: "block", width: "22px", height: "1.5px", backgroundColor: "#3c2c24", marginBottom: "5px" }} />
              <span style={{ display: "block", width: "22px", height: "1.5px", backgroundColor: "#3c2c24", marginBottom: "5px" }} />
              <span style={{ display: "block", width: "22px", height: "1.5px", backgroundColor: "#3c2c24" }} />
            </button>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && menuOpen && (
          <div
            style={{
              padding: "12px 24px 20px",
              borderTop: "1px solid rgba(60,44,36,0.08)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "16px" }}>
              {navItems}
            </div>
            {authButtons}
          </div>
        )}
      </header>
    </>
  );
}
