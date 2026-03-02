"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import { supabase } from "@/src/lib/supabase";

type ProfileRow = {
  id: string;
  rolle: string | null;
};

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminInner />
    </AuthGuard>
  );
}

function AdminInner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      const user = userData.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, rolle")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const role = (profile as ProfileRow | null)?.rolle ?? null;
      const admin = role?.toLowerCase() === "admin";
      setIsAdmin(admin);

      if (!admin) {
        setLoading(false);
        return;
      }

      const [{ count: courses, error: coursesError }, { count: members, error: membersError }] =
        await Promise.all([
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

      if (coursesError) {
        setError(coursesError.message);
        setLoading(false);
        return;
      }
      if (membersError) {
        setError(membersError.message);
        setLoading(false);
        return;
      }

      setCourseCount(typeof courses === "number" ? courses : 0);
      setMemberCount(typeof members === "number" ? members : 0);
      setLoading(false);
    };

    load();
  }, []);

  const cardStyle = useMemo(
    () => ({
      backgroundColor: "#FFFFFF",
      border: "1px solid #E8E4E0",
      borderRadius: "16px",
      padding: "20px",
    }),
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#2E2E2E",
          }}
        >
          Admin
        </h1>

        {loading ? (
          <div style={{ color: "#6B6562", fontSize: "0.95rem" }}>Laden...</div>
        ) : error ? (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        ) : !isAdmin ? (
          <div style={cardStyle}>
            <div
              style={{
                fontWeight: 700,
                color: "#2E2E2E",
                marginBottom: "8px",
                fontSize: "1.05rem",
              }}
            >
              Kein Zugriff
            </div>
            <div style={{ color: "#6B6562", fontSize: "0.95rem", marginBottom: "14px" }}>
              Du hast keine Berechtigung, diesen Bereich zu sehen.
            </div>
            <Link
              href="/dashboard"
              style={{
                display: "inline-block",
                padding: "10px 16px",
                borderRadius: "999px",
                backgroundColor: "#8B3A3A",
                color: "#FFFFFF",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              Zum Dashboard
            </Link>
          </div>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            <div style={cardStyle}>
              <div style={{ color: "#6B6562", fontSize: "0.9rem", marginBottom: "6px" }}>
                Anzahl Kurse
              </div>
              <div style={{ color: "#2E2E2E", fontSize: "2rem", fontWeight: 800 }}>
                {courseCount ?? "—"}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ color: "#6B6562", fontSize: "0.9rem", marginBottom: "6px" }}>
                Anzahl Mitglieder
              </div>
              <div style={{ color: "#2E2E2E", fontSize: "2rem", fontWeight: 800 }}>
                {memberCount ?? "—"}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

