"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <main
      className={isDashboard ? "" : "app-content"}
      style={{
        flex: 1,
        marginLeft: isDashboard ? 0 : "260px",
        minHeight: "100vh",
      }}
    >
      {children}
    </main>
  );
}
