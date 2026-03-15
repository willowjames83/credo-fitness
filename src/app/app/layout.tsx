import { MobileFrame } from "@/components/app/mobile-frame";
import { AppHeader } from "@/components/app/app-header";
import { TabBar } from "@/components/app/tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex justify-center items-center min-h-dvh md:p-5 md:bg-[#F0F0F2]"
    >
      <MobileFrame>
        <AppHeader />
        <div
          className="flex-1 overflow-y-auto flex flex-col overscroll-contain"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
        <TabBar />
      </MobileFrame>
    </div>
  );
}
