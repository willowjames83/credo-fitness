import Foundation

struct MobilitySession: Codable, Identifiable {
    let id: UUID
    let date: Date
    let durationSeconds: Int
    let type: MobilityType

    var durationMinutes: Int {
        durationSeconds / 60
    }
}

enum MobilityType: String, Codable, CaseIterable {
    case warmup
    case stretch
    case foamRoll = "foam_roll"
    case yoga

    var displayName: String {
        switch self {
        case .warmup: return "Warm-Up"
        case .stretch: return "Stretching"
        case .foamRoll: return "Foam Rolling"
        case .yoga: return "Yoga"
        }
    }

    var icon: String {
        switch self {
        case .warmup: return "flame"
        case .stretch: return "figure.flexibility"
        case .foamRoll: return "circle.grid.cross"
        case .yoga: return "figure.mind.and.body"
        }
    }
}
