import Foundation
import SwiftUI

enum TimeRange: String, CaseIterable {
    case fourWeeks = "4 Weeks"
    case eightWeeks = "8 Weeks"
    case twelveWeeks = "12 Weeks"
    case allTime = "All Time"

    var weekCount: Int? {
        switch self {
        case .fourWeeks: return 4
        case .eightWeeks: return 8
        case .twelveWeeks: return 12
        case .allTime: return nil
        }
    }
}

struct ChartDataPoint: Identifiable {
    let id = UUID()
    let week: Int
    let score: Int
    let label: String
}

struct PillarDelta {
    let current: Int
    let change: Int
}

@Observable
class TrendsViewModel {
    var selectedRange: TimeRange = .fourWeeks

    private var store: WorkoutStore { WorkoutStore.shared }

    // MARK: - Filtered Snapshots

    var filteredSnapshots: [WeeklyScoreSnapshot] {
        let all = store.scoreHistory.sorted { $0.date < $1.date }
        guard let limit = selectedRange.weekCount else { return all }
        return Array(all.suffix(limit))
    }

    var hasData: Bool {
        !store.scoreHistory.isEmpty
    }

    // MARK: - Composite Data

    var compositeData: [ChartDataPoint] {
        filteredSnapshots.enumerated().map { index, snapshot in
            ChartDataPoint(
                week: index + 1,
                score: snapshot.credoScore,
                label: "W\(index + 1)"
            )
        }
    }

    // MARK: - Pillar Data

    func pillarData(for pillar: Pillar) -> [ChartDataPoint] {
        filteredSnapshots.enumerated().map { index, snapshot in
            let score: Int
            switch pillar {
            case .strength: score = snapshot.strengthScore
            case .stability: score = snapshot.stabilityScore
            case .cardio: score = snapshot.cardioScore
            case .nutrition: score = snapshot.nutritionScore
            }
            return ChartDataPoint(
                week: index + 1,
                score: score,
                label: "W\(index + 1)"
            )
        }
    }

    func pillarScore(for pillar: Pillar, from snapshot: WeeklyScoreSnapshot) -> Int {
        switch pillar {
        case .strength: return snapshot.strengthScore
        case .stability: return snapshot.stabilityScore
        case .cardio: return snapshot.cardioScore
        case .nutrition: return snapshot.nutritionScore
        }
    }

    // MARK: - Current Scores

    var currentCompositeScore: Int {
        filteredSnapshots.last?.credoScore ?? 0
    }

    func currentScore(for pillar: Pillar) -> Int {
        guard let last = filteredSnapshots.last else { return 0 }
        return pillarScore(for: pillar, from: last)
    }

    // MARK: - Deltas

    func delta(for pillar: Pillar) -> PillarDelta {
        let snapshots = filteredSnapshots
        let current = snapshots.last.map { pillarScore(for: pillar, from: $0) } ?? 0
        let start = snapshots.first.map { pillarScore(for: pillar, from: $0) } ?? 0
        return PillarDelta(current: current, change: current - start)
    }

    var compositeDelta: Int {
        let snapshots = filteredSnapshots
        let current = snapshots.last?.credoScore ?? 0
        let start = snapshots.first?.credoScore ?? 0
        return current - start
    }

    // MARK: - Weekly Comparison

    var thisWeekScores: [Pillar: Int] {
        guard let last = store.scoreHistory.sorted(by: { $0.date < $1.date }).last else {
            return Dictionary(uniqueKeysWithValues: Pillar.allCases.map { ($0, 0) })
        }
        return [
            .strength: last.strengthScore,
            .stability: last.stabilityScore,
            .cardio: last.cardioScore,
            .nutrition: last.nutritionScore
        ]
    }

    var lastWeekScores: [Pillar: Int] {
        let sorted = store.scoreHistory.sorted { $0.date < $1.date }
        guard sorted.count >= 2 else {
            return Dictionary(uniqueKeysWithValues: Pillar.allCases.map { ($0, 0) })
        }
        let prev = sorted[sorted.count - 2]
        return [
            .strength: prev.strengthScore,
            .stability: prev.stabilityScore,
            .cardio: prev.cardioScore,
            .nutrition: prev.nutritionScore
        ]
    }
}
