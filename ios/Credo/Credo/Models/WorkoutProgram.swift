import Foundation

struct WorkoutProgram: Codable, Identifiable {
    let id: String
    let name: String
    let shortDescription: String
    let description: String
    let daysPerWeek: Int
    let difficulty: String
    let focus: String
    let days: [WorkoutProgramDay]
    let progressionScheme: ProgressionScheme
}

struct WorkoutProgramDay: Codable, Identifiable {
    let id: String
    let label: String
    let muscleGroups: [String]
    let exercises: [WorkoutProgramExercise]
}

struct WorkoutProgramExercise: Codable, Identifiable {
    let id: String
    let sets: Int
    let repMin: Int
    let repMax: Int
    let restSeconds: Int
    let isOptional: Bool
    let supersetGroupId: String?
    let notes: String?
}

enum ProgressionScheme: String, Codable {
    case linearProgression
    case doubleProgression
    case undulating
}
