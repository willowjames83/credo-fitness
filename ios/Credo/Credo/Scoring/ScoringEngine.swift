import Foundation

struct ScoringEngine {
    static func getTierLabel(score: Int, domain: ScoreDomain) -> String {
        domain.tierLabel(for: score)
    }

    static func compositeScore(strength: Int, cardio: Int, stability: Int, nutrition: Int) -> Int {
        Int(round(
            Double(strength) * 0.35
            + Double(cardio) * 0.35
            + Double(stability) * 0.15
            + Double(nutrition) * 0.15
        ))
    }

    static func realStrengthScore(store: WorkoutStore) -> Int {
        StrengthScoreCalculator.calculate(store: store).weightedScore
    }
}
