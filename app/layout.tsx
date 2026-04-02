import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "../src/components/NavbarWrapper";
import MainContent from "../src/components/MainContent";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Meine Community – Dein Digital Atelier für Vibe Coding",
  description:
    "Lerne, wie du mit KI-Tools deine eigenen Apps, Websites und digitale Produkte erstellst. Feminin, ästhetisch, kreativ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${plusJakarta.className} antialiased`}
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <NavbarWrapper />
        <MainContent>{children}</MainContent>
      </body>
    </html>
  );
}
