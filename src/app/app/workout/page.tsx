"use client";

import { useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { mockActiveWorkout } from "@/data/mock-workouts";
import { COLORS } from "@/lib/constants";

export default function WorkoutPage() {
  const { activeExercise, upcomingExercises } = mockActiveWorkout;
  const [completedSets, setCompletedSets] = useState<Record<number, boolean>>(
    () => {
      const initial: Record<number, boolean> = {};
      activeExercise.sets.forEach((s) => {
        initial[s.set] = s.completed;
      });
      return initial;
    }
  );

  const toggleSet = (setNum: number) => {
    setCompletedSets((prev) => ({ ...prev, [setNum]: !prev[setNum] }));
  };

  return (
    <div style={{ padding: "0 20px 20px", flex: 1 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.textPrimary,
            }}
          >
            {mockActiveWorkout.name}
          </div>
          <div
            style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}
          >
            Week {mockActiveWorkout.week} &middot; Day {mockActiveWorkout.day}{" "}
            of {mockActiveWorkout.totalDays}
          </div>
        </div>
        <div
          style={{
            fontFamily: "'SF Mono', ui-monospace, monospace",
            fontSize: 17,
            fontWeight: 500,
            color: COLORS.accent,
          }}
        >
          {mockActiveWorkout.elapsedTime}
        </div>
      </div>

      {/* Active exercise card */}
      <div
        style={{
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.textPrimary,
              }}
            >
              {activeExercise.name}
            </span>
            <span
              style={{
                fontSize: 12,
                color: COLORS.textSecondary,
                background: COLORS.surface,
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              {activeExercise.setsTarget}
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: COLORS.textTertiary,
              marginTop: 4,
            }}
          >
            Previous: {activeExercise.previousSession}
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>
          {/* Grid header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 1fr 50px",
              padding: "10px 0",
              borderBottom: `1px solid ${COLORS.surfaceElevated}`,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.textTertiary,
              }}
            >
              SET
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.textTertiary,
              }}
            >
              LBS
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.textTertiary,
              }}
            >
              REPS
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.textTertiary,
                textAlign: "center",
              }}
            >
              &#10003;
            </span>
          </div>

          {/* Set rows */}
          {activeExercise.sets.map((s, i) => {
            const done = completedSets[s.set];
            return (
              <div
                key={s.set}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 1fr 50px",
                  padding: "12px 0",
                  borderBottom:
                    i < activeExercise.sets.length - 1
                      ? `1px solid ${COLORS.surfaceElevated}`
                      : "none",
                  opacity: done ? 0.5 : 1,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.textSecondary,
                  }}
                >
                  {s.set}
                </span>
                <span
                  style={{
                    fontFamily: "'SF Mono', ui-monospace, monospace",
                    fontSize: 16,
                    fontWeight: 500,
                    color: COLORS.textPrimary,
                  }}
                >
                  {s.weight}
                </span>
                <span
                  style={{
                    fontFamily: "'SF Mono', ui-monospace, monospace",
                    fontSize: 16,
                    fontWeight: 500,
                    color: s.reps ? COLORS.textPrimary : COLORS.textTertiary,
                  }}
                >
                  {s.reps ?? "\u2014"}
                </span>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    onClick={() => toggleSet(s.set)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: done ? COLORS.success : COLORS.surfaceElevated,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Check
                      size={14}
                      color={done ? "#fff" : COLORS.textTertiary}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rest timer */}
      <div
        style={{
          background: COLORS.accentLight,
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 500, color: COLORS.accent }}
        >
          Rest Timer
        </span>
        <span
          style={{
            fontFamily: "'SF Mono', ui-monospace, monospace",
            fontSize: 22,
            fontWeight: 600,
            color: COLORS.accent,
          }}
        >
          {mockActiveWorkout.restTimer}
        </span>
      </div>

      {/* Upcoming exercises */}
      {upcomingExercises.map((ex, i) => (
        <div
          key={i}
          style={{
            padding: "12px 16px",
            background: COLORS.surface,
            borderRadius: 12,
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: COLORS.textSecondary,
              }}
            >
              {ex.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: COLORS.textTertiary }}>
              {ex.detail}
            </span>
            <ChevronRight size={14} color={COLORS.textTertiary} />
          </div>
        </div>
      ))}
    </div>
  );
}
