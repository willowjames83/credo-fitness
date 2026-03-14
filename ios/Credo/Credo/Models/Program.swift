import Foundation

enum ProgramTemplate: String, Codable, CaseIterable, Identifiable {
    case pushPullLegs3 = "ppl3"
    case upperLowerFull3 = "ulf3"
    case pushPullLegsFull4 = "pplf4"
    case pushPullLegsUpperLower5 = "pplul5"
    case fullBody2 = "fb2"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .pushPullLegs3: return "Push / Pull / Legs"
        case .upperLowerFull3: return "Upper / Lower / Full"
        case .pushPullLegsFull4: return "Push / Pull / Legs / Full"
        case .pushPullLegsUpperLower5: return "PPL + Upper / Lower"
        case .fullBody2: return "Full Body"
        }
    }

    var subtitle: String {
        switch self {
        case .pushPullLegs3: return "3 days/week \u{00B7} All Levels"
        case .upperLowerFull3: return "3 days/week \u{00B7} All Levels"
        case .pushPullLegsFull4: return "4 days/week \u{00B7} Intermediate & Advanced"
        case .pushPullLegsUpperLower5: return "5 days/week \u{00B7} Advanced"
        case .fullBody2: return "2 days/week \u{00B7} All Levels"
        }
    }

    var daysPerWeek: Int {
        switch self {
        case .pushPullLegs3: return 3
        case .upperLowerFull3: return 3
        case .pushPullLegsFull4: return 4
        case .pushPullLegsUpperLower5: return 5
        case .fullBody2: return 2
        }
    }

    var dayLabels: [String] {
        switch self {
        case .pushPullLegs3: return ["Push", "Pull", "Legs"]
        case .upperLowerFull3: return ["Upper", "Lower", "Full"]
        case .pushPullLegsFull4: return ["Push", "Pull", "Legs", "Full"]
        case .pushPullLegsUpperLower5: return ["Push", "Pull", "Legs", "Upper", "Lower"]
        case .fullBody2: return ["Day 1", "Day 2"]
        }
    }

    var levelRequirement: String {
        switch self {
        case .pushPullLegs3, .upperLowerFull3, .fullBody2: return "All Levels"
        case .pushPullLegsFull4: return "Intermediate & Advanced"
        case .pushPullLegsUpperLower5: return "Advanced"
        }
    }
}

struct ProgramDay: Codable, Identifiable {
    let id: Int
    let label: String
    let exercises: [ProgramExercise]
}

struct ProgramExercise: Codable, Identifiable {
    let id: String
    let order: Int
    let targetSets: Int
    let targetRepMin: Int
    let targetRepMax: Int
    let recommendedWeight: Double
    let restSeconds: Int
}
