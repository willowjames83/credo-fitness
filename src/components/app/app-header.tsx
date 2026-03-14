import { MoreHorizontal } from "lucide-react";

export function AppHeader() {
  return (
    <div
      style={{
        padding: "12px 20px 8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2.5,
          color: "#E8501A",
          textTransform: "uppercase",
        }}
      >
        Credo
      </span>
      <div
        style={{
          position: "absolute",
          right: 20,
          width: 28,
          height: 28,
          borderRadius: 14,
          background: "#F7F7F8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <MoreHorizontal size={14} color="#6B6B73" />
      </div>
    </div>
  );
}
