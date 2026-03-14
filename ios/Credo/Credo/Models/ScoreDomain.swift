import Foundation

enum ScoreDomain: String, CaseIterable {
    case credo
    case strength
    case stability
    case cardio
    case nutrition

    var tiers: [(threshold: Int, label: String)] {
        switch self {
        case .credo:
            return [
                (81, "Credo-proof"),
                (61, "Thriving"),
                (41, "Progressing"),
                (21, "Building"),
                (0, "Starting"),
            ]
        case .strength:
            return [
                (81, "Exceptional"),
                (61, "Strong"),
                (41, "Solid"),
                (21, "Building"),
                (0, "Foundation"),
            ]
        case .stability:
            return [
                (81, "Resilient"),
                (61, "Capable"),
                (41, "Developing"),
                (21, "Inconsistent"),
                (0, "Neglected"),
            ]
        case .cardio:
            return [
                (81, "Elite"),
                (61, "Fit"),
                (41, "On track"),
                (21, "Below target"),
                (0, "At risk"),
            ]
        case .nutrition:
            return [
                (91, "Locked in"),
                (71, "Consistent"),
                (51, "Getting there"),
                (31, "Inconsistent"),
                (0, "Underfeeding"),
            ]
        }
    }

    func tierLabel(for score: Int) -> String {
        for tier in tiers {
            if score >= tier.threshold {
                return tier.label
            }
        }
        return tiers.last?.label ?? ""
    }
}
