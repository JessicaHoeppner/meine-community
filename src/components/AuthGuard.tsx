"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function AuthGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (data.user) {
        setAuthenticated(true);
        setChecking(false);
        return;
      }

      setAuthenticated(false);
      setChecking(false);
      router.replace("/login");
    };

    check();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#F5F2EE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          color: "#6B6562",
          fontSize: "0.95rem",
        }}
      >
        Laden...
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}

