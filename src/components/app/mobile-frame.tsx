"use client";

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div
      style={{
        width: 393,
        height: 852,
        background: "#FFFFFF",
        borderRadius: 44,
        overflow: "hidden",
        boxShadow:
          "0 25px 80px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: "8px solid #1A1A1E",
        fontFamily:
          "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          padding: "14px 28px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#1A1A1E",
          }}
        >
          9:41
        </span>
        {/* Dynamic Island */}
        <div
          style={{
            width: 120,
            height: 30,
            background: "#1A1A1E",
            borderRadius: 20,
          }}
        />
        {/* Signal / WiFi / Battery icons */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {/* Signal bars */}
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0" y="9" width="3" height="3" rx="0.5" fill="#1A1A1E" />
            <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="#1A1A1E" />
            <rect x="9" y="3" width="3" height="9" rx="0.5" fill="#1A1A1E" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1A1A1E" />
          </svg>
          {/* WiFi */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path
              d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z"
              fill="#1A1A1E"
            />
            <path
              d="M5.17 8.33a4.002 4.002 0 015.66 0"
              stroke="#1A1A1E"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <path
              d="M2.34 5.5a8.003 8.003 0 0111.32 0"
              stroke="#1A1A1E"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          {/* Battery */}
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect
              x="0.5"
              y="0.5"
              width="21"
              height="11"
              rx="2"
              stroke="#1A1A1E"
              strokeOpacity="0.35"
            />
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#1A1A1E" />
            <path
              d="M23 4v4a2 2 0 000-4z"
              fill="#1A1A1E"
              fillOpacity="0.4"
            />
          </svg>
        </div>
      </div>

      {children}
    </div>
  );
}
