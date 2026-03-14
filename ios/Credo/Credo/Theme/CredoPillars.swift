import SwiftUI

enum Pillar: String, CaseIterable, Codable {
    case strength
    case stability
    case cardio
    case nutrition

    var label: String {
        switch self {
        case .strength: return "Strength"
        case .stability: return "Stability"
        case .cardio: return "Cardio"
        case .nutrition: return "Nutrition"
        }
    }

    var color: Color {
        switch self {
        case .strength: return CredoColors.accent
        case .stability: return CredoColors.teal
        case .cardio: return CredoColors.cardio
        case .nutrition: return CredoColors.nutrition
        }
    }

    var bgColor: Color {
        switch self {
        case .strength: return CredoColors.accentLight
        case .stability: return CredoColors.tealLight
        case .cardio: return CredoColors.cardioLight
        case .nutrition: return CredoColors.nutritionLight
        }
    }

    var iconName: String {
        switch self {
        case .strength: return "hexagon.fill"
        case .stability: return "target"
        case .cardio: return "waveform.path.ecg"
        case .nutrition: return "fork.knife"
        }
    }

    var weight: Double {
        switch self {
        case .strength: return 0.3
        case .stability: return 0.2
        case .cardio: return 0.3
        case .nutrition: return 0.2
        }
    }

    var scoreDomain: ScoreDomain {
        switch self {
        case .strength: return .strength
        case .stability: return .stability
        case .cardio: return .cardio
        case .nutrition: return .nutrition
        }
    }
}
