import Foundation

struct StabilityScoreCalculator {

    /// Calculate stability pillar score (0-100).
    ///
    /// Components:
    /// - Warmup adherence (30%): % of workouts with warmup completed in last 2 weeks
    /// - Core exercise volume (30%): weekly core sets, target 6+
    /// - Unilateral/balance work (20%): weekly isPerSide sets, target 4+
    /// - Recovery compliance (20%): muscle groups with fatigueLevel < 80
    static func calculate(store: WorkoutStore) -> Int {
        let warmup = warmupScore(store: store)
        let core = coreVolumeScore(store: store)
        let unilateral = unilateralScore(store: store)
        let recovery = recoveryScore(store: store)

        let composite = warmup * 0.3 + core * 0.3 + unilateral * 0.2 + recovery * 0.2
        return max(0, min(100, Int(round(composite))))
    }

    // MARK: - Subscores

    /// Warmup adherence: what % of recent workouts included warmup completion.
    private static func warmupScore(store: WorkoutStore) -> Double {
        let twoWeeksAgo = Calendar.current.date(byAdding: .day, value: -14, to: Date()) ?? Date()
        let recentWorkouts = store.workoutHistory.filter { $0.date >= twoWeeksAgo }
        guard !recentWorkouts.isEmpty else { return 0 }

        let warmupsCompleted = StabilityStore.shared.warmupsCompleted(inLastDays: 14)
        let ratio = Double(warmupsCompleted) / Double(recentWorkouts.count)
        return min(ratio, 1.0) * 100
    }

    /// Core volume: weekly sets targeting core muscles.
    private static func coreVolumeScore(store: WorkoutStore) -> Double {
        let weekStart = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        let weekWorkouts = store.workoutHistory.filter { $0.date >= weekStart }

        var coreSets = 0
        for workout in weekWorkouts {
            for exercise in workout.exercises {
                guard let def = ExerciseLibrary.find(exercise.exerciseId) else { continue }
                if def.movementPattern == .core {
                    coreSets += exercise.sets.count
                }
            }
        }

        let target = 6.0
        return min(Double(coreSets) / target, 1.0) * 100
    }

    /// Unilateral/balance work: weekly sets of per-side exercises.
    private static func unilateralScore(store: WorkoutStore) -> Double {
        let weekStart = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        let weekWorkouts = store.workoutHistory.filter { $0.date >= weekStart }

        var unilateralSets = 0
        for workout in weekWorkouts {
            for exercise in workout.exercises {
                guard let def = ExerciseLibrary.find(exercise.exerciseId) else { continue }
                if def.isPerSide {
                    unilateralSets += exercise.sets.count
                }
            }
        }

        let target = 4.0
        return min(Double(unilateralSets) / target, 1.0) * 100
    }

    /// Recovery compliance: how many muscle groups are not overtrained.
    private static func recoveryScore(store: WorkoutStore) -> Double {
        let statuses = RecoveryEngine.calculateRecovery(store: store)
        let totalGroups = Double(statuses.count)
        guard totalGroups > 0 else { return 100 }

        let recoveredGroups = Double(statuses.filter { $0.fatigueLevel < 80 }.count)
        return (recoveredGroups / totalGroups) * 100
    }
}
