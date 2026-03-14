import SwiftUI

struct StabilityDetailCard: View {
    let store = WorkoutStore.shared
    let stabilityStore = StabilityStore.shared

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "target")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.teal)
                Text("Stability Breakdown")
                    .font(.credoBody(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)
                Spacer()
            }

            VStack(spacing: 8) {
                stabilityRow(
                    label: "Warmup Adherence",
                    value: warmupText,
                    progress: warmupProgress,
                    color: CredoColors.teal
                )
                stabilityRow(
                    label: "Core Volume",
                    value: coreText,
                    progress: coreProgress,
                    color: CredoColors.teal
                )
                stabilityRow(
                    label: "Unilateral Work",
                    value: unilateralText,
                    progress: unilateralProgress,
                    color: CredoColors.teal
                )
                stabilityRow(
                    label: "Recovery",
                    value: recoveryText,
                    progress: recoveryProgress,
                    color: CredoColors.teal
                )
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func stabilityRow(label: String, value: String, progress: Double, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label)
                    .font(.credoBody(size: 12, weight: .medium))
                    .foregroundStyle(CredoColors.textSecondary)
                Spacer()
                Text(value)
                    .font(.credoMono(size: 12, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(CredoColors.border)
                        .frame(height: 6)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(color)
                        .frame(width: geo.size.width * min(progress, 1.0), height: 6)
                }
            }
            .frame(height: 6)
        }
    }

    // MARK: - Computed Metrics

    private var warmupProgress: Double {
        let twoWeeksAgo = Calendar.current.date(byAdding: .day, value: -14, to: Date()) ?? Date()
        let recentWorkouts = store.workoutHistory.filter { $0.date >= twoWeeksAgo }.count
        guard recentWorkouts > 0 else { return 0 }
        return Double(stabilityStore.warmupsCompleted(inLastDays: 14)) / Double(recentWorkouts)
    }

    private var warmupText: String {
        let count = stabilityStore.warmupsCompleted(inLastDays: 14)
        let twoWeeksAgo = Calendar.current.date(byAdding: .day, value: -14, to: Date()) ?? Date()
        let total = store.workoutHistory.filter { $0.date >= twoWeeksAgo }.count
        return "\(count)/\(total) workouts"
    }

    private var coreProgress: Double {
        min(Double(weeklyCoreSets) / 6.0, 1.0)
    }

    private var coreText: String {
        "\(weeklyCoreSets)/6 sets"
    }

    private var unilateralProgress: Double {
        min(Double(weeklyUnilateralSets) / 4.0, 1.0)
    }

    private var unilateralText: String {
        "\(weeklyUnilateralSets)/4 sets"
    }

    private var recoveryProgress: Double {
        let statuses = RecoveryEngine.calculateRecovery(store: store)
        guard !statuses.isEmpty else { return 1.0 }
        return Double(statuses.filter { $0.fatigueLevel < 80 }.count) / Double(statuses.count)
    }

    private var recoveryText: String {
        let statuses = RecoveryEngine.calculateRecovery(store: store)
        let recovered = statuses.filter { $0.fatigueLevel < 80 }.count
        return "\(recovered)/\(statuses.count) groups"
    }

    private var weeklyCoreSets: Int {
        let weekStart = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return store.workoutHistory.filter { $0.date >= weekStart }.reduce(0) { total, workout in
            total + workout.exercises.reduce(0) { exTotal, exercise in
                guard let def = ExerciseLibrary.find(exercise.exerciseId),
                      def.movementPattern == .core else { return exTotal }
                return exTotal + exercise.sets.count
            }
        }
    }

    private var weeklyUnilateralSets: Int {
        let weekStart = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return store.workoutHistory.filter { $0.date >= weekStart }.reduce(0) { total, workout in
            total + workout.exercises.reduce(0) { exTotal, exercise in
                guard let def = ExerciseLibrary.find(exercise.exerciseId),
                      def.isPerSide else { return exTotal }
                return exTotal + exercise.sets.count
            }
        }
    }
}
