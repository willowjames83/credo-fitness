import Foundation

struct WorkoutSet: Identifiable, Codable {
    let id: Int  // set number (1-based for working, negative for warmup)
    var weight: Double
    var reps: Int?
    var completed: Bool
    var isWarmup: Bool = false
}

struct ActiveExercise: Identifiable {
    let id: String  // exerciseId from library
    let name: String
    let muscleGroup: String
    let targetSets: Int
    let targetRepMin: Int
    let targetRepMax: Int
    let recommendedWeight: Double
    let restSeconds: Int
    let previousSession: String?  // formatted string of last session
    let formCues: [String]
    let isBodyweight: Bool
    let isPerSide: Bool
    let weightIncrement: Double
    var sets: [WorkoutSet]
    var supersetGroupId: UUID? = nil

    var setsTarget: String {
        if targetRepMin == targetRepMax {
            return "\(targetSets) × \(targetRepMin)"
        }
        return "\(targetSets) × \(targetRepMin)-\(targetRepMax)"
    }
}

struct ActiveWorkoutSession {
    let programTemplate: String
    let dayIndex: Int
    let dayLabel: String
    let week: Int
    var exercises: [ActiveExercise]
    var currentExerciseIndex: Int = 0
    let startTime: Date
    var supersetGroups: [SupersetGroup] = []

    var currentExercise: ActiveExercise? {
        guard currentExerciseIndex < exercises.count else { return nil }
        return exercises[currentExerciseIndex]
    }

    var upcomingExercises: [ActiveExercise] {
        guard currentExerciseIndex + 1 < exercises.count else { return [] }
        return Array(exercises[(currentExerciseIndex + 1)...])
    }

    var totalExercises: Int { exercises.count }
    var isComplete: Bool { currentExerciseIndex >= exercises.count }
}
