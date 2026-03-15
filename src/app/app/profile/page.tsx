import { ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { COLORS } from "@/lib/constants";
import { mockUser } from "@/data/mock-user";

const sections = [
  {
    title: "Program",
    items: ["Current Program", "Training Schedule", "Goals"],
  },
  {
    title: "Body",
    items: ["Weight", "Body Composition", "Biomarkers"],
  },
  {
    title: "Integrations",
    items: [
      { label: "Apple Health", detail: "Connected" },
      "Peloton",
      "Strava",
      "MCP Server",
    ],
  },
  {
    title: "Data",
    items: ["Export Data", "Privacy", "Terms"],
  },
];

export default function ProfilePage() {
  return (
    <div style={{ padding: "0 20px 20px", flex: 1 }}>
      {/* Avatar + name */}
      <div style={{ textAlign: "center", paddingTop: 8, paddingBottom: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            background: COLORS.surfaceElevated,
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.textSecondary,
            }}
          >
            {mockUser.initials}
          </span>
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          {mockUser.name}
        </div>
        <div
          style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}
        >
          {mockUser.age} &middot; Male &middot; {mockUser.weight} lbs &middot;{" "}
          {mockUser.experienceLevel.charAt(0).toUpperCase() +
            mockUser.experienceLevel.slice(1)}
        </div>
      </div>

      {/* Settings sections */}
      {sections.map((s, si) => (
        <div key={si} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <SectionHeader>{s.title}</SectionHeader>
          </div>
          <div
            style={{
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {s.items.map((item, i) => {
              const label = typeof item === "string" ? item : item.label;
              const detail = typeof item === "string" ? undefined : item.detail;
              return (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom:
                      i < s.items.length - 1
                        ? `1px solid ${COLORS.surfaceElevated}`
                        : "none",
                    cursor: "pointer",
                    minHeight: 48,
                  }}
                >
                  <span
                    style={{ fontSize: 15, color: COLORS.textPrimary }}
                  >
                    {label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {detail && (
                      <span
                        style={{
                          fontSize: 12,
                          color: COLORS.success,
                          fontWeight: 500,
                        }}
                      >
                        {detail}
                      </span>
                    )}
                    <ChevronRight size={16} color={COLORS.textTertiary} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
