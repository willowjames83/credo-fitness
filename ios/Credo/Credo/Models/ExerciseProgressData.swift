import Foundation

struct ExerciseProgressPoint: Identifiable, Codable {
    var id: Date { date }
    let date: Date
    let weight: Double
    let estimated1RM: Double
    let reps: Int
    let rir: Int?
}

struct WeightSuggestion: Codable {
    let exerciseId: String
    let currentWeight: Double
    let suggestedWeight: Double
    let reason: String
    let confidence: Double // 0-1
}
