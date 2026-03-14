import Foundation

struct ProgressionEngine {

    /// Epley formula: weight x (1 + reps / 30)
    static func estimated1RM(weight: Double, reps: Int) -> Double {
        guard reps > 0 else { return 0 }
        if reps == 1 { return weight }
        return weight * (1.0 + Double(reps) / 30.0)
    }

    /// RIR-based progression:
    /// - rir 0: same weight (at limit)
    /// - rir 1 (means 1-2 reps in reserve): +2.5% rounded to nearest increment
    /// - rir 3 (means 3+ reps in reserve): +5% rounded to nearest increment
    static func nextWeight(currentWeight: Double, rir: Int, increment: Double) -> Double {
        let effectiveIncrement = max(increment, 5)
        switch rir {
        case 0:
            return currentWeight
        case 1:
            let increased = currentWeight * 1.025
            return roundToNearest(increased, increment: effectiveIncrement)
        default:
            let increased = currentWeight * 1.05
            return roundToNearest(increased, increment: effectiveIncrement)
        }
    }

    /// Get recommended weight for an exercise based on workout history.
    /// If history exists, apply RIR-based progression from the last session.
    /// If no history, use the starting weight from ExerciseLibrary.
    static func recommendedWeight(for exerciseId: String, userWeight: Int, store: WorkoutStore) -> Double {
        guard let definition = ExerciseLibrary.find(exerciseId) else { return 0 }

        if let lastExercise = store.getLastWorkout(for: exerciseId),
           let lastSet = lastExercise.sets.last {
            return nextWeight(
                currentWeight: lastSet.weight,
                rir: lastExercise.rir,
                increment: definition.weightIncrement
            )
        }

        // Use personalized starting weight if user profile is available
        if let profile = store.userProfile {
            return ExerciseLibrary.startingWeight(for: definition, profile: profile)
        }

        return ExerciseLibrary.startingWeight(for: definition, userWeight: userWeight)
    }

    /// Round to nearest increment (usually 5 lbs).
    static func roundToNearest(_ weight: Double, increment: Double) -> Double {
        guard increment > 0 else { return weight }
        return round(weight / increment) * increment
    }

    /// Autoregulation: if reps achieved are 2+ below the target minimum,
    /// suggest reducing weight by 10%. Returns nil if no adjustment needed.
    static func autoregulateWeight(currentWeight: Double, repsAchieved: Int, targetMin: Int) -> Double? {
        guard repsAchieved < targetMin - 1 else { return nil }
        let reduced = currentWeight * 0.9
        return roundToNearest(reduced, increment: 5)
    }
}
