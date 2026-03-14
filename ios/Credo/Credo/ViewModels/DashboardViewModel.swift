import SwiftUI

@Observable
class DashboardViewModel {
    let user = mockUser
    let store = WorkoutStore.shared

    // MARK: - Computed Scores (real strength, mock others)

    var strengthSubscores: StrengthSubscores {
        StrengthScoreCalculator.calculate(store: store)
    }

    var credoScore: CredoScore {
        let strength = strengthSubscores.weightedScore
        let stability = 41
        let cardio = 76
        let nutrition = 85
        let composite = ScoringEngine.compositeScore(
            strength: strength,
            cardio: cardio,
            stability: stability,
            nutrition: nutrition
        )
        let delta: Int
        if let previous = store.scoreHistory.dropLast().last {
            delta = composite - previous.credoScore
        } else {
            delta = 0
        }
        return CredoScore(score: composite, delta: delta)
    }

    var pillarScores: [Pillar: PillarScore] {
        let strength = strengthSubscores
        let strengthScore = strength.weightedScore

        let sessionsThisWeek = store.completedWorkoutsThisWeek().count
        let totalDays = store.selectedProgram?.daysPerWeek ?? 3
        let totalVolume = store.completedWorkoutsThisWeek().reduce(0.0) { total, workout in
            total + workout.exercises.reduce(0.0) { exTotal, exercise in
                exTotal + exercise.sets.reduce(0.0) { $0 + $1.weight * Double($1.reps) }
            }
        }
        let volumeStr = totalVolume > 0
            ? "\(Int(totalVolume).formatted()) lbs total volume"
            : "No volume logged"

        let weakest: Pillar = {
            let scores: [(Pillar, Int)] = [
                (.strength, strengthScore),
                (.stability, 41),
                (.cardio, 76),
                (.nutrition, 85)
            ]
            return scores.min(by: { $0.1 < $1.1 })?.0 ?? .stability
        }()

        return [
            .strength: PillarScore(
                score: strengthScore,
                metrics: [
                    "\(sessionsThisWeek) of \(totalDays) sessions done",
                    volumeStr
                ],
                isWeakest: weakest == .strength
            ),
            .stability: PillarScore(
                score: 41,
                metrics: ["2 of 3 warmups complete", "Hip mobility focus next"],
                isWeakest: weakest == .stability
            ),
            .cardio: PillarScore(
                score: 76,
                metrics: ["Zone 2: 120 / 180 min", "VO\u{2082} max: 42 ml/kg/min"],
                isWeakest: weakest == .cardio
            ),
            .nutrition: PillarScore(
                score: 85,
                metrics: ["168g / 180g protein today", "5 of 7 days on target"],
                isWeakest: weakest == .nutrition
            ),
        ]
    }

    var scoreHistory: [ScoreHistoryEntry] {
        // Convert real snapshots to ScoreHistoryEntry
        var entries: [ScoreHistoryEntry] = store.scoreHistory.map { snapshot in
            ScoreHistoryEntry(
                week: snapshot.weekNumber,
                credo: snapshot.credoScore,
                strength: snapshot.strengthScore,
                stability: snapshot.stabilityScore,
                cardio: snapshot.cardioScore,
                nutrition: snapshot.nutritionScore
            )
        }

        // If we have fewer than 4 entries, pad with mock data for chart display
        if entries.count < 4 {
            entries = mockScoreHistory
        }

        return entries
    }

    /// Whether we have real workout data to display scores.
    var hasWorkoutData: Bool {
        !store.workoutHistory.isEmpty
    }

    /// Current muscle recovery status computed on-demand from workout history.
    var muscleRecoveryStatuses: [MuscleRecoveryStatus] {
        RecoveryEngine.calculateRecovery(store: store)
    }

    // MARK: - Workout Info

    var todayWorkoutName: String {
        guard let program = store.selectedProgram else { return "No program selected" }
        let userWeight = store.userProfile?.weight ?? user.weight
        let days = ProgramGenerator.generateDays(for: program, userWeight: userWeight)
        let dayIndex = store.currentDayIndex % days.count
        return days[dayIndex].label
    }

    var todayWorkoutDetail: String {
        guard let program = store.selectedProgram else { return "Choose a training program" }
        let userWeight = store.userProfile?.weight ?? user.weight
        let days = ProgramGenerator.generateDays(for: program, userWeight: userWeight)
        let dayIndex = store.currentDayIndex % days.count
        return "\(days[dayIndex].exercises.count) exercises \u{00B7} ~\(days[dayIndex].exercises.count * 8) min"
    }

    var todayWorkoutSubtitle: String {
        guard let program = store.selectedProgram else { return "" }
        return "Week \(store.currentWeek) \u{00B7} Day \(store.currentDayIndex + 1) of \(program.daysPerWeek)"
    }

    var weekProgress: [Bool] {
        store.weekProgressBooleans()
    }

    var hasProgramSelected: Bool { store.selectedProgram != nil }
}
