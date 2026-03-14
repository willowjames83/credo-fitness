import Foundation

struct MuscleRecoveryStatus: Codable, Identifiable {
    var id: String { muscleGroup }
    let muscleGroup: String
    let lastTrainedDate: Date?
    let estimatedRecoveryHours: Double
    var fatigueLevel: Int // 0-100, 0 = fully recovered

    /// Display name for the muscle group
    var displayName: String {
        switch muscleGroup {
        case "chest": return "Chest"
        case "back": return "Back"
        case "shoulders": return "Shoulders"
        case "arms": return "Arms"
        case "legs": return "Legs"
        case "core": return "Core"
        default: return muscleGroup.capitalized
        }
    }
}

struct RecoveryEngine {

    // Recovery rates by muscle group (hours to full recovery)
    private static let recoveryHours: [String: Double] = [
        "legs": 72,
        "back": 48,
        "chest": 48,
        "shoulders": 36,
        "arms": 36,
        "core": 24
    ]

    // Maps individual MuscleGroup cases to our broader recovery categories
    private static func recoveryCategory(for muscle: MuscleGroup) -> String {
        switch muscle {
        case .quads, .hamstrings, .glutes, .calves:
            return "legs"
        case .back, .traps:
            return "back"
        case .chest:
            return "chest"
        case .shoulders:
            return "shoulders"
        case .biceps, .triceps, .forearms:
            return "arms"
        case .core:
            return "core"
        }
    }

    /// Calculate current recovery status for all major muscle groups.
    static func calculateRecovery(store: WorkoutStore) -> [MuscleRecoveryStatus] {
        let now = Date()
        let categories = ["chest", "back", "shoulders", "arms", "legs", "core"]

        // Track last trained date and volume (total sets) per category
        var lastTrained: [String: Date] = [:]
        var totalSets: [String: Int] = [:]

        for workout in store.workoutHistory {
            for exercise in workout.exercises {
                guard let def = ExerciseLibrary.find(exercise.exerciseId) else { continue }

                let muscles = def.primaryMuscles + def.secondaryMuscles
                var seenCategories = Set<String>()
                for muscle in muscles {
                    let category = recoveryCategory(for: muscle)
                    guard !seenCategories.contains(category) else { continue }
                    seenCategories.insert(category)

                    // Only consider workouts from the last 7 days for fatigue tracking
                    let hoursAgo = now.timeIntervalSince(workout.date) / 3600
                    guard hoursAgo < 168 else { continue } // 7 days

                    // Update last trained date
                    if let existing = lastTrained[category] {
                        if workout.date > existing {
                            lastTrained[category] = workout.date
                        }
                    } else {
                        lastTrained[category] = workout.date
                    }

                    // Primary muscles get full set count, secondary get half
                    let isPrimary = def.primaryMuscles.contains(muscle)
                    let setCount = isPrimary ? exercise.sets.count : max(1, exercise.sets.count / 2)
                    totalSets[category, default: 0] += setCount
                }
            }
        }

        return categories.map { category in
            let baseRecoveryHours = recoveryHours[category] ?? 48
            let lastDate = lastTrained[category]
            let sets = totalSets[category] ?? 0

            let fatigue: Int
            if let lastDate = lastDate {
                let hoursElapsed = now.timeIntervalSince(lastDate) / 3600

                // Volume factor: more sets = longer recovery
                // Base recovery assumes ~9 sets; scale up for more volume
                let volumeMultiplier = max(1.0, Double(sets) / 9.0)
                let adjustedRecoveryHours = baseRecoveryHours * volumeMultiplier

                if hoursElapsed >= adjustedRecoveryHours {
                    fatigue = 0
                } else {
                    let remaining = 1.0 - (hoursElapsed / adjustedRecoveryHours)
                    fatigue = min(100, Int(remaining * 100))
                }
            } else {
                fatigue = 0
            }

            return MuscleRecoveryStatus(
                muscleGroup: category,
                lastTrainedDate: lastDate,
                estimatedRecoveryHours: baseRecoveryHours,
                fatigueLevel: fatigue
            )
        }
    }
}
