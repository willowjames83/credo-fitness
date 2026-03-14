import SwiftUI

// MARK: - Aspect Ratio

enum AspectRatio: String, CaseIterable, Identifiable {
    case square
    case story

    var id: String { rawValue }

    var size: CGSize {
        switch self {
        case .square: return CGSize(width: 1080, height: 1080)
        case .story: return CGSize(width: 1080, height: 1920)
        }
    }

    var label: String {
        switch self {
        case .square: return "Square"
        case .story: return "Story"
        }
    }
}

// MARK: - Shareable Content

enum ShareableContent {
    case personalRecord(
        exerciseName: String,
        weight: Double,
        reps: Int,
        estimated1RM: Double,
        date: Date
    )
    case workoutSummary(CompletedWorkout)
    case credoScore(
        score: Int,
        pillars: [(name: String, score: Int)]
    )
}
