"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#2E2E2E",
          }}
        >
          Willkommen im Dashboard!
        </h1>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#8B3A3A",
            color: "#FFFFFF",
            fontWeight: 500,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Abmelden
        </button>
      </main>
    </div>
  );
}

