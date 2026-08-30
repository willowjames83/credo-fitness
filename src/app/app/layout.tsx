import { getSessionUser } from "@/lib/session";
import { AppHeader } from "@/components/app/app-header";
import { TabBar } from "@/components/app/tab-bar";
import { Sidebar } from "@/components/app/sidebar";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "C";
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const name = user?.name || "Athlete";
  const initials = initialsOf(name);

  return (
    <div className="min-h-dvh bg-[var(--shell-bg)] font-marketing text-[var(--shell-text-primary)]">
      <Sidebar name={name} email={user?.email ?? ""} initials={initials} />

      <div className="flex min-h-dvh flex-col lg:pl-60">
        <AppHeader initials={initials} />
        <main className="flex w-full flex-1 flex-col pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-16">
          <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col pt-3 lg:pt-10">
            {children}
          </div>
        </main>
      </div>

      <TabBar />
    </div>
  );
}
