"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import AuthGuard from "@/src/components/AuthGuard";

export default function DashboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("deiner Community");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <DashboardInner displayName={displayName} setDisplayName={setDisplayName} onLogout={handleLogout} />
    </AuthGuard>
  );
}

function DashboardInner({
  displayName,
  setDisplayName,
  onLogout,
}: Readonly<{
  displayName: string;
  setDisplayName: (value: string) => void;
  onLogout: () => Promise<void>;
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
  }> = [
    {
      title: "Meine Kurse",
      description: "Starte neue Kurse oder mache dort weiter, wo du aufgehoert hast.",
      href: "/dashboard/kurse",
    },
    {
      title: "Community",
      description: "Stelle Fragen, teile Fortschritte und bleib motiviert.",
      href: "/dashboard/community",
    },
    {
      title: "Mein Profil",
      description: "Verwalte deine Daten und Einstellungen.",
      href: "/dashboard/profil",
    },
    {
      title: "Mitglieder",
      description: "Finde andere Mitglieder und entdecke ihre Profile.",
      href: "/dashboard/mitglieder",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EE",
        padding: "40px 16px",
      }}
    >
      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#2E2E2E",
              }}
            >
              Willkommen im Dashboard!
            </h1>
            <p
              style={{
                margin: 0,
                color: "#6B6562",
                fontSize: "1rem",
              }}
            >
              Schoen, dass du da bist, {displayName}.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#8B3A3A",
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "0.95rem",
              cursor: "pointer",
              height: "40px",
            }}
          >
            Abmelden
          </button>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: "#FAF7F3",
                border: "1px solid #E8E4E0",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#2E2E2E",
                }}
              >
                {card.title}
              </h2>
              <p
                style={{
                  marginTop: 0,
                  marginBottom: "14px",
                  fontSize: "0.95rem",
                  color: "#6B6562",
                  lineHeight: 1.6,
                }}
              >
                {card.description}
              </p>
              <Link
                href={card.href}
                style={{
                  color: "#8B3A3A",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                }}
              >
                Zur Seite →
              </Link>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

