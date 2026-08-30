import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { SplitDay, WorkoutSummaryShare } from "@/lib/types";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { MUSCLE_GROUP_LABELS } from "@/components/share/labels";
import { ImportSplitButton } from "@/components/share/import-split-button";

interface SplitSharePayload {
  name: string;
  days: SplitDay[];
}

type Props = {
  params: Promise<{ code: string }>;
};

async function findShared(code: string) {
  return prisma.sharedWorkout.findUnique({ where: { shareCode: code } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const shared = await findShared(code);
  if (!shared) return {};

  const title =
    shared.type === "split"
      ? `${(shared.data as unknown as SplitSharePayload).name} — shared on Credo`
      : `${(shared.data as unknown as WorkoutSummaryShare).workoutName} — shared on Credo`;

  return {
    title,
    description: "A workout shared from Credo — train for longevity.",
    openGraph: { title, type: "website" },
    twitter: { card: "summary", title },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function SplitShare({ code, payload }: { code: string; payload: SplitSharePayload }) {
  const trainingDays = payload.days.filter((d) => !d.isRestDay);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#9E9EA3]">
        Shared split
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-[#1A1A1E] sm:text-3xl">{payload.name}</h1>
      <p className="mt-1 text-sm text-[#6B6B73]">{trainingDays.length} training days / week</p>

      <div className="mt-6 flex flex-col gap-3">
        {payload.days.map((day) => (
          <div
            key={day.dayNumber}
            className="rounded-[14px] border border-[#E5E5E8] bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-[#1A1A1E]">{day.label}</p>
              {day.isRestDay && (
                <span className="text-[12px] font-medium text-[#9E9EA3]">Rest</span>
              )}
            </div>
            {!day.isRestDay && day.muscleGroups.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {day.muscleGroups.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-[#E8501A]/30 bg-[#FFF0E9] px-2.5 py-1 text-[11px] font-semibold text-[#E8501A]"
                  >
                    {MUSCLE_GROUP_LABELS[g]}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <ImportSplitButton code={code} />
      </div>
    </div>
  );
}

function WorkoutSummaryShareView({ summary }: { summary: WorkoutSummaryShare }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#9E9EA3]">
        Completed workout
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-[#1A1A1E] sm:text-3xl">
        {summary.workoutName}
      </h1>
      <p className="mt-1 text-sm text-[#6B6B73]">{formatDate(summary.date)}</p>

      {summary.muscleGroups.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {summary.muscleGroups.map((g) => (
            <span
              key={g}
              className="rounded-full border border-[#E8501A]/30 bg-[#FFF0E9] px-2.5 py-1 text-[11px] font-semibold text-[#E8501A]"
            >
              {MUSCLE_GROUP_LABELS[g]}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        {[
          { label: "Volume", value: `${Math.round(summary.totalVolume).toLocaleString()} lb` },
          { label: "Duration", value: `${summary.duration} min` },
          { label: "Exercises", value: String(summary.exercises.length) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border border-[#E5E5E8] bg-white px-3 py-3 text-center"
          >
            <p className="font-mono text-lg font-semibold text-[#1A1A1E]">{s.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#6B6B73] uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-[#E5E5E8] bg-white">
        {summary.exercises.map((ex, i) => (
          <div
            key={`${ex.name}-${i}`}
            className={`flex items-center justify-between px-4 py-3 ${
              i < summary.exercises.length - 1 ? "border-b border-[#EEEFF1]" : ""
            }`}
          >
            <span className="text-sm font-medium text-[#1A1A1E]">{ex.name}</span>
            <span className="font-mono text-sm text-[#6B6B73]">{ex.bestSet}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function SharedWorkoutPage({ params }: Props) {
  const { code } = await params;

  let shared;
  try {
    shared = await prisma.sharedWorkout.update({
      where: { shareCode: code },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    shared = null;
  }
  if (!shared) notFound();

  return (
    <div className="min-h-dvh bg-[#F7F7F8]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pb-20 pt-28">
        {shared.type === "split" ? (
          <SplitShare code={code} payload={shared.data as unknown as SplitSharePayload} />
        ) : (
          <WorkoutSummaryShareView summary={shared.data as unknown as WorkoutSummaryShare} />
        )}
        <p className="mt-8 text-[12px] text-[#9E9EA3]">
          {shared.viewCount} view{shared.viewCount === 1 ? "" : "s"}
        </p>
      </main>
      <Footer />
    </div>
  );
}
