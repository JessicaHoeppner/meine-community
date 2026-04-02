"use client";

import { usePathname } from "next/navigation";
import PublicSidebar from "./PublicSidebar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Sidebar nicht anzeigen im Dashboard-Bereich (dort gibt es die eigene Sidebar)
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return <PublicSidebar />;
}
