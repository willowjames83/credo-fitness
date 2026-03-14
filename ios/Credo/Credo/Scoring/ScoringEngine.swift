import Foundation

struct ScoringEngine {
    /// Placeholder until stability pillar is implemented.
    static let placeholderStabilityScore = 41

    static func getTierLabel(score: Int, domain: ScoreDomain) -> String {
        domain.tierLabel(for: score)
    }

    static func compositeScore(strength: Int, cardio: Int, stability: Int, nutrition: Int) -> Int {
        Int(round(
            Double(strength) * 0.3
            + Double(cardio) * 0.3
            + Double(stability) * 0.2
            + Double(nutrition) * 0.2
        ))
    }

    static func realStrengthScore(store: WorkoutStore) -> Int {
        StrengthScoreCalculator.calculate(store: store).weightedScore
    }
}
