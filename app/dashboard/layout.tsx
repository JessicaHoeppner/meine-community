import Sidebar from "@/src/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div
        className="app-content"
        style={{
          flex: 1,
          marginLeft: "260px",
          backgroundColor: "var(--bg-primary)",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}
