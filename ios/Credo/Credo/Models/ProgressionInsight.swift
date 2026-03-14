import Foundation
import SwiftUI

enum InsightType: String, Codable, CaseIterable {
    case increase
    case deload
    case plateau
    case newPR
    case milestone

    var icon: String {
        switch self {
        case .increase:  return "arrow.up.circle.fill"
        case .deload:    return "arrow.down.circle.fill"
        case .plateau:   return "equal.circle.fill"
        case .newPR:     return "flame.fill"
        case .milestone: return "star.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .increase:  return CredoColors.success
        case .deload:    return CredoColors.warning
        case .plateau:   return CredoColors.danger
        case .newPR:     return CredoColors.accent
        case .milestone: return CredoColors.teal
        }
    }

    var label: String {
        switch self {
        case .increase:  return "Ready to Increase"
        case .deload:    return "Deload Suggested"
        case .plateau:   return "Plateau Detected"
        case .newPR:     return "New PR"
        case .milestone: return "Milestone"
        }
    }

    /// Priority for sorting: lower = more actionable = shown first
    var priority: Int {
        switch self {
        case .newPR:     return 0
        case .increase:  return 1
        case .deload:    return 2
        case .plateau:   return 3
        case .milestone: return 4
        }
    }
}

struct ProgressionInsight: Identifiable, Codable {
    let id: UUID
    let exerciseId: String
    let exerciseName: String
    let type: InsightType
    let suggestedWeight: Double?
    let currentWeight: Double?
    let message: String
    let detail: String
    let date: Date

    init(
        id: UUID = UUID(),
        exerciseId: String,
        exerciseName: String,
        type: InsightType,
        suggestedWeight: Double? = nil,
        currentWeight: Double? = nil,
        message: String,
        detail: String,
        date: Date = Date()
    ) {
        self.id = id
        self.exerciseId = exerciseId
        self.exerciseName = exerciseName
        self.type = type
        self.suggestedWeight = suggestedWeight
        self.currentWeight = currentWeight
        self.message = message
        self.detail = detail
        self.date = date
    }
}
