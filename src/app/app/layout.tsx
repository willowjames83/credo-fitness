import { MobileFrame } from "@/components/app/mobile-frame";
import { AppHeader } from "@/components/app/app-header";
import { TabBar } from "@/components/app/tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#F0F0F2",
        padding: 20,
      }}
    >
      <MobileFrame>
        <AppHeader />
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
        <TabBar />
      </MobileFrame>
    </div>
  );
}
