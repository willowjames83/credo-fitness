import SwiftUI

struct ProgramStatsCard: View {
    let store = WorkoutStore.shared

    private var totalWorkouts: Int {
        store.totalWorkoutsCompleted
    }

    private var currentStreak: Int {
        let calendar = Calendar.current
        let history = store.workoutHistory.sorted { $0.date > $1.date }
        guard !history.isEmpty else { return 0 }

        var streak = 0
        var checkDate = Date()

        // Walk backwards week by week
        while true {
            guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: checkDate) else { break }
            let hasWorkoutThisWeek = history.contains { workout in
                workout.date >= weekInterval.start && workout.date < weekInterval.end
            }

            if hasWorkoutThisWeek {
                streak += 1
                // Move to previous week
                guard let previousWeek = calendar.date(byAdding: .weekOfYear, value: -1, to: weekInterval.start) else { break }
                checkDate = previousWeek
            } else {
                break
            }
        }

        return streak
    }

    private var favoriteExercise: String? {
        let history = store.workoutHistory
        guard !history.isEmpty else { return nil }

        var counts: [String: Int] = [:]
        for workout in history {
            for exercise in workout.exercises {
                counts[exercise.exerciseId, default: 0] += 1
            }
        }

        guard let topId = counts.max(by: { $0.value < $1.value })?.key else { return nil }
        return ExerciseLibrary.find(topId)?.name ?? topId
    }

    private var totalVolume: Double {
        var volume: Double = 0
        for workout in store.workoutHistory {
            for exercise in workout.exercises {
                for set in exercise.sets {
                    volume += set.weight * Double(set.reps)
                }
            }
        }
        return volume
    }

    private var memberSince: String {
        guard let firstWorkout = store.workoutHistory.min(by: { $0.date < $1.date }) else {
            return "New member"
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yyyy"
        return formatter.string(from: firstWorkout.date)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Training Stats")

            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12),
            ], spacing: 12) {
                statCell(label: "Workouts", value: "\(totalWorkouts)")
                statCell(label: "Week Streak", value: "\(currentStreak)")
                statCell(label: "Favorite", value: favoriteExercise ?? "--")
                statCell(label: "Total Volume", value: formattedVolume)
                statCell(label: "Member Since", value: memberSince)
            }
        }
    }

    private var formattedVolume: String {
        if totalVolume >= 1_000_000 {
            return String(format: "%.1fM lbs", totalVolume / 1_000_000)
        } else if totalVolume >= 1_000 {
            return String(format: "%.1fK lbs", totalVolume / 1_000)
        } else if totalVolume > 0 {
            return "\(Int(totalVolume)) lbs"
        }
        return "--"
    }

    private func statCell(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.credoMono(size: 16, weight: .bold))
                .foregroundStyle(CredoColors.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            Text(label)
                .font(.credoBody(size: 12, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}
