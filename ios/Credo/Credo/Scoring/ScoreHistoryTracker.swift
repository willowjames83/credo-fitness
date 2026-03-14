import Foundation

struct WeeklyScoreSnapshot: Codable {
    let weekNumber: Int
    let date: Date
    let credoScore: Int
    let strengthScore: Int
    let stabilityScore: Int
    let cardioScore: Int
    let nutritionScore: Int
}
